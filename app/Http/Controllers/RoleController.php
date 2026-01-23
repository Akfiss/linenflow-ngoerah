<?php

namespace App\Http\Controllers;

use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::with('permissions')->orderBy('name')->get();
        $permissions = Permission::orderBy('name')->get();

        // Group permissions by category for the UI
        $permissionGroups = $permissions->groupBy(function ($permission) {
            // Extract category from permission name (e.g., "view_dashboard" -> "dashboard")
            $parts = explode('_', $permission->name);
            if (count($parts) > 1) {
                return ucfirst($parts[count($parts) - 1]);
            }
            return 'General';
        });

        $selectedRoleId = $request->get('role_id', $roles->first()?->id);
        $selectedRole = Role::with('permissions')->find($selectedRoleId);

        return Inertia::render('System/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'permissionGroups' => $permissionGroups,
            'selectedRole' => $selectedRole,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        // Log the activity
        ActivityLogger::logCreated('Role', $role->id, $role->name);

        return redirect()->route('system.roles.index')->with('success', 'Role created successfully.');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        // Track old permissions for logging
        $oldPermissions = $role->permissions->pluck('name')->toArray();
        $newPermissions = $validated['permissions'] ?? [];

        $role->syncPermissions($newPermissions);

        // Log the changes
        $changes = [
            'old_permissions' => $oldPermissions,
            'new_permissions' => $newPermissions,
            'added' => array_diff($newPermissions, $oldPermissions),
            'removed' => array_diff($oldPermissions, $newPermissions),
        ];

        ActivityLogger::logUpdated('Role', $role->id, $role->name, $changes);

        return redirect()->route('system.roles.index', ['role_id' => $role->id])
            ->with('success', 'Permissions updated successfully.');
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, ['super_admin'])) {
            ActivityLogger::logFailed('delete_role', 'Attempted to delete system role: ' . $role->name);
            return redirect()->route('system.roles.index')
                ->with('error', 'Cannot delete system roles.');
        }

        $roleName = $role->name;
        $roleId = $role->id;

        $role->delete();

        // Log the activity
        ActivityLogger::logDeleted('Role', $roleId, $roleName);

        return redirect()->route('system.roles.index')->with('success', 'Role deleted successfully.');
    }
}
