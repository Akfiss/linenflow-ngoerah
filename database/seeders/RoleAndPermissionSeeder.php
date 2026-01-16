<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions based on PRD
        $permissions = [
            // Dashboard
            'view_dashboard',

            // Sirkulasi Linen
            'create_trx_distribution',
            'create_trx_collection',
            'confirm_receipt',

            // Produksi
            'create_transaction_process',
            'create_adjustment',

            // Inventaris
            'view_own_dashboard',
            'view_all_stats',

            // Laporan
            'view_global_report',
            'view_financial_reports',

            // Master Data
            'manage_master_data',

            // System
            'manage_users',
            'assign_roles',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions

        // 1. Super Admin - System/IT focused
        $superAdmin = Role::create(['name' => User::ROLE_SUPER_ADMIN]);
        $superAdmin->givePermissionTo([
            'view_dashboard',
            'view_own_dashboard',
            'view_all_stats',
            'view_global_report',
            'manage_users',
            'assign_roles',
        ]);

        // 2. Laundry Manager - Full operations
        $laundryManager = Role::create(['name' => User::ROLE_LAUNDRY_MANAGER]);
        $laundryManager->givePermissionTo([
            'view_dashboard',
            'create_trx_distribution',
            'create_trx_collection',
            'create_transaction_process',
            'create_adjustment',
            'view_own_dashboard',
            'view_all_stats',
            'view_global_report',
            'view_financial_reports',
            'manage_master_data',
        ]);

        // 3. Laundry Operator - Daily operations
        $laundryOperator = Role::create(['name' => User::ROLE_LAUNDRY_OPERATOR]);
        $laundryOperator->givePermissionTo([
            'view_dashboard',
            'create_trx_distribution',
            'create_trx_collection',
            'create_transaction_process',
            'view_own_dashboard',
            'view_all_stats',
        ]);

        // 4. Head Nurse - Room focused
        $headNurse = Role::create(['name' => User::ROLE_HEAD_NURSE]);
        $headNurse->givePermissionTo([
            'view_dashboard',
            'confirm_receipt',
            'view_own_dashboard',
        ]);
    }
}
