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

class CollectionController extends Controller
{
    /**
     * Display the collection (dirty linen) input page.
     */
    public function index()
    {
        $rooms = Room::orderBy('name')->get();
        $linens = Linen::with('centralStock')->orderBy('name')->get();

        return Inertia::render('Sirkulasi/Penerimaan/Index', [
            'rooms' => $rooms,
            'linens' => $linens,
        ]);
    }

    /**
     * Get current stock for a specific room.
     */
    public function getRoomStock(Room $room)
    {
        $roomStocks = RoomStock::with('linen')
            ->where('room_id', $room->id)
            ->where('current_qty', '>', 0)
            ->get();

        return response()->json([
            'room' => $room,
            'stocks' => $roomStocks,
        ]);
    }

    /**
     * Store a new collection transaction (dirty linen from room).
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
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_IN_COLLECTION),
                'type' => Transaction::TYPE_IN_COLLECTION,
                'room_id' => $validated['room_id'],
                'user_id' => auth()->id(),
                'trx_date' => now()->toDateString(),
                'notes' => $validated['notes'] ?? null,
            ]);

            $room = Room::find($validated['room_id']);

            foreach ($validated['items'] as $item) {
                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $item['linen_id'],
                    'qty' => $item['qty'],
                ]);

                // Decrease room stock
                $roomStock = RoomStock::where('room_id', $validated['room_id'])
                    ->where('linen_id', $item['linen_id'])
                    ->first();

                if ($roomStock) {
                    $roomStock->decrement('current_qty', $item['qty']);
                }

                // Increase central dirty stock
                $centralStock = CentralStock::firstOrCreate(
                    ['linen_id' => $item['linen_id']],
                    ['clean_qty' => 0, 'dirty_qty' => 0, 'washing_qty' => 0]
                );
                $centralStock->increment('dirty_qty', $item['qty']);
            }

            DB::commit();

            // Log the activity
            ActivityLogger::logCreated('Transaction', $transaction->id, 
                "Penerimaan kotor dari {$room->name}: {$transaction->trx_code}");

            return redirect()->route('collection.index')
                ->with('success', "Transaksi {$transaction->trx_code} berhasil disimpan.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('collection.index')
                ->with('error', 'Gagal menyimpan transaksi: ' . $e->getMessage());
        }
    }

    /**
     * Display collection history.
     */
    public function history(Request $request)
    {
        $query = Transaction::with(['room', 'user', 'details.linen'])
            ->where('type', Transaction::TYPE_IN_COLLECTION)
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

        return Inertia::render('Sirkulasi/Penerimaan/History', [
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
