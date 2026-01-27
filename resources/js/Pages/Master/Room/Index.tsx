import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Label } from "@/Components/ui/label";
import { ConfirmDialog } from "@/Components/ConfirmDialog";
import {
    Plus,
    Search,
    Filter,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Building2,
    ArrowUpDown,
    Users,
    Package,
} from "lucide-react";

// Types
interface Room {
    id: number;
    name: string;
    type: string;
    room_stocks_count: number;
    users_count: number;
    created_at: string;
}

interface PaginatedRooms {
    data: Room[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    rooms: PaginatedRooms;
    roomTypes: Record<string, string>;
    filters?: {
        search?: string;
        type?: string;
        sort?: string;
        direction?: string;
    };
}

// Helper to get room type style
function getRoomTypeStyle(type: string): {
    bg: string;
    text: string;
    border: string;
} {
    const styles: Record<string, { bg: string; text: string; border: string }> =
        {
            WARD: {
                bg: "bg-blue-100",
                text: "text-blue-700",
                border: "border-blue-200",
            },
            ICU: {
                bg: "bg-red-100",
                text: "text-red-700",
                border: "border-red-200",
            },
            OT: {
                bg: "bg-amber-100",
                text: "text-amber-700",
                border: "border-amber-200",
            },
            OFFICE: {
                bg: "bg-slate-100",
                text: "text-slate-700",
                border: "border-slate-200",
            },
        };
    return (
        styles[type] || {
            bg: "bg-slate-100",
            text: "text-slate-600",
            border: "border-slate-200",
        }
    );
}

export default function RoomIndex({ rooms, roomTypes, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [typeFilter, setTypeFilter] = useState(filters?.type || "all");
    const [sortField, setSortField] = useState(filters?.sort || "name");
    const [sortDirection, setSortDirection] = useState(
        filters?.direction || "asc",
    );

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ name: "", type: "WARD" });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || "")) {
                applyFilters(searchQuery, typeFilter);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const applyFilters = useCallback(
        (search: string, type: string, sort?: string, direction?: string) => {
            router.get(
                route("master.room.index"),
                {
                    search: search || undefined,
                    type: type !== "all" ? type : undefined,
                    sort: sort || sortField,
                    direction: direction || sortDirection,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        },
        [sortField, sortDirection],
    );

    const handleTypeFilterChange = (value: string) => {
        setTypeFilter(value);
        applyFilters(searchQuery, value);
    };

    const handleSort = (field: string) => {
        const newDirection =
            sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
        applyFilters(searchQuery, typeFilter, field, newDirection);
    };

    const handleCreateRoom = () => {
        setFormData({ name: "", type: "WARD" });
        setIsCreateModalOpen(true);
    };

    const handleEditRoom = (room: Room) => {
        setSelectedRoom(room);
        setFormData({ name: room.name, type: room.type });
        setIsEditModalOpen(true);
    };

    const handleDeleteRoom = (room: Room) => {
        setSelectedRoom(room);
        setIsDeleteDialogOpen(true);
    };

    const submitCreate = () => {
        setIsProcessing(true);
        router.post(route("master.room.store"), formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ name: "", type: "WARD" });
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const submitEdit = () => {
        if (!selectedRoom) return;
        setIsProcessing(true);
        router.put(route("master.room.update", selectedRoom.id), formData, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedRoom(null);
                setFormData({ name: "", type: "WARD" });
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const confirmDelete = () => {
        if (!selectedRoom) return;
        setIsProcessing(true);

        router.delete(route("master.room.destroy", selectedRoom.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedRoom(null);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Data Ruangan" />

            <div className="flex flex-col gap-8">
                {/* Page Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Data Ruangan
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Kelola data ruangan rumah sakit dan par stock.
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateRoom}
                        className="flex items-center gap-2 shadow-lg shadow-primary/30"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Ruangan
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
                            placeholder="Cari ruangan..."
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select
                            value={typeFilter}
                            onValueChange={handleTypeFilterChange}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Filter Tipe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tipe</SelectItem>
                                {Object.entries(roomTypes).map(
                                    ([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Room Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4 pl-6 w-[35%]">
                                        <button
                                            onClick={() => handleSort("name")}
                                            className="flex items-center gap-1 hover:text-slate-900"
                                        >
                                            Nama Ruangan
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-4 w-[20%]">
                                        <button
                                            onClick={() => handleSort("type")}
                                            className="flex items-center gap-1 hover:text-slate-900"
                                        >
                                            Tipe
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-4 w-[15%]">
                                        User Terkait
                                    </th>
                                    <th className="p-4 w-[15%]">Jenis Linen</th>
                                    <th className="p-4 text-right pr-6">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {rooms.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Building2 className="h-12 w-12 text-slate-300" />
                                                <span>
                                                    Tidak ada ruangan ditemukan.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    rooms.data.map((room) => {
                                        const typeStyle = getRoomTypeStyle(
                                            room.type,
                                        );
                                        const canDelete =
                                            room.room_stocks_count === 0 &&
                                            room.users_count === 0;

                                        return (
                                            <tr
                                                key={room.id}
                                                className="group hover:bg-slate-50/80 transition-colors"
                                            >
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                            <Building2 className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-semibold text-slate-900">
                                                            {room.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-md ${typeStyle.bg} ${typeStyle.text} text-[11px] font-bold tracking-wide border ${typeStyle.border}`}
                                                    >
                                                        {room.type}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Users className="h-4 w-4 text-slate-400" />
                                                        <span>
                                                            {room.users_count}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Package className="h-4 w-4 text-slate-400" />
                                                        <span>
                                                            {
                                                                room.room_stocks_count
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleEditRoom(
                                                                    room,
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
                                                                handleDeleteRoom(
                                                                    room,
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            disabled={
                                                                !canDelete
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
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
                            Showing {rooms.data.length} of {rooms.total} rooms
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        rooms.links.find((l) =>
                                            l.label.includes("Previous"),
                                        )?.url || null,
                                    )
                                }
                                disabled={rooms.current_page <= 1}
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
                                        rooms.links.find((l) =>
                                            l.label.includes("Next"),
                                        )?.url || null,
                                    )
                                }
                                disabled={rooms.current_page >= rooms.last_page}
                                className="h-8"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Dialog
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Ruangan</DialogTitle>
                        <DialogDescription>
                            Tambah data ruangan baru ke sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Ruangan</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Contoh: Ruang Mawar 1, ICU Central..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Tipe Ruangan</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roomTypes).map(
                                        ([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={submitCreate}
                            disabled={isProcessing || !formData.name}
                        >
                            {isProcessing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Ruangan</DialogTitle>
                        <DialogDescription>
                            Ubah data ruangan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama Ruangan</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Contoh: Ruang Mawar 1, ICU Central..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">Tipe Ruangan</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, type: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roomTypes).map(
                                        ([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={submitEdit}
                            disabled={isProcessing || !formData.name}
                        >
                            {isProcessing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title="Hapus Ruangan"
                description={`Apakah Anda yakin ingin menghapus ruangan "${selectedRoom?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Hapus"
                cancelLabel="Batal"
                onConfirm={confirmDelete}
                loading={isProcessing}
                variant="destructive"
            />
        </AuthenticatedLayout>
    );
}
