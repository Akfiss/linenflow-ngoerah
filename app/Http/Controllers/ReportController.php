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

class ReportController extends Controller
{
    /**
     * Display central stock (Stok Gudang).
     */
    public function centralStock(Request $request): Response
    {
        $query = CentralStock::with(['linen.category']);

        // Search by linen name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('linen', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku_code', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $query->whereHas('linen', function ($q) use ($request) {
                $q->where('linen_category_id', $request->category);
            });
        }

        // Sorting
        $sortField = $request->get('sort', 'id');
        $sortDirection = $request->get('direction', 'desc');
        
        // Handle sorting by related fields
        if (in_array($sortField, ['linen_name', 'sku_code', 'category_name'])) {
            if ($sortField === 'linen_name') {
                $query->join('linens', 'central_stocks.linen_id', '=', 'linens.id')
                      ->orderBy('linens.name', $sortDirection)
                      ->select('central_stocks.*');
            } elseif ($sortField === 'sku_code') {
                $query->join('linens', 'central_stocks.linen_id', '=', 'linens.id')
                      ->orderBy('linens.sku_code', $sortDirection)
                      ->select('central_stocks.*');
            } elseif ($sortField === 'category_name') {
                $query->join('linens', 'central_stocks.linen_id', '=', 'linens.id')
                      ->leftJoin('linen_categories', 'linens.linen_category_id', '=', 'linen_categories.id')
                      ->orderBy('linen_categories.name', $sortDirection)
                      ->select('central_stocks.*');
            }
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        // Get all for totals calculation
        $allStocks = CentralStock::all();

        // Calculate totals from all data
        $totals = [
            'clean' => $allStocks->sum('clean_qty'),
            'dirty' => $allStocks->sum('dirty_qty'),
            'washing' => $allStocks->sum('washing_qty'),
            'total' => $allStocks->sum('clean_qty') + $allStocks->sum('dirty_qty') + $allStocks->sum('washing_qty'),
        ];

        // Get categories for filter
        $categories = \App\Models\LinenCategory::orderBy('name')->get();

        // Paginate
        $stocks = $query->paginate(10)->withQueryString();

        return Inertia::render('Inventaris/Gudang/Index', [
            'stocks' => $stocks,
            'totals' => $totals,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category' => $request->category,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Display room stock (Stok Ruangan).
     */
    public function roomStock(Request $request): Response
    {
        $query = RoomStock::with(['room', 'linen']);

        // Filter by room
        if ($request->has('room') && $request->room) {
            $query->where('room_id', $request->room);
        }

        // Search by linen name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('linen', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        // Filter low stock only
        if ($request->has('low_stock') && $request->low_stock === 'true') {
            $query->whereColumn('current_qty', '<', 'par_stock');
        }

        // Sorting
        $sortField = $request->get('sort', 'id');
        $sortDirection = $request->get('direction', 'desc');
        
        // Handle sorting by related fields
        if ($sortField === 'room_name') {
            $query->join('rooms', 'room_stocks.room_id', '=', 'rooms.id')
                  ->orderBy('rooms.name', $sortDirection)
                  ->select('room_stocks.*');
        } elseif ($sortField === 'linen_name') {
            $query->join('linens', 'room_stocks.linen_id', '=', 'linens.id')
                  ->orderBy('linens.name', $sortDirection)
                  ->select('room_stocks.*');
        } elseif ($sortField === 'difference') {
            $query->orderByRaw("(current_qty - par_stock) {$sortDirection}");
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        // Paginate
        $stocks = $query->paginate(10)->withQueryString();

        // Get rooms for filter
        $rooms = Room::orderBy('name')->get();

        // Calculate low stock count
        $lowStockCount = RoomStock::whereColumn('current_qty', '<', 'par_stock')->count();

        return Inertia::render('Inventaris/Ruangan/Index', [
            'stocks' => $stocks,
            'rooms' => $rooms,
            'lowStockCount' => $lowStockCount,
            'filters' => [
                'room' => $request->room,
                'search' => $request->search,
                'low_stock' => $request->low_stock,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Display transaction log (Log Transaksi).
     */
    public function transactionLog(Request $request): Response
    {
        $query = Transaction::with(['user', 'room', 'details.linen']);

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filter by room
        if ($request->has('room') && $request->room) {
            $query->where('room_id', $request->room);
        }

        // Filter by user
        if ($request->has('user') && $request->user) {
            $query->where('user_id', $request->user);
        }

        // Filter by date range
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('trx_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('trx_date', '<=', $request->date_to);
        }

        // Search by transaction code
        if ($request->has('search') && $request->search) {
            $query->where('trx_code', 'like', "%{$request->search}%");
        }

        // Sorting
        $sortField = $request->get('sort', 'trx_date');
        $sortDirection = $request->get('direction', 'desc');
        
        // Handle sorting by related fields
        if ($sortField === 'user_name') {
            $query->leftJoin('users', 'transactions.user_id', '=', 'users.id')
                  ->orderBy('users.name', $sortDirection)
                  ->select('transactions.*');
        } elseif ($sortField === 'room_name') {
            $query->leftJoin('rooms', 'transactions.room_id', '=', 'rooms.id')
                  ->orderBy('rooms.name', $sortDirection)
                  ->select('transactions.*');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $transactions = $query->paginate(10)->withQueryString();

        // Get filter options
        $rooms = Room::orderBy('name')->get();
        $users = \App\Models\User::orderBy('name')->get();
        $types = [
            'OUT_DISTRIBUTION' => 'Distribusi Keluar',
            'IN_COLLECTION' => 'Penerimaan Kotor',
            'WASH_START' => 'Mulai Cuci',
            'WASH_FINISH' => 'Selesai Cuci',
            'ADJUSTMENT' => 'Penyesuaian',
            'DISPOSAL' => 'Afkir',
        ];

        return Inertia::render('Laporan/Transaksi/Index', [
            'transactions' => $transactions,
            'rooms' => $rooms,
            'users' => $users,
            'types' => $types,
            'filters' => [
                'type' => $request->type,
                'room' => $request->room,
                'user' => $request->user,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'search' => $request->search,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Display laundry performance (Kinerja Laundry).
     */
    public function performance(Request $request): Response
    {
        $period = $request->get('period', 'weekly');
        
        // Get wash transactions grouped by date
        $washQuery = Transaction::whereIn('type', ['WASH_START', 'WASH_FINISH']);

        if ($period === 'daily') {
            $washQuery->where('trx_date', '>=', now()->subDays(30));
            $groupFormat = '%Y-%m-%d';
        } elseif ($period === 'weekly') {
            $washQuery->where('trx_date', '>=', now()->subWeeks(12));
            $groupFormat = '%Y-%u'; // Year-Week
        } else { // monthly
            $washQuery->where('trx_date', '>=', now()->subMonths(12));
            $groupFormat = '%Y-%m';
        }

        $washData = $washQuery
            ->selectRaw("DATE_FORMAT(trx_date, '{$groupFormat}') as period, type, COUNT(*) as count")
            ->groupBy('period', 'type')
            ->orderBy('period')
            ->get();

        // Process data for charts
        $chartData = [];
        foreach ($washData as $item) {
            if (!isset($chartData[$item->period])) {
                $chartData[$item->period] = [
                    'period' => $item->period,
                    'wash_start' => 0,
                    'wash_finish' => 0,
                ];
            }
            if ($item->type === 'WASH_START') {
                $chartData[$item->period]['wash_start'] = $item->count;
            } else {
                $chartData[$item->period]['wash_finish'] = $item->count;
            }
        }

        // Get summary stats
        $todayWash = Transaction::whereIn('type', ['WASH_START', 'WASH_FINISH'])
            ->whereDate('trx_date', today())
            ->count();

        $thisWeekWash = Transaction::whereIn('type', ['WASH_START', 'WASH_FINISH'])
            ->whereBetween('trx_date', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();

        $thisMonthWash = Transaction::whereIn('type', ['WASH_START', 'WASH_FINISH'])
            ->whereMonth('trx_date', now()->month)
            ->whereYear('trx_date', now()->year)
            ->count();

        // Get total items processed
        $totalItemsProcessed = \App\Models\TransactionDetail::whereHas('transaction', function ($q) {
            $q->whereIn('type', ['WASH_FINISH']);
        })->sum('qty');

        // Distribution by type
        $distributionByType = Transaction::selectRaw('type, COUNT(*) as count')
            ->whereMonth('trx_date', now()->month)
            ->groupBy('type')
            ->pluck('count', 'type');

        return Inertia::render('Laporan/Kinerja/Index', [
            'chartData' => array_values($chartData),
            'summary' => [
                'today' => $todayWash,
                'thisWeek' => $thisWeekWash,
                'thisMonth' => $thisMonthWash,
                'totalProcessed' => $totalItemsProcessed,
            ],
            'distributionByType' => $distributionByType,
            'period' => $period,
        ]);
    }

    /**
     * Export transactions to CSV.
     */
    public function exportTransactions(Request $request)
    {
        $query = Transaction::with(['user', 'room', 'details.linen']);

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }
        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('trx_date', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('trx_date', '<=', $request->date_to);
        }

        $transactions = $query->latest('trx_date')->get();

        $filename = 'transactions_' . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($transactions) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, ['Kode Transaksi', 'Tanggal', 'Tipe', 'Ruangan', 'User', 'Item', 'Jumlah', 'Catatan']);
            
            foreach ($transactions as $trx) {
                foreach ($trx->details as $detail) {
                    fputcsv($file, [
                        $trx->trx_code,
                        $trx->trx_date,
                        $trx->type,
                        $trx->room?->name ?? '-',
                        $trx->user?->name ?? '-',
                        $detail->linen?->name ?? '-',
                        $detail->qty,
                        $trx->notes,
                    ]);
                }
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Export central stock to CSV.
     */
    public function exportCentralStock()
    {
        $stocks = CentralStock::with(['linen.category'])->get();

        $filename = 'central_stock_' . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($stocks) {
            $file = fopen('php://output', 'w');
            
            fputcsv($file, ['SKU', 'Nama Linen', 'Kategori', 'Stok Bersih', 'Stok Kotor', 'Sedang Cuci', 'Total']);
            
            foreach ($stocks as $stock) {
                fputcsv($file, [
                    $stock->linen?->sku_code ?? '-',
                    $stock->linen?->name ?? '-',
                    $stock->linen?->category?->name ?? '-',
                    $stock->clean_qty,
                    $stock->dirty_qty,
                    $stock->washing_qty,
                    $stock->clean_qty + $stock->dirty_qty + $stock->washing_qty,
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
