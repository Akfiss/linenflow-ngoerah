<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WashLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'linen_id',
        'central_stock_id',
        'qty',
        'action',
        'logged_at',
        'user_id',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
        'qty' => 'integer',
    ];

    const ACTION_START = 'start';
    const ACTION_FINISH = 'finish';

    /**
     * Get the linen for this log.
     */
    public function linen(): BelongsTo
    {
        return $this->belongsTo(Linen::class);
    }

    /**
     * Get the central stock for this log.
     */
    public function centralStock(): BelongsTo
    {
        return $this->belongsTo(CentralStock::class);
    }

    /**
     * Get the user who performed this action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
