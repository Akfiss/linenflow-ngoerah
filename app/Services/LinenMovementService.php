<?php

namespace App\Services;

use App\Models\CentralStock;
use App\Models\Linen;
use App\Models\Room;
use App\Models\RoomStock;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LinenMovementService
{
    /**
     * Distribute clean linen from central to a room.
     * Effect: Central clean_qty ⬇️, Room current_qty ⬆️
     *
     * @param Room $room Target room
     * @param array $items Array of ['linen_id' => qty]
     * @param User $user User performing the action
     * @param string|null $notes Optional notes
     * @return Transaction
     */
    public function distribute(Room $room, array $items, User $user, ?string $notes = null): Transaction
    {
        return DB::transaction(function () use ($room, $items, $user, $notes) {
            // Create transaction
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_OUT_DISTRIBUTION),
                'type' => Transaction::TYPE_OUT_DISTRIBUTION,
                'room_id' => $room->id,
                'user_id' => $user->id,
                'trx_date' => now()->toDateString(),
                'notes' => $notes,
            ]);

            foreach ($items as $linenId => $qty) {
                if ($qty <= 0) continue;

                // Validate and update central stock
                $centralStock = CentralStock::where('linen_id', $linenId)->lockForUpdate()->first();
                if (!$centralStock || $centralStock->clean_qty < $qty) {
                    throw new InvalidArgumentException(
                        "Stok bersih tidak cukup untuk linen ID: {$linenId}. Tersedia: " . ($centralStock?->clean_qty ?? 0)
                    );
                }
                $centralStock->decrement('clean_qty', $qty);

                // Update or create room stock
                $roomStock = RoomStock::firstOrCreate(
                    ['room_id' => $room->id, 'linen_id' => $linenId],
                    ['current_qty' => 0, 'par_stock' => 0]
                );
                $roomStock->increment('current_qty', $qty);

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $linenId,
                    'qty' => $qty,
                ]);
            }

            return $transaction;
        });
    }

    /**
     * Collect dirty linen from a room to central.
     * Effect: Room current_qty ⬇️, Central dirty_qty ⬆️
     *
     * @param Room $room Source room
     * @param array $items Array of ['linen_id' => qty]
     * @param User $user User performing the action
     * @param string|null $notes Optional notes
     * @return Transaction
     */
    public function collect(Room $room, array $items, User $user, ?string $notes = null): Transaction
    {
        return DB::transaction(function () use ($room, $items, $user, $notes) {
            // Create transaction
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_IN_COLLECTION),
                'type' => Transaction::TYPE_IN_COLLECTION,
                'room_id' => $room->id,
                'user_id' => $user->id,
                'trx_date' => now()->toDateString(),
                'notes' => $notes,
            ]);

            foreach ($items as $linenId => $qty) {
                if ($qty <= 0) continue;

                // Update room stock
                $roomStock = RoomStock::where('room_id', $room->id)
                    ->where('linen_id', $linenId)
                    ->lockForUpdate()
                    ->first();

                if (!$roomStock || $roomStock->current_qty < $qty) {
                    throw new InvalidArgumentException(
                        "Stok ruangan tidak cukup untuk linen ID: {$linenId}. Tersedia: " . ($roomStock?->current_qty ?? 0)
                    );
                }
                $roomStock->decrement('current_qty', $qty);

                // Update central dirty stock
                $centralStock = CentralStock::firstOrCreate(
                    ['linen_id' => $linenId],
                    ['clean_qty' => 0, 'dirty_qty' => 0, 'washing_qty' => 0]
                );
                $centralStock->increment('dirty_qty', $qty);

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $linenId,
                    'qty' => $qty,
                ]);
            }

            return $transaction;
        });
    }

    /**
     * Start washing process for dirty linen.
     * Effect: Central dirty_qty ⬇️, Central washing_qty ⬆️
     *
     * @param array $items Array of ['linen_id' => qty]
     * @param User $user User performing the action
     * @param string|null $notes Optional notes
     * @return Transaction
     */
    public function startWash(array $items, User $user, ?string $notes = null): Transaction
    {
        return DB::transaction(function () use ($items, $user, $notes) {
            // Create transaction
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_WASH_START),
                'type' => Transaction::TYPE_WASH_START,
                'room_id' => null,
                'user_id' => $user->id,
                'trx_date' => now()->toDateString(),
                'notes' => $notes,
            ]);

            foreach ($items as $linenId => $qty) {
                if ($qty <= 0) continue;

                // Update central stock
                $centralStock = CentralStock::where('linen_id', $linenId)->lockForUpdate()->first();
                if (!$centralStock || $centralStock->dirty_qty < $qty) {
                    throw new InvalidArgumentException(
                        "Stok kotor tidak cukup untuk linen ID: {$linenId}. Tersedia: " . ($centralStock?->dirty_qty ?? 0)
                    );
                }
                $centralStock->decrement('dirty_qty', $qty);
                $centralStock->increment('washing_qty', $qty);

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $linenId,
                    'qty' => $qty,
                ]);
            }

            return $transaction;
        });
    }

    /**
     * Finish washing process.
     * Effect: Central washing_qty ⬇️, Central clean_qty ⬆️
     *
     * @param array $items Array of ['linen_id' => qty]
     * @param User $user User performing the action
     * @param string|null $notes Optional notes
     * @return Transaction
     */
    public function finishWash(array $items, User $user, ?string $notes = null): Transaction
    {
        return DB::transaction(function () use ($items, $user, $notes) {
            // Create transaction
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_WASH_FINISH),
                'type' => Transaction::TYPE_WASH_FINISH,
                'room_id' => null,
                'user_id' => $user->id,
                'trx_date' => now()->toDateString(),
                'notes' => $notes,
            ]);

            foreach ($items as $linenId => $qty) {
                if ($qty <= 0) continue;

                // Update central stock
                $centralStock = CentralStock::where('linen_id', $linenId)->lockForUpdate()->first();
                if (!$centralStock || $centralStock->washing_qty < $qty) {
                    throw new InvalidArgumentException(
                        "Stok sedang cuci tidak cukup untuk linen ID: {$linenId}. Tersedia: " . ($centralStock?->washing_qty ?? 0)
                    );
                }
                $centralStock->decrement('washing_qty', $qty);
                $centralStock->increment('clean_qty', $qty);

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $linenId,
                    'qty' => $qty,
                ]);
            }

            return $transaction;
        });
    }

    /**
     * Dispose/afkir linen (remove from stock).
     * Effect: Central clean_qty ⬇️ (or dirty/washing based on source)
     *
     * @param array $items Array of ['linen_id' => qty]
     * @param string $source 'clean', 'dirty', or 'washing'
     * @param User $user User performing the action
     * @param string|null $notes Reason for disposal (required)
     * @return Transaction
     */
    public function dispose(array $items, string $source, User $user, ?string $notes = null): Transaction
    {
        $sourceField = match ($source) {
            'clean' => 'clean_qty',
            'dirty' => 'dirty_qty',
            'washing' => 'washing_qty',
            default => throw new InvalidArgumentException("Invalid source: {$source}"),
        };

        return DB::transaction(function () use ($items, $sourceField, $user, $notes) {
            // Create transaction
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_DISPOSAL),
                'type' => Transaction::TYPE_DISPOSAL,
                'room_id' => null,
                'user_id' => $user->id,
                'trx_date' => now()->toDateString(),
                'notes' => $notes,
            ]);

            foreach ($items as $linenId => $qty) {
                if ($qty <= 0) continue;

                // Update central stock
                $centralStock = CentralStock::where('linen_id', $linenId)->lockForUpdate()->first();
                if (!$centralStock || $centralStock->{$sourceField} < $qty) {
                    throw new InvalidArgumentException(
                        "Stok tidak cukup untuk linen ID: {$linenId}. Tersedia: " . ($centralStock?->{$sourceField} ?? 0)
                    );
                }
                $centralStock->decrement($sourceField, $qty);

                // Create transaction detail
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'linen_id' => $linenId,
                    'qty' => $qty,
                ]);
            }

            return $transaction;
        });
    }

    /**
     * Stock adjustment (opname).
     * Effect: Adjusts stock to match physical count.
     *
     * @param int $linenId Linen ID
     * @param array $adjustments ['clean_qty' => val, 'dirty_qty' => val, 'washing_qty' => val]
     * @param User $user User performing the action
     * @param string|null $notes Reason for adjustment
     * @return Transaction
     */
    public function adjust(int $linenId, array $adjustments, User $user, ?string $notes = null): Transaction
    {
        return DB::transaction(function () use ($linenId, $adjustments, $user, $notes) {
            $centralStock = CentralStock::where('linen_id', $linenId)->lockForUpdate()->first();
            if (!$centralStock) {
                throw new InvalidArgumentException("Central stock not found for linen ID: {$linenId}");
            }

            // Calculate difference
            $diff = 0;
            foreach (['clean_qty', 'dirty_qty', 'washing_qty'] as $field) {
                if (isset($adjustments[$field])) {
                    $diff += abs($adjustments[$field] - $centralStock->{$field});
                    $centralStock->{$field} = $adjustments[$field];
                }
            }
            $centralStock->save();

            // Create transaction
            $transaction = Transaction::create([
                'trx_code' => Transaction::generateTrxCode(Transaction::TYPE_ADJUSTMENT),
                'type' => Transaction::TYPE_ADJUSTMENT,
                'room_id' => null,
                'user_id' => $user->id,
                'trx_date' => now()->toDateString(),
                'notes' => $notes,
            ]);

            // Create transaction detail with net difference
            TransactionDetail::create([
                'transaction_id' => $transaction->id,
                'linen_id' => $linenId,
                'qty' => $diff,
            ]);

            return $transaction;
        });
    }
}
