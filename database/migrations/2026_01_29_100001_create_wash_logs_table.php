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
        Schema::create('wash_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('linen_id')->constrained()->onDelete('cascade');
            $table->foreignId('central_stock_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('qty');
            $table->enum('action', ['start', 'finish']);
            $table->timestamp('logged_at');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->index(['linen_id', 'action', 'logged_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wash_logs');
    }
};
