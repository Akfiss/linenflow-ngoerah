<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Transaction;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ConfirmationController extends Controller
{
    /**
     * Display pending distributions for the nurse's room.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Get pending distributions for the nurse's assigned room
        $query = Transaction::with(['room', 'user', 'details.linen'])
            ->where('type', Transaction::TYPE_OUT_DISTRIBUTION)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc');
        
        // Filter by room if nurse has assigned room
        if ($user->room_id) {
            $query->where('room_id', $user->room_id);
        }

        $pendingTransactions = $query->paginate(10)->withQueryString();

        // Get confirmed transactions for history
        $confirmedQuery = Transaction::with(['room', 'user', 'details.linen'])
            ->where('type', Transaction::TYPE_OUT_DISTRIBUTION)
            ->where('status', 'confirmed')
            ->orderBy('confirmed_at', 'desc');
            
        if ($user->room_id) {
            $confirmedQuery->where('room_id', $user->room_id);
        }
        
        $confirmedTransactions = $confirmedQuery->limit(10)->get();

        return Inertia::render('Sirkulasi/Konfirmasi/Index', [
            'pendingTransactions' => $pendingTransactions,
            'confirmedTransactions' => $confirmedTransactions,
            'userRoom' => $user->room,
        ]);
    }

    /**
     * Confirm receipt of a distribution.
     */
    public function confirm(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'confirmed_items' => 'required|array|min:1',
            'confirmed_items.*.linen_id' => 'required|exists:linens,id',
            'confirmed_items.*.qty_received' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        // Check if this is a distribution transaction
        if ($transaction->type !== Transaction::TYPE_OUT_DISTRIBUTION) {
            return back()->with('error', 'Transaksi ini bukan distribusi.');
        }

        // Check if already confirmed
        if ($transaction->status === 'confirmed') {
            return back()->with('error', 'Transaksi ini sudah dikonfirmasi.');
        }

        DB::beginTransaction();

        try {
            // Update transaction status
            $transaction->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
                'confirmed_by' => auth()->id(),
                'confirmation_notes' => $validated['notes'] ?? null,
            ]);

            // Check for discrepancies
            $discrepancies = [];
            foreach ($validated['confirmed_items'] as $item) {
                $detail = $transaction->details()
                    ->where('linen_id', $item['linen_id'])
                    ->first();
                    
                if ($detail && $detail->qty != $item['qty_received']) {
                    $discrepancies[] = [
                        'linen_id' => $item['linen_id'],
                        'expected' => $detail->qty,
                        'received' => $item['qty_received'],
                        'difference' => $detail->qty - $item['qty_received'],
                    ];
                }
            }

            // Log discrepancies if any
            if (!empty($discrepancies)) {
                ActivityLogger::log(
                    'warning',
                    'Transaction',
                    $transaction->id,
                    "Konfirmasi dengan selisih: " . json_encode($discrepancies)
                );
            }

            DB::commit();

            ActivityLogger::log(
                'updated',
                'Transaction',
                $transaction->id,
                "Dikonfirmasi oleh perawat: {$transaction->trx_code}"
            );

            return back()->with('success', "Transaksi {$transaction->trx_code} berhasil dikonfirmasi.");

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Gagal mengkonfirmasi transaksi: ' . $e->getMessage());
        }
    }

    /**
     * View confirmation history.
     */
    public function history(Request $request)
    {
        $user = auth()->user();
        
        $query = Transaction::with(['room', 'user', 'details.linen', 'confirmedBy'])
            ->where('type', Transaction::TYPE_OUT_DISTRIBUTION)
            ->whereIn('status', ['confirmed', 'pending'])
            ->orderBy('created_at', 'desc');

        if ($user->room_id) {
            $query->where('room_id', $user->room_id);
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('trx_date', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('trx_date', '<=', $request->date_to);
        }

        $transactions = $query->paginate(10)->withQueryString();

        return Inertia::render('Sirkulasi/Konfirmasi/History', [
            'transactions' => $transactions,
            'filters' => [
                'status' => $request->status ?? 'all',
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
        ]);
    }
}
