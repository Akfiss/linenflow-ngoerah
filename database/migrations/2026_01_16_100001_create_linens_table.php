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
        Schema::create('linens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('linen_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('sku_code')->unique();
            $table->integer('weight_gram')->default(0);
            $table->integer('lifespan_cycles_estimate')->default(100);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('linens');
    }
};
