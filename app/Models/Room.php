<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Room extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
    ];

    /**
     * Room type constants.
     */
    public const TYPE_WARD = 'WARD';
    public const TYPE_ICU = 'ICU';
    public const TYPE_OT = 'OT';
    public const TYPE_OFFICE = 'OFFICE';

    /**
     * Get all room stocks in this room.
     */
    public function roomStocks(): HasMany
    {
        return $this->hasMany(RoomStock::class);
    }

    /**
     * Get all users assigned to this room.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get all transactions involving this room.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get available room types.
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_WARD => 'Ward (Ruang Rawat)',
            self::TYPE_ICU => 'ICU',
            self::TYPE_OT => 'OT (Operating Theatre)',
            self::TYPE_OFFICE => 'Office',
        ];
    }
}
