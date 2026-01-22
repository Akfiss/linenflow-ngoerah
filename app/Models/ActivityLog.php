<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'target_type',
        'target_id',
        'target_name',
        'status',
        'metadata',
        'ip_address',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the user who performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to filter by action type.
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by target type.
     */
    public function scopeForTarget($query, string $type, ?int $id = null)
    {
        $query->where('target_type', $type);
        if ($id) {
            $query->where('target_id', $id);
        }
        return $query;
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeDateRange($query, $start, $end)
    {
        return $query->whereBetween('created_at', [$start, $end]);
    }

    /**
     * Get formatted action description.
     */
    public function getDescriptionAttribute(): string
    {
        $action = ucfirst($this->action);
        $target = $this->target_name ?? $this->target_type;
        
        if ($target) {
            return "{$action} {$target}";
        }
        
        return $action;
    }
}
