import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { RoleFormModal } from "@/Components/RoleFormModal";
import { ConfirmDialog } from "@/Components/ConfirmDialog";
import { Button } from "@/Components/ui/button";
import {
    ShieldPlus,
    Save,
    Settings2,
    Info,
    ChevronRight,
    ShieldCheck,
    Shirt,
    BadgeCheck,
    Stethoscope,
    LayoutDashboard,
    Warehouse,
    ArrowRightLeft,
    Settings,
    RotateCcw,
    Trash2,
} from "lucide-react";

// Types
interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    roles: Role[];
    permissions: Permission[];
    selectedRole: Role | null;
}

// Permission descriptions for UI
const permissionDescriptions: Record<
    string,
    { label: string; description: string; category: string }
> = {
    view_dashboard: {
        label: "View Dashboard",
        description: "Access main analytics overview",
        category: "Dashboard & Analytics",
    },
    view_global_report: {
        label: "Export Reports",
        description: "Download PDF/Excel logs",
        category: "Dashboard & Analytics",
    },
    view_own_dashboard: {
        label: "Manage Stock (Gudang)",
        description: "Add, edit, or adjust warehouse stock",
        category: "Inventory Management",
    },
    create_adjustment: {
        label: "Delete Items",
        description: "Permanently remove items from system",
        category: "Inventory Management",
    },
    view_all_stats: {
        label: "Adjust Thresholds",
        description: "Set minimum stock alerts",
        category: "Inventory Management",
    },
    create_trx_distribution: {
        label: "Create Distribution",
        description: "Initiate linen distribution to rooms",
        category: "Transactions",
    },
    create_trx_collection: {
        label: "Approve Returns",
        description: "Validate dirty linen returns",
        category: "Transactions",
    },
    confirm_receipt: {
        label: "Confirm Receipt",
        description: "Confirm linen receipt for assigned room",
        category: "Transactions",
    },
    create_transaction_process: {
        label: "Process Transactions",
        description: "Handle washing and processing",
        category: "Transactions",
    },
    view_financial_reports: {
        label: "View Financial Reports",
        description: "Access financial and loss reports",
        category: "Dashboard & Analytics",
    },
    manage_master_data: {
        label: "Manage Master Data",
        description: "CRUD operations for linens and rooms",
        category: "System Administration",
    },
    manage_users: {
        label: "Manage Users",
        description: "Create or delete user accounts",
        category: "System Administration",
    },
    assign_roles: {
        label: "Edit Roles",
        description: "Modify permission matrices",
        category: "System Administration",
    },
};

// Group permissions by category
function groupPermissions(
    permissions: Permission[],
): Record<string, Permission[]> {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach((perm) => {
        const desc = permissionDescriptions[perm.name];
        const category = desc?.category || "Other";
        if (!groups[category]) groups[category] = [];
        groups[category].push(perm);
    });
    return groups;
}

// Get category icon component
function getCategoryIcon(category: string) {
    const icons: Record<string, React.ReactNode> = {
        "Dashboard & Analytics": (
            <LayoutDashboard className="h-5 w-5 text-slate-400" />
        ),
        "Inventory Management": (
            <Warehouse className="h-5 w-5 text-slate-400" />
        ),
        Transactions: <ArrowRightLeft className="h-5 w-5 text-slate-400" />,
        "System Administration": (
            <Settings className="h-5 w-5 text-slate-400" />
        ),
    };
    return icons[category] || <Settings className="h-5 w-5 text-slate-400" />;
}

// Get role icon component
function getRoleIcon(roleName: string) {
    const icons: Record<string, React.ReactNode> = {
        super_admin: <ShieldCheck className="h-5 w-5" />,
        laundry_manager: <Shirt className="h-5 w-5" />,
        laundry_operator: <BadgeCheck className="h-5 w-5" />,
        head_nurse: <Stethoscope className="h-5 w-5" />,
    };
    return icons[roleName] || <ShieldCheck className="h-5 w-5" />;
}

// Get role display name
function getRoleDisplayName(roleName: string): string {
    const names: Record<string, string> = {
        super_admin: "Super Admin",
        laundry_manager: "Laundry Manager",
        laundry_operator: "Laundry Operator",
        head_nurse: "Head Nurse",
    };
    return names[roleName] || roleName.replace("_", " ");
}

// Get role description
function getRoleDescription(roleName: string): string {
    const descriptions: Record<string, string> = {
        super_admin:
            "Super Admin has full control over the system including user management and role assignments.",
        laundry_manager:
            "Laundry Manager has full control over inventory and daily transactions but cannot modify system settings or user accounts.",
        laundry_operator:
            "Laundry Operator can manage daily linen distribution and collection tasks.",
        head_nurse:
            "Head Nurse can view room stock and confirm linen receipts for their assigned room.",
    };
    return descriptions[roleName] || "No description available.";
}

// Check if role is a system role
function isSystemRole(roleName: string): boolean {
    return [
        "super_admin",
        "laundry_manager",
        "laundry_operator",
        "head_nurse",
    ].includes(roleName);
}

export default function RolesIndex({
    roles,
    permissions,
    selectedRole,
}: Props) {
    // Mock data for display if no real data
    const mockRoles: Role[] = [
        { id: 1, name: "super_admin", permissions: [] },
        {
            id: 2,
            name: "laundry_manager",
            permissions: [
                { id: 1, name: "view_dashboard" },
                { id: 2, name: "view_global_report" },
                { id: 3, name: "view_own_dashboard" },
                { id: 5, name: "view_all_stats" },
                { id: 6, name: "create_trx_distribution" },
                { id: 7, name: "create_trx_collection" },
            ],
        },
        {
            id: 3,
            name: "laundry_operator",
            permissions: [
                { id: 1, name: "view_dashboard" },
                { id: 6, name: "create_trx_distribution" },
                { id: 7, name: "create_trx_collection" },
            ],
        },
        {
            id: 4,
            name: "head_nurse",
            permissions: [{ id: 1, name: "view_dashboard" }],
        },
    ];

    const mockPermissions: Permission[] = [
        { id: 1, name: "view_dashboard" },
        { id: 2, name: "view_global_report" },
        { id: 3, name: "view_own_dashboard" },
        { id: 4, name: "create_adjustment" },
        { id: 5, name: "view_all_stats" },
        { id: 6, name: "create_trx_distribution" },
        { id: 7, name: "create_trx_collection" },
        { id: 8, name: "manage_users" },
        { id: 9, name: "assign_roles" },
    ];

    const displayRoles = roles?.length > 0 ? roles : mockRoles;
    const displayPermissions =
        permissions?.length > 0 ? permissions : mockPermissions;

    const [currentRoleId, setCurrentRoleId] = useState<number>(
        selectedRole?.id || displayRoles[0]?.id || 1,
    );
    const currentRole =
        displayRoles.find((r) => r.id === currentRoleId) || displayRoles[0];

    const [enabledPermissions, setEnabledPermissions] = useState<Set<string>>(
        new Set(currentRole?.permissions.map((p) => p.name) || []),
    );

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const groupedPermissions = groupPermissions(displayPermissions);

    const handleRoleSelect = (roleId: number) => {
        setCurrentRoleId(roleId);
        const role = displayRoles.find((r) => r.id === roleId);
        setEnabledPermissions(
            new Set(role?.permissions.map((p) => p.name) || []),
        );
    };

    const togglePermission = (permName: string) => {
        const newSet = new Set(enabledPermissions);
        if (newSet.has(permName)) {
            newSet.delete(permName);
        } else {
            newSet.add(permName);
        }
        setEnabledPermissions(newSet);
    };

    const isSystemPermission = (permName: string) => {
        return permName === "manage_users" || permName === "assign_roles";
    };

    const isSuperAdmin = currentRole?.name === "super_admin";

    const handleSaveChanges = () => {
        if (!currentRole) return;
        setIsSaving(true);

        router.put(
            route("system.roles.update", currentRole.id),
            {
                permissions: Array.from(enabledPermissions),
            },
            {
                onFinish: () => setIsSaving(false),
            },
        );
    };

    const handleResetToDefault = () => {
        const role = displayRoles.find((r) => r.id === currentRoleId);
        setEnabledPermissions(
            new Set(role?.permissions.map((p) => p.name) || []),
        );
    };

    const handleDeleteRole = () => {
        if (!currentRole || isSystemRole(currentRole.name)) return;

        router.delete(route("system.roles.destroy", currentRole.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                if (displayRoles.length > 1) {
                    setCurrentRoleId(displayRoles[0].id);
                }
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Roles & Akses" />

            <div className="flex flex-col gap-6">
                {/* Page Title & Actions */}
                <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Roles & Akses
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Manage user roles and define access permissions for
                            the system.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="gap-2 shadow-lg shadow-primary/20"
                    >
                        <ShieldPlus className="h-4 w-4" />
                        Create New Role
                    </Button>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Roles Sidebar */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                                <h3 className="font-semibold text-slate-900 text-sm uppercase tracking-wide">
                                    Available Roles
                                </h3>
                            </div>
                            <div className="p-2 flex flex-col gap-1">
                                {displayRoles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() =>
                                            handleRoleSelect(role.id)
                                        }
                                        className={`flex items-center justify-between w-full p-3 rounded-lg text-left text-sm transition-all ${
                                            currentRoleId === role.id
                                                ? "font-bold bg-primary/5 text-primary ring-1 ring-primary/20 shadow-sm"
                                                : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={
                                                    currentRoleId === role.id
                                                        ? "text-primary"
                                                        : "text-slate-400"
                                                }
                                            >
                                                {getRoleIcon(role.name)}
                                            </span>
                                            {getRoleDisplayName(role.name)}
                                        </div>
                                        {currentRoleId === role.id && (
                                            <span className="flex size-2 rounded-full bg-primary"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Role Description */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-blue-900 leading-relaxed">
                                    <span className="font-bold block mb-1">
                                        Role Description
                                    </span>
                                    {getRoleDescription(
                                        currentRole?.name || "",
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Delete Role Button (for custom roles only) */}
                        {currentRole && !isSystemRole(currentRole.name) && (
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
                                onClick={() => setIsDeleteDialogOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Role
                            </Button>
                        )}
                    </div>

                    {/* Permissions Matrix */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
                            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                        <Settings2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">
                                            Permissions Matrix
                                        </h3>
                                        <p className="text-slate-500 text-xs">
                                            Configure access levels for{" "}
                                            <span className="font-medium text-primary">
                                                {getRoleDisplayName(
                                                    currentRole?.name || "",
                                                )}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        onClick={handleResetToDefault}
                                        className="gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Reset to Default
                                    </Button>
                                    <Button
                                        onClick={handleSaveChanges}
                                        disabled={isSaving}
                                        className="gap-2 shadow-md"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isSaving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6">
                                {Object.entries(groupedPermissions).map(
                                    ([category, perms], idx) => (
                                        <div
                                            key={category}
                                            className={
                                                idx <
                                                Object.keys(groupedPermissions)
                                                    .length -
                                                    1
                                                    ? "mb-8"
                                                    : ""
                                            }
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                {getCategoryIcon(category)}
                                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                                    {category}
                                                </h4>
                                                <div className="h-px bg-slate-200 flex-1 ml-4"></div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {perms.map((perm) => {
                                                    const desc =
                                                        permissionDescriptions[
                                                            perm.name
                                                        ];
                                                    const isChecked =
                                                        enabledPermissions.has(
                                                            perm.name,
                                                        );
                                                    const isDisabled =
                                                        isSystemPermission(
                                                            perm.name,
                                                        ) && !isSuperAdmin;

                                                    return (
                                                        <div
                                                            key={perm.id}
                                                            className={`flex items-start justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-slate-50/50 ${isDisabled ? "opacity-75" : ""}`}
                                                        >
                                                            <div>
                                                                <p
                                                                    className={`text-sm font-semibold ${isDisabled ? "text-slate-400" : "text-slate-900"}`}
                                                                >
                                                                    {desc?.label ||
                                                                        perm.name.replace(
                                                                            /_/g,
                                                                            " ",
                                                                        )}
                                                                </p>
                                                                <p
                                                                    className={`text-xs mt-0.5 ${isDisabled ? "text-slate-400" : "text-slate-500"}`}
                                                                >
                                                                    {desc?.description ||
                                                                        ""}
                                                                </p>
                                                            </div>
                                                            <label
                                                                className={`relative inline-flex items-center ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        isChecked
                                                                    }
                                                                    disabled={
                                                                        isDisabled
                                                                    }
                                                                    onChange={() =>
                                                                        !isDisabled &&
                                                                        togglePermission(
                                                                            perm.name,
                                                                        )
                                                                    }
                                                                    className="sr-only peer"
                                                                />
                                                                <div
                                                                    className={`w-11 h-6 ${isDisabled ? "bg-slate-100" : "bg-slate-200"} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDisabled ? "peer-checked:bg-slate-300" : "peer-checked:bg-primary"}`}
                                                                ></div>
                                                            </label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <RoleFormModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Delete Role"
                description={`Are you sure you want to delete the role "${getRoleDisplayName(currentRole?.name || "")}"? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleDeleteRole}
                variant="destructive"
            />
        </AuthenticatedLayout>
    );
}
