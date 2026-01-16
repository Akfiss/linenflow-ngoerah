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
        Schema::create('central_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('linen_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('clean_qty')->default(0);
            $table->unsignedInteger('dirty_qty')->default(0);
            $table->unsignedInteger('washing_qty')->default(0);
            $table->timestamps();

            $table->unique('linen_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('central_stocks');
    }
};
