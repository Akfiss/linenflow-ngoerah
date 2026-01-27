<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'trx_code',
        'type',
        'room_id',
        'user_id',
        'trx_date',
        'notes',
        'status',
        'confirmed_at',
        'confirmed_by',
        'confirmation_notes',
    ];

    protected $casts = [
        'trx_date' => 'date',
        'confirmed_at' => 'datetime',
    ];


    /**
     * Transaction type constants.
     */
    public const TYPE_OUT_DISTRIBUTION = 'OUT_DISTRIBUTION';
    public const TYPE_IN_COLLECTION = 'IN_COLLECTION';
    public const TYPE_WASH_START = 'WASH_START';
    public const TYPE_WASH_FINISH = 'WASH_FINISH';
    public const TYPE_ADJUSTMENT = 'ADJUSTMENT';
    public const TYPE_DISPOSAL = 'DISPOSAL';

    /**
     * Get the room associated with this transaction.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the user who created this transaction.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transaction details (line items).
     */
    public function details(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    /**
     * Get the user who confirmed this transaction.
     */
    public function confirmedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'confirmed_by');
    }


    /**
     * Get available transaction types with labels.
     */
    public static function getTypes(): array
    {
        return [
            self::TYPE_OUT_DISTRIBUTION => 'Distribusi Bersih',
            self::TYPE_IN_COLLECTION => 'Penerimaan Kotor',
            self::TYPE_WASH_START => 'Mulai Cuci',
            self::TYPE_WASH_FINISH => 'Selesai Cuci',
            self::TYPE_ADJUSTMENT => 'Penyesuaian',
            self::TYPE_DISPOSAL => 'Afkir',
        ];
    }

    /**
     * Generate a unique transaction code.
     */
    public static function generateTrxCode(string $type): string
    {
        $prefix = match ($type) {
            self::TYPE_OUT_DISTRIBUTION => 'DIST',
            self::TYPE_IN_COLLECTION => 'COLL',
            self::TYPE_WASH_START => 'WSS',
            self::TYPE_WASH_FINISH => 'WSF',
            self::TYPE_ADJUSTMENT => 'ADJ',
            self::TYPE_DISPOSAL => 'DIS',
            default => 'TRX',
        };

        $date = now()->format('Ymd');
        $count = static::whereDate('created_at', today())->count() + 1;

        return sprintf('%s-%s-%04d', $prefix, $date, $count);
    }
}
