<?php

namespace App\Http\Controllers;

use App\Models\CentralStock;
use App\Models\Linen;
use App\Models\Room;
use App\Models\RoomStock;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class DashboardController extends Controller
{
    /**
     * Display the dashboard with statistics.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        // Enforce canonical URLs based on role
        if ($user->hasRole('super_admin') && !$request->routeIs('dashboard.admin')) {
            return redirect()->route('dashboard.admin');
        }
        if ($user->hasRole('laundry_manager') && !$request->routeIs('dashboard.manager')) {
            return redirect()->route('dashboard.manager');
        }
        if ($user->hasRole('laundry_operator') && !$request->routeIs('dashboard.operator')) {
            return redirect()->route('dashboard.operator');
        }
        if ($user->hasRole('head_nurse') && !$request->routeIs('dashboard.nurse')) {
            return redirect()->route('dashboard.nurse');
        }

        // Get central stock totals
        $centralStockTotals = CentralStock::selectRaw('
            SUM(clean_qty) as total_clean,
            SUM(dirty_qty) as total_dirty,
            SUM(washing_qty) as total_washing
        ')->first();

        // Get room stock totals
        $roomStockTotal = RoomStock::sum('current_qty');

        // Get rooms with low stock (below par)
        $lowStockRooms = RoomStock::with(['room', 'linen'])
            ->whereColumn('current_qty', '<', 'par_stock')
            ->orderByRaw('(par_stock - current_qty) DESC')
            ->limit(10)
            ->get();

        // Get recent transactions
        $recentTransactions = Transaction::with(['user', 'room'])
            ->latest()
            ->limit(10)
            ->get();

        // Get transaction counts by type for this month
        $monthlyTransactions = Transaction::selectRaw('type, COUNT(*) as count')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->groupBy('type')
            ->pluck('count', 'type');

        // Get total counts
        $totalLinens = Linen::count();
        $totalRooms = Room::count();

        // For Head Nurse - get only their room's stock
        $ownRoomStock = null;
        if ($user && $user->room_id) {
            $ownRoomStock = RoomStock::with('linen')
                ->where('room_id', $user->room_id)
                ->get();
        }

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalClean' => $centralStockTotals->total_clean ?? 0,
                'totalDirty' => $centralStockTotals->total_dirty ?? 0,
                'totalWashing' => $centralStockTotals->total_washing ?? 0,
                'totalInRooms' => $roomStockTotal,
                'totalLinens' => $totalLinens,
                'totalRooms' => $totalRooms,
            ],
            'lowStockRooms' => $lowStockRooms,
            'recentTransactions' => $recentTransactions,
            'monthlyTransactions' => $monthlyTransactions,
            'ownRoomStock' => $ownRoomStock,
        ]);
    }
}
