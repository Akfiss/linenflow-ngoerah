<?php

namespace App\Http\Controllers;

use App\Models\User;
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

        $users = $query->orderBy('name')->paginate(10)->withQueryString();

        $roles = Role::orderBy('name')->get();
        $rooms = Room::orderBy('name')->get();

        return Inertia::render('System/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'rooms' => $rooms,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
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

        return redirect()->route('system.users.index')->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|string|exists:roles,name',
            'room_id' => 'nullable|exists:rooms,id',
            'is_active' => 'boolean',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'room_id' => $validated['room_id'] ?? null,
        ]);

        $user->syncRoles([$validated['role']]);

        return redirect()->route('system.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('system.users.index')->with('success', 'User deleted successfully.');
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => bcrypt('password123'),
        ]);

        return redirect()->route('system.users.index')->with('success', 'Password reset to default.');
    }

    public function restore(User $user)
    {
        $user->restore();
        return redirect()->route('system.users.index')->with('success', 'User restored successfully.');
    }
}
