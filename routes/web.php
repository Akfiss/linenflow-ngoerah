<?php

use App\Http\Controllers\CollectionController;
use App\Http\Controllers\ConfirmationController;
use App\Http\Controllers\DashboardController;

use App\Http\Controllers\DisposalController;
use App\Http\Controllers\DistributionController;
use App\Http\Controllers\LinenCategoryController;
use App\Http\Controllers\LinenController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomHistoryController;
use App\Http\Controllers\StockOpnameController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WashingController;


use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('LandingPage', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {

    // --- Role-Specific Dashboards ---
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('dashboard.admin');
    Route::get('/manager/dashboard', [DashboardController::class, 'index'])->name('dashboard.manager');
    Route::get('/operator/dashboard', [DashboardController::class, 'index'])->name('dashboard.operator');
    Route::get('/head-nurse/dashboard', [DashboardController::class, 'index'])->name('dashboard.nurse');
    Route::get('/admin/dashboard/export-logs', [DashboardController::class, 'exportActivityLogs'])->name('dashboard.export-logs');
    
    // Legacy/Fallback (redirects based on role, handled in Controller or Middleware usually, but keeping route as safety)
    Route::get('/dashboard', function() {
        return redirect()->route('dashboard.admin'); // Simplification: Authed users hit specific routes usually
    })->name('dashboard');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    /*
    |--------------------------------------------------------------------------
    | Sirkulasi Linen Routes
    |--------------------------------------------------------------------------
    */

    // Distribusi Bersih
    Route::prefix('sirkulasi/distribusi')->name('distribution.')->middleware('permission:create_trx_distribution')->group(function () {
        Route::get('/', [DistributionController::class, 'index'])->name('index');
        Route::post('/', [DistributionController::class, 'store'])->name('store');
        Route::get('/history', [DistributionController::class, 'history'])->name('history');
    });

    // Penerimaan Kotor
    Route::prefix('sirkulasi/penerimaan')->name('collection.')->middleware('permission:create_trx_collection')->group(function () {
        Route::get('/', [CollectionController::class, 'index'])->name('index');
        Route::post('/', [CollectionController::class, 'store'])->name('store');
        Route::get('/room/{room}/stock', [CollectionController::class, 'getRoomStock'])->name('room.stock');
        Route::get('/history', [CollectionController::class, 'history'])->name('history');
    });

    // Konfirmasi Terima (Head Nurse)
    Route::prefix('sirkulasi/konfirmasi')->name('confirmation.')->middleware('permission:confirm_receipt')->group(function () {
        Route::get('/', [ConfirmationController::class, 'index'])->name('index');
        Route::post('/{transaction}', [ConfirmationController::class, 'confirm'])->name('confirm');
        Route::get('/history', [ConfirmationController::class, 'history'])->name('history');
    });

    // Riwayat Ruangan (Head Nurse)
    Route::prefix('ruangan/riwayat')->name('nurse.riwayat')->middleware('permission:confirm_receipt')->group(function () {
        Route::get('/', [RoomHistoryController::class, 'index']);
        Route::get('/{transaction}', [RoomHistoryController::class, 'show'])->name('.show');
    });


    /*
    |--------------------------------------------------------------------------
    | Produksi Routes
    |--------------------------------------------------------------------------
    */

    // Proses Cuci
    Route::prefix('produksi/cuci')->name('washing.')->middleware('permission:create_transaction_process')->group(function () {
        Route::get('/', [WashingController::class, 'index'])->name('index');
        Route::post('/start', [WashingController::class, 'startWash'])->name('start');
        Route::post('/finish', [WashingController::class, 'finishWash'])->name('finish');
        Route::get('/history', [WashingController::class, 'history'])->name('history');
    });

    // Afkir
    Route::prefix('produksi/afkir')->name('disposal.')->middleware('permission:create_adjustment')->group(function () {
        Route::get('/', [DisposalController::class, 'index'])->name('index');
        Route::post('/', [DisposalController::class, 'store'])->name('store');
        Route::get('/history', [DisposalController::class, 'history'])->name('history');
    });

    // Linen Request
    Route::prefix('produksi/request')->name('linen-request.')->middleware('permission:view_own_dashboard')->group(function () {
        Route::get('/linens', [\App\Http\Controllers\LinenRequestController::class, 'getLinens'])->name('linens');
        Route::post('/store', [\App\Http\Controllers\LinenRequestController::class, 'store'])->name('store');
        Route::get('/', [\App\Http\Controllers\LinenRequestController::class, 'index'])->name('index');
    });

    /*
    |--------------------------------------------------------------------------
    | Inventaris Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('inventaris')->name('inventaris.')->group(function () {
        Route::get('/gudang', [ReportController::class, 'centralStock'])
            ->name('gudang')
            ->middleware('permission:view_own_dashboard');
        Route::get('/gudang/export', [ReportController::class, 'exportCentralStock'])
            ->name('gudang.export')
            ->middleware('permission:view_own_dashboard');
        Route::get('/ruangan', [ReportController::class, 'roomStock'])
            ->name('ruangan')
            ->middleware('permission:view_all_stats');
        
        // Stock Opname
        Route::get('/opname', [StockOpnameController::class, 'index'])
            ->name('opname')
            ->middleware('permission:create_adjustment');
        Route::post('/opname', [StockOpnameController::class, 'store'])
            ->name('opname.store')
            ->middleware('permission:create_adjustment');
        Route::get('/opname/history', [StockOpnameController::class, 'history'])
            ->name('opname.history')
            ->middleware('permission:create_adjustment');
    });


    /*
    |--------------------------------------------------------------------------
    | Laporan Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('laporan')->name('laporan.')->group(function () {
        Route::get('/transaksi', [ReportController::class, 'transactionLog'])
            ->name('transaksi')
            ->middleware('permission:view_global_report');
        Route::get('/transaksi/export', [ReportController::class, 'exportTransactions'])
            ->name('transaksi.export')
            ->middleware('permission:view_global_report');
        Route::get('/kehilangan', [ReportController::class, 'lostAndFound'])
            ->name('kehilangan')
            ->middleware('permission:view_financial_reports');
        Route::get('/kinerja', [ReportController::class, 'performance'])
            ->name('kinerja')
            ->middleware('permission:view_global_report');
    });


    /*
    |--------------------------------------------------------------------------
    | Master Data Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('master')->name('master.')->middleware('permission:manage_master_data')->group(function () {
        // Categories
        Route::resource('categories', LinenCategoryController::class)->except(['create', 'show', 'edit']);

        // Linens
        Route::resource('linen', LinenController::class);

        // Rooms
        Route::resource('room', RoomController::class);
        Route::put('/room/{room}/par-stock', [RoomController::class, 'updateParStock'])->name('room.par-stock');
    });

    /*
    |--------------------------------------------------------------------------
    | System Routes (Super Admin Only)
    |--------------------------------------------------------------------------
    */

    Route::prefix('system')->name('system.')->middleware('permission:manage_users')->group(function () {
        Route::resource('users', UserController::class)->except(['create', 'show', 'edit']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::post('/users/{user}/restore', [UserController::class, 'restore'])->name('users.restore')->withTrashed();
    });

    Route::prefix('system')->name('system.')->middleware('permission:assign_roles')->group(function () {
        Route::resource('roles', RoleController::class)->except(['create', 'show', 'edit']);
    });
});

/*
|--------------------------------------------------------------------------
| Preview Routes (Development Only - No Auth)
|--------------------------------------------------------------------------
*/

if (app()->environment('local')) {
    
    // Updated Permission Map for Previews
    $rolePermissions = [
        'super_admin' => ['view_admin_dashboard', 'manage_users', 'assign_roles'],
        'laundry_manager' => ['view_manager_dashboard', 'view_reports', 'manage_linen', 'manage_distribution'],
        'laundry_operator' => ['view_operator_dashboard', 'manage_linen', 'manage_distribution'],
        'head_nurse' => ['view_nurse_dashboard', 'request_linen', 'confirm_distribution'],
    ];

    Route::get('/preview/admin', function () use ($rolePermissions) {
        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => ['name' => 'Preview Admin', 'email' => 'admin@preview.com', 'role' => 'super_admin'],
                'permissions' => $rolePermissions['super_admin'],
                'roles' => ['super_admin']
            ]
        ]);
    });

    Route::get('/preview/manager', function () use ($rolePermissions) {
        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => ['name' => 'Preview Manager', 'email' => 'manager@preview.com', 'role' => 'laundry_manager'],
                'permissions' => $rolePermissions['laundry_manager'],
                'roles' => ['laundry_manager']
            ]
        ]);
    });

    Route::get('/preview/operator', function () use ($rolePermissions) {
        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => ['name' => 'Preview Operator', 'email' => 'operator@preview.com', 'role' => 'laundry_operator'],
                'permissions' => $rolePermissions['laundry_operator'],
                'roles' => ['laundry_operator']
            ]
        ]);
    });

    Route::get('/preview/nurse', function () use ($rolePermissions) {
        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => ['name' => 'Ns. Dewi', 'email' => 'nurse@preview.com', 'role' => 'head_nurse'],
                'permissions' => $rolePermissions['head_nurse'],
                'roles' => ['head_nurse']
            ]
        ]);
    });

    // Preview routes for System pages (User Management & Roles)
    Route::get('/preview/system/users', function () use ($rolePermissions) {
        return Inertia::render('System/Users/Index', [
            'auth' => [
                'user' => ['name' => 'Preview Admin', 'email' => 'admin@preview.com', 'role' => 'super_admin'],
                'permissions' => $rolePermissions['super_admin'],
                'roles' => ['super_admin']
            ],
            'users' => [
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 10,
                'total' => 0,
            ],
            'roles' => [],
            'rooms' => [],
        ]);
    });

    Route::get('/preview/system/roles', function () use ($rolePermissions) {
        return Inertia::render('System/Roles/Index', [
            'auth' => [
                'user' => ['name' => 'Preview Admin', 'email' => 'admin@preview.com', 'role' => 'super_admin'],
                'permissions' => $rolePermissions['super_admin'],
                'roles' => ['super_admin']
            ],
            'roles' => [],
            'permissions' => [],
            'selectedRole' => null,
        ]);
    });
    
    // ... keep other mock routes if needed ...
}

require __DIR__.'/auth.php';
