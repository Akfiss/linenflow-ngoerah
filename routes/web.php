<?php

use App\Http\Controllers\CollectionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DisposalController;
use App\Http\Controllers\DistributionController;
use App\Http\Controllers\LinenCategoryController;
use App\Http\Controllers\LinenController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RoomController;
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
    return Inertia::render('Welcome', [
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

    /*
    |--------------------------------------------------------------------------
    | Inventaris Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('inventaris')->name('inventory.')->group(function () {
        Route::get('/stok-gudang', [ReportController::class, 'stockSummary'])
            ->name('central-stock')
            ->middleware('permission:view_own_dashboard');
        Route::get('/stok-ruangan', [ReportController::class, 'roomStockSummary'])
            ->name('room-stock')
            ->middleware('permission:view_all_stats');
    });

    /*
    |--------------------------------------------------------------------------
    | Laporan Routes
    |--------------------------------------------------------------------------
    */

    Route::prefix('laporan')->name('reports.')->group(function () {
        Route::get('/transaksi', [ReportController::class, 'transactionLog'])
            ->name('transactions')
            ->middleware('permission:view_global_report');
        Route::get('/lost-found', [ReportController::class, 'lostAndFound'])
            ->name('lost-found')
            ->middleware('permission:view_financial_reports');
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
    
    // ... keep other mock routes if needed ...
}

require __DIR__.'/auth.php';
