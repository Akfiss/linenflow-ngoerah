<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LinenRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'linen_request_id',
        'linen_id',
        'qty',
    ];

    protected $casts = [
        'qty' => 'integer',
    ];

    /**
     * Get the request for this item.
     */
    public function linenRequest(): BelongsTo
    {
        return $this->belongsTo(LinenRequest::class);
    }

    /**
     * Get the linen for this item.
     */
    public function linen(): BelongsTo
    {
        return $this->belongsTo(Linen::class);
    }
}
