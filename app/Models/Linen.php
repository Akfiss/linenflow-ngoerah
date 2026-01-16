<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Linen extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'linen_category_id',
        'name',
        'sku_code',
        'weight_gram',
        'lifespan_cycles_estimate',
    ];

    protected $casts = [
        'weight_gram' => 'integer',
        'lifespan_cycles_estimate' => 'integer',
    ];

    /**
     * Get the category that owns this linen.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(LinenCategory::class, 'linen_category_id');
    }

    /**
     * Get the central stock for this linen.
     */
    public function centralStock(): HasOne
    {
        return $this->hasOne(CentralStock::class);
    }

    /**
     * Get all room stocks for this linen.
     */
    public function roomStocks(): HasMany
    {
        return $this->hasMany(RoomStock::class);
    }

    /**
     * Get all transaction details for this linen.
     */
    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
