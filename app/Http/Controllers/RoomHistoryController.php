<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\RoomStock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomHistoryController extends Controller
{
    /**
     * Display the room history for Head Nurse.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $roomId = $user->room_id;

        if (!$roomId) {
            abort(403, 'Anda tidak memiliki ruangan yang ditugaskan.');
        }

        // Get date range filters
        $dateFrom = $request->get('date_from', now()->subDays(30)->toDateString());
        $dateTo = $request->get('date_to', now()->toDateString());
        $type = $request->get('type');

        // Get transactions for this room
        $query = Transaction::with(['user', 'details.linen'])
            ->where('room_id', $roomId)
            ->whereDate('trx_date', '>=', $dateFrom)
            ->whereDate('trx_date', '<=', $dateTo)
            ->orderBy('created_at', 'desc');

        if ($type) {
            $query->where('type', $type);
        }

        $transactions = $query->paginate(15)->withQueryString();

        // Get current room stock
        $currentStock = RoomStock::with('linen')
            ->where('room_id', $roomId)
            ->get();

        // Get room info
        $room = $user->room;

        // Get summary stats
        $summary = [
            'totalReceived' => Transaction::where('room_id', $roomId)
                ->where('type', Transaction::TYPE_OUT_DISTRIBUTION)
                ->whereDate('trx_date', '>=', $dateFrom)
                ->whereDate('trx_date', '<=', $dateTo)
                ->join('transaction_details', 'transactions.id', '=', 'transaction_details.transaction_id')
                ->sum('transaction_details.qty'),
            'totalReturned' => Transaction::where('room_id', $roomId)
                ->where('type', Transaction::TYPE_IN_COLLECTION)
                ->whereDate('trx_date', '>=', $dateFrom)
                ->whereDate('trx_date', '<=', $dateTo)
                ->join('transaction_details', 'transactions.id', '=', 'transaction_details.transaction_id')
                ->sum('transaction_details.qty'),
            'currentStockTotal' => $currentStock->sum('current_qty'),
            'pendingConfirmation' => Transaction::where('room_id', $roomId)
                ->where('type', Transaction::TYPE_OUT_DISTRIBUTION)
                ->where('status', 'pending')
                ->count(),
        ];

        return Inertia::render('HeadNurse/Riwayat/Index', [
            'room' => $room,
            'transactions' => $transactions,
            'currentStock' => $currentStock,
            'summary' => $summary,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'type' => $type,
            ],
        ]);
    }

    /**
     * Show transaction detail.
     */
    public function show(Request $request, Transaction $transaction): Response
    {
        $user = $request->user();
        
        // Verify transaction belongs to user's room
        if ($transaction->room_id !== $user->room_id) {
            abort(403, 'Anda tidak memiliki akses ke transaksi ini.');
        }

        $transaction->load(['user', 'details.linen', 'room']);

        return Inertia::render('HeadNurse/Riwayat/Show', [
            'transaction' => $transaction,
        ]);
    }
}
