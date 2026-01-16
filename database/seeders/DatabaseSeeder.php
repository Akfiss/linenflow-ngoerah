<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // First, seed roles and permissions
        $this->call(RoleAndPermissionSeeder::class);

        // Then seed master data (categories, linens, rooms, stocks)
        $this->call(MasterDataSeeder::class);

        // Get rooms for head nurses
        $wardRooms = Room::where('type', Room::TYPE_WARD)->get();

        // Create Super Admin
        $superAdmin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@linenflow.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_SUPER_ADMIN,
        ]);
        $superAdmin->assignRole(User::ROLE_SUPER_ADMIN);

        // Create Laundry Manager
        $manager = User::factory()->create([
            'name' => 'Laundry Manager',
            'email' => 'manager@linenflow.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_LAUNDRY_MANAGER,
        ]);
        $manager->assignRole(User::ROLE_LAUNDRY_MANAGER);

        // Create Laundry Operator
        $operator = User::factory()->create([
            'name' => 'Laundry Operator',
            'email' => 'operator@linenflow.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_LAUNDRY_OPERATOR,
        ]);
        $operator->assignRole(User::ROLE_LAUNDRY_OPERATOR);

        // Create Head Nurse (assigned to first ward room)
        $nurse = User::factory()->create([
            'name' => 'Head Nurse - Mawar 1',
            'email' => 'nurse@linenflow.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_HEAD_NURSE,
            'room_id' => $wardRooms->first()?->id,
        ]);
        $nurse->assignRole(User::ROLE_HEAD_NURSE);

        // Create another Head Nurse for different room
        if ($wardRooms->count() > 1) {
            $nurse2 = User::factory()->create([
                'name' => 'Head Nurse - Melati',
                'email' => 'nurse2@linenflow.com',
                'password' => Hash::make('password'),
                'role' => User::ROLE_HEAD_NURSE,
                'room_id' => $wardRooms->skip(1)->first()?->id,
            ]);
            $nurse2->assignRole(User::ROLE_HEAD_NURSE);
        }
    }
}

