<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    /**
     * Role constants for easy reference.
     */
    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_LAUNDRY_MANAGER = 'laundry_manager';
    public const ROLE_LAUNDRY_OPERATOR = 'laundry_operator';
    public const ROLE_HEAD_NURSE = 'head_nurse';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'room_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the room that this user is assigned to (for Head Nurse).
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get all transactions created by this user.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Check if user is a laundry manager.
     */
    public function isLaundryManager(): bool
    {
        return $this->role === self::ROLE_LAUNDRY_MANAGER;
    }

    /**
     * Check if user is a laundry operator.
     */
    public function isLaundryOperator(): bool
    {
        return $this->role === self::ROLE_LAUNDRY_OPERATOR;
    }

    /**
     * Check if user is a head nurse.
     */
    public function isHeadNurse(): bool
    {
        return $this->role === self::ROLE_HEAD_NURSE;
    }

    /**
     * Get all available roles.
     */
    public static function getRoles(): array
    {
        return [
            self::ROLE_SUPER_ADMIN => 'Super Admin',
            self::ROLE_LAUNDRY_MANAGER => 'Laundry Manager',
            self::ROLE_LAUNDRY_OPERATOR => 'Laundry Operator',
            self::ROLE_HEAD_NURSE => 'Head Nurse',
        ];
    }
}
