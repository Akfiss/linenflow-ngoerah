<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\CentralStock;
use App\Models\Linen;
use App\Models\Room;
use App\Models\RoomStock;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Spatie\Permission\Models\Role;

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

        // Generate chart data for distribution trends
        // Last 7 days
        $chart7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = Transaction::where('type', Transaction::TYPE_OUT_DISTRIBUTION)
                ->whereDate('trx_date', $date->toDateString())
                ->join('transaction_details', 'transactions.id', '=', 'transaction_details.transaction_id')
                ->sum('transaction_details.qty');
            
            $chart7Days[] = [
                'name' => $date->locale('id')->isoFormat('ddd'),
                'date' => $date->toDateString(),
                'total' => (int) $count,
            ];
        }

        // Last 30 days (grouped by week)
        $chart30Days = [];
        for ($i = 4; $i >= 0; $i--) {
            $startDate = now()->subWeeks($i)->startOfWeek();
            $endDate = now()->subWeeks($i)->endOfWeek();
            $count = Transaction::where('type', Transaction::TYPE_OUT_DISTRIBUTION)
                ->whereBetween('trx_date', [$startDate->toDateString(), $endDate->toDateString()])
                ->join('transaction_details', 'transactions.id', '=', 'transaction_details.transaction_id')
                ->sum('transaction_details.qty');
            
            $chart30Days[] = [
                'name' => 'W' . $startDate->weekOfYear,
                'date' => $startDate->format('d/m') . '-' . $endDate->format('d/m'),
                'total' => (int) $count,
            ];
        }

        // This month (grouped by day)
        $chartThisMonth = [];
        $daysInMonth = now()->daysInMonth;
        $currentDay = now()->day;
        
        // Show last 10 days of activity up to today
        $startDay = max(1, $currentDay - 9);
        for ($day = $startDay; $day <= $currentDay; $day++) {
            $date = now()->startOfMonth()->addDays($day - 1);
            $count = Transaction::where('type', Transaction::TYPE_OUT_DISTRIBUTION)
                ->whereDate('trx_date', $date->toDateString())
                ->join('transaction_details', 'transactions.id', '=', 'transaction_details.transaction_id')
                ->sum('transaction_details.qty');
            
            $chartThisMonth[] = [
                'name' => $date->format('d'),
                'date' => $date->toDateString(),
                'total' => (int) $count,
            ];
        }

        // Calculate total distributed for each period
        $total7Days = array_sum(array_column($chart7Days, 'total'));
        $total30Days = array_sum(array_column($chart30Days, 'total'));
        $totalThisMonth = array_sum(array_column($chartThisMonth, 'total'));

        // Get Top 5 linen by distribution quantity (last 30 days)
        $topLinens = \DB::table('transaction_details')
            ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->join('linens', 'linens.id', '=', 'transaction_details.linen_id')
            ->where('transactions.type', Transaction::TYPE_OUT_DISTRIBUTION)
            ->where('transactions.trx_date', '>=', now()->subDays(30)->toDateString())
            ->select('linens.name', \DB::raw('SUM(transaction_details.qty) as total'))
            ->groupBy('linens.id', 'linens.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'total' => (int) $item->total,
                ];
            });

        // Get distribution by linen category (last 30 days)
        $categoryDistribution = \DB::table('transaction_details')
            ->join('transactions', 'transactions.id', '=', 'transaction_details.transaction_id')
            ->join('linens', 'linens.id', '=', 'transaction_details.linen_id')
            ->join('linen_categories', 'linen_categories.id', '=', 'linens.linen_category_id')
            ->where('transactions.type', Transaction::TYPE_OUT_DISTRIBUTION)
            ->where('transactions.trx_date', '>=', now()->subDays(30)->toDateString())
            ->select('linen_categories.name', \DB::raw('SUM(transaction_details.qty) as total'))
            ->groupBy('linen_categories.id', 'linen_categories.name')
            ->orderByDesc('total')
            ->get()
            ->map(function ($item, $index) {
                $colors = ['#298fa3', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                return [
                    'name' => $item->name,
                    'value' => (int) $item->total,
                    'color' => $colors[$index % count($colors)],
                ];
            });


        // Get total counts
        $totalLinens = Linen::count();
        $totalRooms = Room::count();

        // For Head Nurse - get only their room's stock and transactions
        $ownRoomStock = null;
        $ownRoomPending = 0;
        $ownRoomTransactions = [];
        if ($user && $user->room_id) {
            $ownRoomStock = RoomStock::with('linen')
                ->where('room_id', $user->room_id)
                ->get();
            
            // Get pending distributions for this room
            $ownRoomPending = Transaction::where('room_id', $user->room_id)
                ->where('type', Transaction::TYPE_OUT_DISTRIBUTION)
                ->where('status', 'pending')
                ->count();
            
            // Get recent transactions for this room
            $ownRoomTransactions = Transaction::with(['user', 'details.linen'])
                ->where('room_id', $user->room_id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
        }


        // Super Admin specific stats
        $totalUsers = User::count();
        $activeRoles = Role::count();
        
        // Calculate average daily activity (last 7 days)
        $avgActivity = ActivityLog::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('COUNT(*) as total')
            ->value('total');
        $avgActivity = round($avgActivity / 7);

        // Get activity logs for super admin (paginated)
        $activityLogs = null;
        if ($user->hasRole('super_admin')) {
            $activityLogsQuery = ActivityLog::with('user')
                ->latest();

            // Apply filters
            if ($request->has('action') && $request->action) {
                $activityLogsQuery->where('action', $request->action);
            }
            if ($request->has('status') && $request->status) {
                $activityLogsQuery->where('status', $request->status);
            }
            if ($request->has('user_id') && $request->user_id) {
                $activityLogsQuery->where('user_id', $request->user_id);
            }
            if ($request->has('date_from') && $request->date_from) {
                $activityLogsQuery->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to') && $request->date_to) {
                $activityLogsQuery->whereDate('created_at', '<=', $request->date_to);
            }

            $activityLogs = $activityLogsQuery->paginate(10)->withQueryString();
        }

        // Get unique actions for filter dropdown
        $actionTypes = ActivityLog::distinct()->pluck('action');
        $allUsers = User::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalClean' => $centralStockTotals->total_clean ?? 0,
                'totalDirty' => $centralStockTotals->total_dirty ?? 0,
                'totalWashing' => $centralStockTotals->total_washing ?? 0,
                'totalInRooms' => $roomStockTotal,
                'totalLinens' => $totalLinens,
                'totalRooms' => $totalRooms,
                'totalUsers' => $totalUsers,
                'activeRoles' => $activeRoles,
                'avgActivity' => $avgActivity,
            ],
            'lowStockRooms' => $lowStockRooms,
            'recentTransactions' => $recentTransactions,
            'monthlyTransactions' => $monthlyTransactions,
            'chartData' => [
                'last7Days' => $chart7Days,
                'last30Days' => $chart30Days,
                'thisMonth' => $chartThisMonth,
                'totals' => [
                    'last7Days' => $total7Days,
                    'last30Days' => $total30Days,
                    'thisMonth' => $totalThisMonth,
                ],
            ],
            'topLinens' => $topLinens,
            'categoryDistribution' => $categoryDistribution,
            'ownRoomStock' => $ownRoomStock,
            'ownRoomPending' => $ownRoomPending,
            'ownRoomTransactions' => $ownRoomTransactions,
            'activityLogs' => $activityLogs,

            'filters' => [
                'action' => $request->action,
                'status' => $request->status,
                'user_id' => $request->user_id,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
            ],
            'filterOptions' => [
                'actions' => $actionTypes,
                'users' => $allUsers,
            ],
        ]);

    }

    /**
     * Export activity logs to CSV.
     */
    public function exportActivityLogs(Request $request)
    {
        $query = ActivityLog::with('user')->latest();

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->get();

        $filename = 'activity_logs_' . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, ['Timestamp', 'User', 'Action', 'Target', 'Status', 'IP Address']);
            
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->user?->name ?? 'System',
                    $log->action,
                    $log->target_name ?? $log->target_type,
                    $log->status,
                    $log->ip_address,
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
