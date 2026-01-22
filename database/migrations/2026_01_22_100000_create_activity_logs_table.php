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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // e.g., 'created', 'updated', 'deleted', 'login', 'logout'
            $table->string('target_type')->nullable(); // e.g., 'User', 'Role', 'Transaction'
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('target_name')->nullable(); // Human readable name
            $table->enum('status', ['success', 'warning', 'error'])->default('success');
            $table->json('metadata')->nullable(); // Additional data
            $table->string('ip_address')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['target_type', 'target_id']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
