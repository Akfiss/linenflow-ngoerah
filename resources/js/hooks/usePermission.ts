import { usePage } from "@inertiajs/react";

interface AuthProps {
    user: {
        id: number;
        name: string;
        email: string;
        role?: string;
        room_id?: number | null;
    };
    permissions: string[];
    roles: string[];
}

export function usePermission() {
    const { auth } = usePage<{ auth: AuthProps }>().props;

    const can = (permission: string): boolean => {
        return auth.permissions?.includes(permission) ?? false;
    };

    const hasRole = (role: string): boolean => {
        return auth.roles?.includes(role) ?? false;
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some((permission) => can(permission));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        return permissions.every((permission) => can(permission));
    };

    return {
        can,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        permissions: auth.permissions ?? [],
        roles: auth.roles ?? [],
        user: auth.user,
    };
}
