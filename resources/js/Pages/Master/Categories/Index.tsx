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
import { Label } from "@/Components/ui/label";
import { ConfirmDialog } from "@/Components/ConfirmDialog";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    ArrowUpDown,
    Package,
} from "lucide-react";

// Types
interface LinenCategory {
    id: number;
    name: string;
    slug: string;
    linens_count: number;
    created_at: string;
}

interface PaginatedCategories {
    data: LinenCategory[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    categories: PaginatedCategories;
    filters?: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export default function CategoriesIndex({ categories, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [sortField, setSortField] = useState(filters?.sort || "name");
    const [sortDirection, setSortDirection] = useState(
        filters?.direction || "asc",
    );

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] =
        useState<LinenCategory | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ name: "" });

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || "")) {
                applyFilters(searchQuery);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const applyFilters = useCallback(
        (search: string, sort?: string, direction?: string) => {
            router.get(
                route("master.categories.index"),
                {
                    search: search || undefined,
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

    const handleSort = (field: string) => {
        const newDirection =
            sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
        applyFilters(searchQuery, field, newDirection);
    };

    const handleCreateCategory = () => {
        setFormData({ name: "" });
        setIsCreateModalOpen(true);
    };

    const handleEditCategory = (category: LinenCategory) => {
        setSelectedCategory(category);
        setFormData({ name: category.name });
        setIsEditModalOpen(true);
    };

    const handleDeleteCategory = (category: LinenCategory) => {
        setSelectedCategory(category);
        setIsDeleteDialogOpen(true);
    };

    const submitCreate = () => {
        setIsProcessing(true);
        router.post(route("master.categories.store"), formData, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setFormData({ name: "" });
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const submitEdit = () => {
        if (!selectedCategory) return;
        setIsProcessing(true);
        router.put(
            route("master.categories.update", selectedCategory.id),
            formData,
            {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(null);
                    setFormData({ name: "" });
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const confirmDelete = () => {
        if (!selectedCategory) return;
        setIsProcessing(true);

        router.delete(route("master.categories.destroy", selectedCategory.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedCategory(null);
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
            <Head title="Kategori Linen" />

            <div className="flex flex-col gap-8">
                {/* Page Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Kategori Linen
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Kelola kategori untuk pengelompokan jenis linen.
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateCategory}
                        className="flex items-center gap-2 shadow-lg shadow-primary/30"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Kategori
                    </Button>
                </div>

                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            placeholder="Cari kategori..."
                        />
                    </div>
                </div>

                {/* Categories Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4 pl-6 w-[40%]">
                                        <button
                                            onClick={() => handleSort("name")}
                                            className="flex items-center gap-1 hover:text-slate-900"
                                        >
                                            Nama Kategori
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-4 w-[25%]">Slug</th>
                                    <th className="p-4 w-[15%]">
                                        Jumlah Linen
                                    </th>
                                    <th className="p-4 text-right pr-6">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {categories.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <FolderOpen className="h-12 w-12 text-slate-300" />
                                                <span>
                                                    Tidak ada kategori
                                                    ditemukan.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    categories.data.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="group hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="p-4 pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-semibold text-slate-900">
                                                        {category.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-500 font-mono text-xs">
                                                {category.slug}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                                                    {category.linens_count} item
                                                </span>
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleEditCategory(
                                                                category,
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
                                                            handleDeleteCategory(
                                                                category,
                                                            )
                                                        }
                                                        title="Delete"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        disabled={
                                                            category.linens_count >
                                                            0
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
                        <span>
                            Showing {categories.data.length} of{" "}
                            {categories.total} categories
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        categories.links.find((l) =>
                                            l.label.includes("Previous"),
                                        )?.url || null,
                                    )
                                }
                                disabled={categories.current_page <= 1}
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
                                        categories.links.find((l) =>
                                            l.label.includes("Next"),
                                        )?.url || null,
                                    )
                                }
                                disabled={
                                    categories.current_page >=
                                    categories.last_page
                                }
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
                        <DialogTitle>Tambah Kategori</DialogTitle>
                        <DialogDescription>
                            Buat kategori baru untuk mengelompokkan jenis linen.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Kategori</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ name: e.target.value })
                                }
                                placeholder="Contoh: Bedding, Apparel..."
                            />
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
                        <DialogTitle>Edit Kategori</DialogTitle>
                        <DialogDescription>
                            Ubah nama kategori.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama Kategori</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ name: e.target.value })
                                }
                                placeholder="Contoh: Bedding, Apparel..."
                            />
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
                title="Hapus Kategori"
                description={`Apakah Anda yakin ingin menghapus kategori "${selectedCategory?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Hapus"
                cancelLabel="Batal"
                onConfirm={confirmDelete}
                loading={isProcessing}
                variant="destructive"
            />
        </AuthenticatedLayout>
    );
}
