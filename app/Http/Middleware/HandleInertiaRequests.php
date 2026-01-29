<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Define role-based permissions (simplified map)
        $permissionsMap = [
            'super_admin' => ['view_admin_dashboard', 'manage_users', 'assign_roles'],
            'laundry_manager' => ['view_manager_dashboard', 'view_reports', 'manage_linen', 'manage_distribution'],
            'laundry_operator' => ['view_operator_dashboard', 'manage_linen', 'manage_distribution'],
            'head_nurse' => ['view_nurse_dashboard', 'request_linen', 'confirm_distribution'],
            'system' => [], // Fallback
        ];

        // Get primary role from Spatie (preferred) or fallback to role column
        $primaryRole = null;
        if ($user) {
            $primaryRole = $user->roles->first()?->name ?? $user->role;
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $primaryRole,
                    'room_id' => $user->room_id,
                    'room' => $user->room ? [
                        'id' => $user->room->id,
                        'name' => $user->room->name,
                    ] : null,
                ] : null,
                'permissions' => $user ? array_merge($user->getAllPermissions()->pluck('name')->toArray(), $permissionsMap[$primaryRole] ?? []) : [],
                'roles' => $user ? ($primaryRole ? [$primaryRole] : []) : [],
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}

