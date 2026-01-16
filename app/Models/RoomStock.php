<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'linen_id',
        'current_qty',
        'par_stock',
    ];

    protected $casts = [
        'current_qty' => 'integer',
        'par_stock' => 'integer',
    ];

    /**
     * Get the room that owns this stock.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the linen that this stock is for.
     */
    public function linen(): BelongsTo
    {
        return $this->belongsTo(Linen::class);
    }

    /**
     * Check if stock is below par level.
     */
    public function isBelowPar(): bool
    {
        return $this->current_qty < $this->par_stock;
    }

    /**
     * Get the shortage quantity (how many needed to reach par).
     */
    public function getShortageAttribute(): int
    {
        $shortage = $this->par_stock - $this->current_qty;
        return $shortage > 0 ? $shortage : 0;
    }
}
