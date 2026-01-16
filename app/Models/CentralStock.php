<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CentralStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'linen_id',
        'clean_qty',
        'dirty_qty',
        'washing_qty',
    ];

    protected $casts = [
        'clean_qty' => 'integer',
        'dirty_qty' => 'integer',
        'washing_qty' => 'integer',
    ];

    /**
     * Get the linen that owns this stock.
     */
    public function linen(): BelongsTo
    {
        return $this->belongsTo(Linen::class);
    }

    /**
     * Get total stock in central (all states).
     */
    public function getTotalQtyAttribute(): int
    {
        return $this->clean_qty + $this->dirty_qty + $this->washing_qty;
    }
}
