<?php

namespace App\Http\Controllers;

use App\Models\CentralStock;
use App\Models\Linen;
use App\Models\Room;
use App\Models\RoomStock;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DistributionController extends Controller
{
    /**
     * Display the distribution (clean linen) page.
     */
    public function index()
    {
        $rooms = Room::orderBy('name')->get();
        
        // Get all central stocks with clean items
        $stocks = CentralStock::with('linen.category')
            ->where('clean_qty', '>', 0)
            ->get();

        return Inertia::render('Sirkulasi/Distribusi/Index', [
            'rooms' => $rooms,
            'stocks' => $stocks,
        ]);
    }

    /**
     * Store a new distribution transaction (clean linen to room).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'items' => 'required|array|min:1',
            'items.*.linen_id' => 'required|exists:linens,id',
            'items.*.qty' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // Create transaction record
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_OUT_DISTRIBUTION),
                'type' => Transaction::TYPE_OUT_DISTRIBUTION,
                'room_id' => $validated['room_id'],
                'user_id' => auth()->id(),
                'trx_date' => now()->toDateString(),
                'notes' => $validated['notes'] ?? null,
            ]);

            $room = Room::find($validated['room_id']);

            foreach ($validated['items'] as $item) {
                $centralStock = CentralStock::where('linen_id', $item['linen_id'])->first();
                
                if (!$centralStock || $centralStock->clean_qty < $item['qty']) {
                    throw new \Exception("Stok bersih tidak mencukupi untuk linen ID: {$item['linen_id']}");
                }

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $item['linen_id'],
                    'qty' => $item['qty'],
                ]);

                // Decrease central clean stock
                $centralStock->decrement('clean_qty', $item['qty']);

                // Increase room stock (create if not exists)
                $roomStock = RoomStock::firstOrCreate(
                    [
                        'room_id' => $validated['room_id'],
                        'linen_id' => $item['linen_id'],
                    ],
                    [
                        'current_qty' => 0,
                        'par_stock' => 0,
                    ]
                );
                $roomStock->increment('current_qty', $item['qty']);
            }

            DB::commit();

            // Log the activity
            ActivityLogger::logCreated('Transaction', $transaction->id, 
                "Distribusi bersih ke {$room->name}: {$transaction->trx_code}");

            return redirect()->route('distribution.index')
                ->with('success', "Transaksi {$transaction->trx_code} berhasil disimpan.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('distribution.index')
                ->with('error', 'Gagal menyimpan transaksi: ' . $e->getMessage());
        }
    }

    /**
     * Display distribution history.
     */
    public function history(Request $request)
    {
        $query = Transaction::with(['room', 'user', 'details.linen'])
            ->where('type', Transaction::TYPE_OUT_DISTRIBUTION)
            ->orderBy('created_at', 'desc');

        if ($request->has('room_id') && $request->room_id) {
            $query->where('room_id', $request->room_id);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('trx_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('trx_date', '<=', $request->date_to);
        }

        $transactions = $query->paginate(10)->withQueryString();
        $rooms = Room::orderBy('name')->get();

        return Inertia::render('Sirkulasi/Distribusi/History', [
            'transactions' => $transactions,
            'rooms' => $rooms,
            'filters' => [
                'room_id' => $request->room_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }
}
