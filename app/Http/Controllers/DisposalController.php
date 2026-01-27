<?php

namespace App\Http\Controllers;

use App\Models\CentralStock;
use App\Models\Linen;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DisposalController extends Controller
{
    /**
     * Display the disposal (afkir) page.
     */
    public function index()
    {
        // Get all central stocks with clean items (only clean items can be disposed)
        $stocks = CentralStock::with('linen.category')
            ->where('clean_qty', '>', 0)
            ->get();

        return Inertia::render('Produksi/Afkir/Index', [
            'stocks' => $stocks,
        ]);
    }

    /**
     * Store a new disposal transaction.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.linen_id' => 'required|exists:linens,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // Create transaction record
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_DISPOSAL),
                'type' => Transaction::TYPE_DISPOSAL,
                'room_id' => null, // Internal process
                'user_id' => auth()->id(),
                'trx_date' => now()->toDateString(),
                'notes' => $validated['notes'] ?? null,
            ]);

            $disposedItems = [];

            foreach ($validated['items'] as $item) {
                $centralStock = CentralStock::where('linen_id', $item['linen_id'])->first();
                
                if (!$centralStock || $centralStock->clean_qty < $item['qty']) {
                    throw new \Exception("Stok bersih tidak mencukupi untuk linen ID: {$item['linen_id']}");
                }

                $linen = Linen::find($item['linen_id']);

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $item['linen_id'],
                    'qty' => $item['qty'],
                ]);

                // Decrease clean stock (permanent removal)
                $centralStock->decrement('clean_qty', $item['qty']);

                $disposedItems[] = "{$linen->name} ({$item['qty']} pcs) - {$item['reason']}";
            }

            DB::commit();

            ActivityLogger::logCreated('Transaction', $transaction->id, 
                "Afkir linen: {$transaction->trx_code}. Items: " . implode(', ', $disposedItems));

            return redirect()->route('disposal.index')
                ->with('success', "Transaksi afkir {$transaction->trx_code} berhasil disimpan.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('disposal.index')
                ->with('error', 'Gagal menyimpan transaksi afkir: ' . $e->getMessage());
        }
    }

    /**
     * Display disposal history.
     */
    public function history(Request $request)
    {
        $query = Transaction::with(['user', 'details.linen'])
            ->where('type', Transaction::TYPE_DISPOSAL)
            ->orderBy('created_at', 'desc');

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('trx_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('trx_date', '<=', $request->date_to);
        }

        $transactions = $query->paginate(10)->withQueryString();

        return Inertia::render('Produksi/Afkir/History', [
            'transactions' => $transactions,
            'filters' => [
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }
}
