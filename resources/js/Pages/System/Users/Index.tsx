import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import { UserFormModal } from "@/Components/UserFormModal";
import { ConfirmDialog } from "@/Components/ConfirmDialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Plus,
    Search,
    Filter,
    Download,
    Pencil,
    KeyRound,
    Trash2,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

// Types
interface Role {
    id: number;
    name: string;
}

interface Room {
    id: number;
    name: string;
}

interface UserType {
    id: number;
    name: string;
    email: string;
    room?: Room | null;
    room_id?: number | null;
    roles: Role[];
    deleted_at?: string | null;
}

interface PaginatedUsers {
    data: UserType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    users: PaginatedUsers;
    roles: Role[];
    rooms: Room[];
    filters?: {
        search?: string;
        role?: string;
    };
}

// Helper to get initials
function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

// Helper to get role color
function getRoleStyle(roleName: string): {
    bg: string;
    text: string;
    border: string;
} {
    const styles: Record<string, { bg: string; text: string; border: string }> =
        {
            super_admin: {
                bg: "bg-slate-900",
                text: "text-white",
                border: "border-transparent",
            },
            laundry_manager: {
                bg: "bg-blue-100",
                text: "text-blue-700",
                border: "border-blue-200",
            },
            laundry_operator: {
                bg: "bg-slate-200",
                text: "text-slate-600",
                border: "border-slate-300",
            },
            head_nurse: {
                bg: "bg-purple-100",
                text: "text-purple-700",
                border: "border-purple-200",
            },
        };
    return (
        styles[roleName] || {
            bg: "bg-slate-100",
            text: "text-slate-600",
            border: "border-slate-200",
        }
    );
}

// Helper to get avatar color
function getAvatarStyle(roleName: string): {
    bg: string;
    text: string;
    border: string;
} {
    const styles: Record<string, { bg: string; text: string; border: string }> =
        {
            super_admin: {
                bg: "bg-indigo-100",
                text: "text-indigo-700",
                border: "border-indigo-200",
            },
            laundry_manager: {
                bg: "bg-blue-100",
                text: "text-blue-700",
                border: "border-blue-200",
            },
            laundry_operator: {
                bg: "bg-slate-200",
                text: "text-slate-500",
                border: "border-slate-300",
            },
            head_nurse: {
                bg: "bg-purple-100",
                text: "text-purple-700",
                border: "border-purple-200",
            },
        };
    return (
        styles[roleName] || {
            bg: "bg-slate-100",
            text: "text-slate-500",
            border: "border-slate-200",
        }
    );
}

// Helper to get role display name
function getRoleDisplayName(roleName: string): string {
    const names: Record<string, string> = {
        super_admin: "Super Admin",
        laundry_manager: "Laundry Manager",
        laundry_operator: "Laundry Operator",
        head_nurse: "Head Nurse",
    };
    return names[roleName] || roleName.replace("_", " ");
}

export default function UserIndex({ users, roles, rooms, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [roleFilter, setRoleFilter] = useState(filters?.role || "all");

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
        useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || "")) {
                applyFilters(searchQuery, roleFilter);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const applyFilters = useCallback((search: string, role: string) => {
        router.get(
            route("system.users.index"),
            {
                search: search || undefined,
                role: role !== "all" ? role : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    }, []);

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value);
        applyFilters(searchQuery, value);
    };

    const handleEditUser = (user: UserType) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteUser = (user: UserType) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleResetPassword = (user: UserType) => {
        setSelectedUser(user);
        setIsResetPasswordDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedUser) return;
        setIsProcessing(true);

        router.delete(route("system.users.destroy", selectedUser.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedUser(null);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const confirmResetPassword = () => {
        if (!selectedUser) return;
        setIsProcessing(true);

        router.post(
            route("system.users.reset-password", selectedUser.id),
            {},
            {
                onSuccess: () => {
                    setIsResetPasswordDialogOpen(false);
                    setSelectedUser(null);
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleRestoreUser = (user: UserType) => {
        router.post(route("system.users.restore", user.id));
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen User" />

            <div className="flex flex-col gap-8">
                {/* Page Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Manajemen User
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Kelola akses pengguna, roles, dan status akun.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 shadow-lg shadow-primary/30"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah User
                    </Button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            placeholder="Cari berdasarkan nama, email..."
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select
                            value={roleFilter}
                            onValueChange={handleRoleFilterChange}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Filter Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                        {getRoleDisplayName(role.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4 pl-6 w-[28%]">
                                        Nama & Email
                                    </th>
                                    <th className="p-4 w-[18%]">Role</th>
                                    <th className="p-4 w-[20%]">Ruangan</th>
                                    <th className="p-4 w-[14%]">Status</th>
                                    <th className="p-4 text-right pr-6">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            Tidak ada user ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => {
                                        const isInactive = !!user.deleted_at;
                                        const roleName =
                                            user.roles[0]?.name || "staff";
                                        const roleStyle =
                                            getRoleStyle(roleName);
                                        const avatarStyle =
                                            getAvatarStyle(roleName);

                                        return (
                                            <tr
                                                key={user.id}
                                                className={`group hover:bg-slate-50/80 transition-colors ${isInactive ? "bg-slate-50/30" : ""}`}
                                            >
                                                <td className="p-4 pl-6">
                                                    <div
                                                        className={`flex items-center gap-3 ${isInactive ? "opacity-60" : ""}`}
                                                    >
                                                        <div
                                                            className={`size-9 rounded-full ${avatarStyle.bg} ${avatarStyle.text} flex items-center justify-center text-xs font-bold border ${avatarStyle.border}`}
                                                        >
                                                            {getInitials(
                                                                user.name,
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-900">
                                                                {user.name}
                                                            </span>
                                                            <span className="text-slate-500 text-xs">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    className={`p-4 ${isInactive ? "opacity-60" : ""}`}
                                                >
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-md ${roleStyle.bg} ${roleStyle.text} text-[11px] font-bold tracking-wide ${roleStyle.border !== "border-transparent" ? `border ${roleStyle.border}` : "shadow-sm"}`}
                                                    >
                                                        {roleName
                                                            .replace(/_/g, " ")
                                                            .toUpperCase()}
                                                    </span>
                                                </td>
                                                <td
                                                    className={`p-4 ${isInactive ? "opacity-60" : ""} ${user.room ? "text-slate-700 text-sm" : "text-slate-400 font-medium"}`}
                                                >
                                                    {user.room?.name || "-"}
                                                </td>
                                                <td className="p-4">
                                                    {isInactive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-medium border border-slate-200">
                                                            <span className="size-1.5 rounded-full bg-slate-400"></span>
                                                            Inactive
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                                                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {isInactive ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleRestoreUser(
                                                                        user,
                                                                    )
                                                                }
                                                                title="Restore User"
                                                                className="h-8 w-8"
                                                            >
                                                                <RotateCcw className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleEditUser(
                                                                            user,
                                                                        )
                                                                    }
                                                                    title="Edit"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleResetPassword(
                                                                            user,
                                                                        )
                                                                    }
                                                                    title="Reset Password"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <KeyRound className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleDeleteUser(
                                                                            user,
                                                                        )
                                                                    }
                                                                    title="Delete"
                                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                        <span>
                            Showing {users.data.length} of {users.total} users
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        users.links.find((l) =>
                                            l.label.includes("Previous"),
                                        )?.url || null,
                                    )
                                }
                                disabled={users.current_page <= 1}
                                className="h-8"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        users.links.find((l) =>
                                            l.label.includes("Next"),
                                        )?.url || null,
                                    )
                                }
                                disabled={users.current_page >= users.last_page}
                                className="h-8"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UserFormModal
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                roles={roles}
                rooms={rooms}
                mode="create"
            />

            <UserFormModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                user={selectedUser}
                roles={roles}
                rooms={rooms}
                mode="edit"
            />

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Hapus User"
                description={`Apakah Anda yakin ingin menghapus user "${selectedUser?.name}"? User akan dinonaktifkan dan dapat dipulihkan nanti.`}
                confirmLabel="Hapus"
                cancelLabel="Batal"
                onConfirm={confirmDelete}
                loading={isProcessing}
                variant="destructive"
            />

            <ConfirmDialog
                open={isResetPasswordDialogOpen}
                onOpenChange={setIsResetPasswordDialogOpen}
                title="Reset Password"
                description={`Apakah Anda yakin ingin mereset password untuk "${selectedUser?.name}"? Password akan direset ke default (password123).`}
                confirmLabel="Reset Password"
                cancelLabel="Batal"
                onConfirm={confirmResetPassword}
                loading={isProcessing}
                variant="default"
            />
        </AuthenticatedLayout>
    );
}
