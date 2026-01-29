<?php

namespace App\Http\Controllers;

use App\Models\CentralStock;
use App\Models\Linen;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\WashLog;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WashingController extends Controller
{
    /**
     * Display the washing process page.
     */
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        
        // Get all central stocks with dirty or washing items
        $query = CentralStock::with('linen.category')
            ->where(function ($q) {
                $q->where('dirty_qty', '>', 0)
                    ->orWhere('washing_qty', '>', 0);
            });
        
        // Apply search filter
        if ($search) {
            $query->whereHas('linen', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku_code', 'like', "%{$search}%");
            });
        }
        
        $stocks = $query->get();
        
        // Get recent wash logs for history display
        $washLogs = WashLog::with(['linen', 'user'])
            ->orderBy('logged_at', 'desc')
            ->limit(20)
            ->get();

        return Inertia::render('Produksi/Cuci/Index', [
            'stocks' => $stocks,
            'washLogs' => $washLogs,
            'filters' => ['search' => $search],
        ]);
    }

    /**
     * Start washing process (move dirty to washing).
     */
    public function startWash(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.linen_id' => 'required|exists:linens,id',
            'items.*.qty' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // Create transaction record
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_WASH_START),
                'type' => Transaction::TYPE_WASH_START,
                'room_id' => null, // Internal process
                'user_id' => auth()->id(),
                'trx_date' => now()->toDateString(),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $centralStock = CentralStock::where('linen_id', $item['linen_id'])->first();
                
                if (!$centralStock || $centralStock->dirty_qty < $item['qty']) {
                    throw new \Exception("Stok kotor tidak mencukupi untuk linen ID: {$item['linen_id']}");
                }

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $item['linen_id'],
                    'qty' => $item['qty'],
                ]);

                // Move from dirty to washing
                $centralStock->decrement('dirty_qty', $item['qty']);
                $centralStock->increment('washing_qty', $item['qty']);
                
                // Log wash start timestamp
                WashLog::create([
                    'linen_id' => $item['linen_id'],
                    'central_stock_id' => $centralStock->id,
                    'qty' => $item['qty'],
                    'action' => WashLog::ACTION_START,
                    'logged_at' => now(),
                    'user_id' => auth()->id(),
                ]);
            }

            DB::commit();

            ActivityLogger::logCreated('Transaction', $transaction->id, 
                "Mulai cuci: {$transaction->trx_code}");

            return redirect()->route('washing.index')
                ->with('success', "Proses cuci {$transaction->trx_code} dimulai.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('washing.index')
                ->with('error', 'Gagal memulai proses cuci: ' . $e->getMessage());
        }
    }

    /**
     * Finish washing process (move washing to clean).
     */
    public function finishWash(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.linen_id' => 'required|exists:linens,id',
            'items.*.qty' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // Create transaction record
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_WASH_FINISH),
                'type' => Transaction::TYPE_WASH_FINISH,
                'room_id' => null, // Internal process
                'user_id' => auth()->id(),
                'trx_date' => now()->toDateString(),
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $item) {
                $centralStock = CentralStock::where('linen_id', $item['linen_id'])->first();
                
                if (!$centralStock || $centralStock->washing_qty < $item['qty']) {
                    throw new \Exception("Stok cuci tidak mencukupi untuk linen ID: {$item['linen_id']}");
                }

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $item['linen_id'],
                    'qty' => $item['qty'],
                ]);

                // Move from washing to clean
                $centralStock->decrement('washing_qty', $item['qty']);
                $centralStock->increment('clean_qty', $item['qty']);
                
                // Log wash finish timestamp
                WashLog::create([
                    'linen_id' => $item['linen_id'],
                    'central_stock_id' => $centralStock->id,
                    'qty' => $item['qty'],
                    'action' => WashLog::ACTION_FINISH,
                    'logged_at' => now(),
                    'user_id' => auth()->id(),
                ]);
            }

            DB::commit();

            ActivityLogger::logCreated('Transaction', $transaction->id, 
                "Selesai cuci: {$transaction->trx_code}");

            return redirect()->route('washing.index')
                ->with('success', "Proses cuci {$transaction->trx_code} selesai.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            return redirect()->route('washing.index')
                ->with('error', 'Gagal menyelesaikan proses cuci: ' . $e->getMessage());
        }
    }

    /**
     * Display washing history.
     */
    public function history(Request $request)
    {
        $query = Transaction::with(['user', 'details.linen'])
            ->whereIn('type', [Transaction::TYPE_WASH_START, Transaction::TYPE_WASH_FINISH])
            ->orderBy('created_at', 'desc');

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('trx_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('trx_date', '<=', $request->date_to);
        }

        $transactions = $query->paginate(10)->withQueryString();

        return Inertia::render('Produksi/Cuci/History', [
            'transactions' => $transactions,
            'filters' => [
                'type' => $request->type,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }
}
