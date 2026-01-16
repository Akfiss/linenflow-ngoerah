<?php

namespace Database\Seeders;

use App\Models\CentralStock;
use App\Models\Linen;
use App\Models\LinenCategory;
use App\Models\Room;
use App\Models\RoomStock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MasterDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Linen Categories
        $categories = [
            ['name' => 'Bedding', 'slug' => 'bedding'],
            ['name' => 'Apparel', 'slug' => 'apparel'],
            ['name' => 'OK/Surgery', 'slug' => 'ok-surgery'],
            ['name' => 'Towel & Accessories', 'slug' => 'towel-accessories'],
        ];

        foreach ($categories as $category) {
            LinenCategory::create($category);
        }

        // Seed Linens
        $linens = [
            // Bedding
            ['category' => 'bedding', 'name' => 'Sprei Pasien Dewasa Putih', 'sku_code' => 'LIN-SPR-001', 'weight_gram' => 500, 'lifespan' => 100],
            ['category' => 'bedding', 'name' => 'Sprei Pasien Anak Biru', 'sku_code' => 'LIN-SPR-002', 'weight_gram' => 400, 'lifespan' => 100],
            ['category' => 'bedding', 'name' => 'Sarung Bantal Putih', 'sku_code' => 'LIN-SRB-001', 'weight_gram' => 150, 'lifespan' => 80],
            ['category' => 'bedding', 'name' => 'Sarung Guling Putih', 'sku_code' => 'LIN-SRG-001', 'weight_gram' => 200, 'lifespan' => 80],
            ['category' => 'bedding', 'name' => 'Selimut Lurik', 'sku_code' => 'LIN-SLM-001', 'weight_gram' => 800, 'lifespan' => 150],
            ['category' => 'bedding', 'name' => 'Selimut Polos Putih', 'sku_code' => 'LIN-SLM-002', 'weight_gram' => 700, 'lifespan' => 150],

            // Apparel
            ['category' => 'apparel', 'name' => 'Baju Pasien Dewasa', 'sku_code' => 'LIN-BJP-001', 'weight_gram' => 300, 'lifespan' => 60],
            ['category' => 'apparel', 'name' => 'Baju Pasien Anak', 'sku_code' => 'LIN-BJP-002', 'weight_gram' => 200, 'lifespan' => 60],
            ['category' => 'apparel', 'name' => 'Celana Pasien', 'sku_code' => 'LIN-CLP-001', 'weight_gram' => 250, 'lifespan' => 60],
            ['category' => 'apparel', 'name' => 'Jas Dokter', 'sku_code' => 'LIN-JSD-001', 'weight_gram' => 400, 'lifespan' => 100],

            // OK/Surgery
            ['category' => 'ok-surgery', 'name' => 'Baju OK Hijau', 'sku_code' => 'LIN-BOK-001', 'weight_gram' => 250, 'lifespan' => 80],
            ['category' => 'ok-surgery', 'name' => 'Celana OK Hijau', 'sku_code' => 'LIN-COK-001', 'weight_gram' => 200, 'lifespan' => 80],
            ['category' => 'ok-surgery', 'name' => 'Duk Steril', 'sku_code' => 'LIN-DUK-001', 'weight_gram' => 300, 'lifespan' => 50],
            ['category' => 'ok-surgery', 'name' => 'Gordon Steril', 'sku_code' => 'LIN-GRD-001', 'weight_gram' => 400, 'lifespan' => 50],

            // Towel & Accessories
            ['category' => 'towel-accessories', 'name' => 'Handuk Mandi', 'sku_code' => 'LIN-HDK-001', 'weight_gram' => 350, 'lifespan' => 80],
            ['category' => 'towel-accessories', 'name' => 'Lap Tangan', 'sku_code' => 'LIN-LPT-001', 'weight_gram' => 100, 'lifespan' => 60],
        ];

        foreach ($linens as $linenData) {
            $category = LinenCategory::where('slug', $linenData['category'])->first();
            $linen = Linen::create([
                'linen_category_id' => $category->id,
                'name' => $linenData['name'],
                'sku_code' => $linenData['sku_code'],
                'weight_gram' => $linenData['weight_gram'],
                'lifespan_cycles_estimate' => $linenData['lifespan'],
            ]);

            // Create central stock for each linen
            CentralStock::create([
                'linen_id' => $linen->id,
                'clean_qty' => rand(50, 200),
                'dirty_qty' => rand(10, 50),
                'washing_qty' => rand(5, 30),
            ]);
        }

        // Seed Rooms
        $rooms = [
            ['name' => 'IGD', 'type' => Room::TYPE_WARD],
            ['name' => 'ICU Central', 'type' => Room::TYPE_ICU],
            ['name' => 'ICU Jantung', 'type' => Room::TYPE_ICU],
            ['name' => 'Ruang Mawar 1', 'type' => Room::TYPE_WARD],
            ['name' => 'Ruang Mawar 2', 'type' => Room::TYPE_WARD],
            ['name' => 'Ruang Melati', 'type' => Room::TYPE_WARD],
            ['name' => 'Ruang Anggrek', 'type' => Room::TYPE_WARD],
            ['name' => 'Ruang Dahlia', 'type' => Room::TYPE_WARD],
            ['name' => 'Ruang Anak', 'type' => Room::TYPE_WARD],
            ['name' => 'OK Central', 'type' => Room::TYPE_OT],
            ['name' => 'OK Jantung', 'type' => Room::TYPE_OT],
            ['name' => 'Kantor Administrasi', 'type' => Room::TYPE_OFFICE],
        ];

        foreach ($rooms as $roomData) {
            $room = Room::create($roomData);

            // Create room stock for some linens (par stock)
            $allLinens = Linen::all();
            foreach ($allLinens->random(rand(5, 10)) as $linen) {
                RoomStock::create([
                    'room_id' => $room->id,
                    'linen_id' => $linen->id,
                    'current_qty' => rand(5, 30),
                    'par_stock' => rand(10, 40),
                ]);
            }
        }
    }
}
