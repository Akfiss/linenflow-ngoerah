<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('linen_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('current_qty')->default(0);
            $table->unsignedInteger('par_stock')->default(0);
            $table->timestamps();

            $table->unique(['room_id', 'linen_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_stocks');
    }
};
