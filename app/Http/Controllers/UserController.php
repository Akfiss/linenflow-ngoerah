<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use App\Models\Room;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['roles', 'room']);

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->whereHas('roles', function($q) use ($request) {
                $q->where('name', $request->role);
            });
        }

        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        
        if ($sortField === 'role') {
            // Can't sort by role easily, default to name
            $query->orderBy('name', $sortDirection);
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $users = $query->paginate(10)->withQueryString();

        $roles = Role::orderBy('name')->get();
        $rooms = Room::orderBy('name')->get();

        return Inertia::render('System/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'rooms' => $rooms,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'sort' => $sortField,
                'direction' => $sortDirection,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:users,name',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
            'room_id' => 'nullable|exists:rooms,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'room_id' => $validated['room_id'] ?? null,
        ]);

        $user->assignRole($validated['role']);

        // Log the activity
        ActivityLogger::logCreated('User', $user->id, $user->name);

        return redirect()->route('system.users.index')->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:users,name,' . $user->id,
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|string|exists:roles,name',
            'room_id' => 'nullable|exists:rooms,id',
            'is_active' => 'boolean',
        ]);

        // Track changes for logging
        $oldData = [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->roles->first()?->name,
            'room_id' => $user->room_id,
        ];

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'room_id' => $validated['room_id'] ?? null,
        ]);

        $user->syncRoles([$validated['role']]);

        // Calculate changes
        $changes = [
            'old' => $oldData,
            'new' => [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'room_id' => $validated['room_id'] ?? null,
            ],
        ];

        // Log the activity
        ActivityLogger::logUpdated('User', $user->id, $user->name, $changes);

        return redirect()->route('system.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            ActivityLogger::logFailed('delete_user', 'Attempted to delete own account');
            return redirect()->route('system.users.index')
                ->with('error', 'Anda tidak dapat menghapus akun Anda sendiri!');
        }

        $userName = $user->name;
        $userId = $user->id;
        
        $user->delete();

        // Log the activity
        ActivityLogger::logDeleted('User', $userId, $userName);

        return redirect()->route('system.users.index')->with('success', 'User deleted successfully.');
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => bcrypt('password123'),
        ]);

        // Log the activity
        ActivityLogger::log('password_reset', 'User', $user->id, $user->name);

        return redirect()->route('system.users.index')->with('success', 'Password reset to default.');
    }

    public function restore(User $user)
    {
        $user->restore();

        // Log the activity
        ActivityLogger::log('restored', 'User', $user->id, $user->name);

        return redirect()->route('system.users.index')->with('success', 'User restored successfully.');
    }
}
