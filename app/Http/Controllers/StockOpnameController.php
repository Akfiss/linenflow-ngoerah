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

class StockOpnameController extends Controller
{
    /**
     * Display the stock opname page.
     */
    public function index(Request $request)
    {
        // Get all central stocks with linen info
        $stocks = CentralStock::with('linen.category')
            ->orderBy('id')
            ->get()
            ->map(function ($stock) {
                return [
                    'id' => $stock->id,
                    'linen_id' => $stock->linen_id,
                    'linen_name' => $stock->linen->name,
                    'sku_code' => $stock->linen->sku_code,
                    'category' => $stock->linen->category->name ?? '-',
                    'system_clean' => $stock->clean_qty,
                    'system_dirty' => $stock->dirty_qty,
                    'system_washing' => $stock->washing_qty,
                    'system_total' => $stock->clean_qty + $stock->dirty_qty + $stock->washing_qty,
                ];
            });

        // Get recent opname history
        $opnameHistory = Transaction::where('type', Transaction::TYPE_ADJUSTMENT)
            ->with(['user', 'details.linen'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Inventaris/Opname/Index', [
            'stocks' => $stocks,
            'opnameHistory' => $opnameHistory,
        ]);
    }

    /**
     * Submit stock opname adjustments.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'adjustments' => 'required|array|min:1',
            'adjustments.*.linen_id' => 'required|exists:linens,id',
            'adjustments.*.physical_clean' => 'required|integer|min:0',
            'adjustments.*.physical_dirty' => 'required|integer|min:0',
            'adjustments.*.physical_washing' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // Create adjustment transaction
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_ADJUSTMENT),
                'type' => Transaction::TYPE_ADJUSTMENT,
                'room_id' => null,
                'user_id' => auth()->id(),
                'trx_date' => now()->toDateString(),
                'notes' => $validated['notes'] ?? 'Stock Opname ' . now()->format('d/m/Y H:i'),
                'status' => 'confirmed',
            ]);

            $totalAdjustments = 0;

            foreach ($validated['adjustments'] as $adj) {
                $centralStock = CentralStock::where('linen_id', $adj['linen_id'])->first();
                
                if (!$centralStock) {
                    continue;
                }

                // Calculate differences
                $cleanDiff = $adj['physical_clean'] - $centralStock->clean_qty;
                $dirtyDiff = $adj['physical_dirty'] - $centralStock->dirty_qty;
                $washingDiff = $adj['physical_washing'] - $centralStock->washing_qty;
                $totalDiff = $cleanDiff + $dirtyDiff + $washingDiff;

                // Only record if there's a difference
                if ($totalDiff != 0) {
                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'linen_id' => $adj['linen_id'],
                        'qty' => $totalDiff, // Positive = tambah, Negative = kurang
                    ]);

                    // Update central stock
                    $centralStock->update([
                        'clean_qty' => $adj['physical_clean'],
                        'dirty_qty' => $adj['physical_dirty'],
                        'washing_qty' => $adj['physical_washing'],
                    ]);

                    $totalAdjustments++;
                }
            }

            DB::commit();

            ActivityLogger::logCreated('Transaction', $transaction->id,
                "Stock Opname: {$totalAdjustments} item disesuaikan");

            return redirect()->route('inventaris.opname')
                ->with('success', "Stock opname berhasil. {$totalAdjustments} item disesuaikan.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('inventaris.opname')
                ->with('error', 'Gagal menyimpan stock opname: ' . $e->getMessage());
        }
    }

    /**
     * Get opname history.
     */
    public function history(Request $request)
    {
        $query = Transaction::where('type', Transaction::TYPE_ADJUSTMENT)
            ->with(['user', 'details.linen'])
            ->orderBy('created_at', 'desc');

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('trx_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('trx_date', '<=', $request->date_to);
        }

        $transactions = $query->paginate(10)->withQueryString();

        return Inertia::render('Inventaris/Opname/History', [
            'transactions' => $transactions,
            'filters' => [
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }
}
