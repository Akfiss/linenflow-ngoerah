<?php

namespace App\Http\Controllers;

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

        Role::create([
            'name' => $validated['name'],
            'guard_name' => 'web',
        ]);

        return redirect()->route('system.roles.index')->with('success', 'Role created successfully.');
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->route('system.roles.index', ['role_id' => $role->id])
            ->with('success', 'Permissions updated successfully.');
    }

    public function destroy(Role $role)
    {
        if (in_array($role->name, ['super_admin'])) {
            return redirect()->route('system.roles.index')
                ->with('error', 'Cannot delete system roles.');
        }

        $role->delete();
        return redirect()->route('system.roles.index')->with('success', 'Role deleted successfully.');
    }
}
