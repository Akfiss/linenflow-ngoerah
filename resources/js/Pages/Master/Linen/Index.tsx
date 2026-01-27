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
import { Badge } from "@/Components/ui/badge";
import { ConfirmDialog } from "@/Components/ConfirmDialog";
import {
    Plus,
    Search,
    Filter,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Package,
    ArrowUpDown,
    Scale,
    RefreshCw,
} from "lucide-react";

// Types
interface LinenCategory {
    id: number;
    name: string;
    slug: string;
}

interface CentralStock {
    id: number;
    linen_id: number;
    clean_qty: number;
    dirty_qty: number;
    washing_qty: number;
}

interface Linen {
    id: number;
    name: string;
    sku_code: string;
    weight_gram: number;
    lifespan_cycles_estimate: number;
    linen_category_id: number;
    category?: LinenCategory;
    central_stock?: CentralStock;
    created_at: string;
}

interface PaginatedLinens {
    data: Linen[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    linens: PaginatedLinens;
    categories: LinenCategory[];
    filters?: {
        search?: string;
        category?: string;
        sort?: string;
        direction?: string;
    };
}

export default function LinenIndex({ linens, categories, filters }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters?.category || "all",
    );
    const [sortField, setSortField] = useState(filters?.sort || "name");
    const [sortDirection, setSortDirection] = useState(
        filters?.direction || "asc",
    );

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedLinen, setSelectedLinen] = useState<Linen | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        sku_code: "",
        linen_category_id: "",
        weight_gram: 0,
        lifespan_cycles_estimate: 100,
        initial_stock: 0,
    });

    // Calculate summary stats
    const totalVariants = linens.total;
    const totalStock = linens.data.reduce((acc, linen) => {
        const stock = linen.central_stock;
        return (
            acc +
            (stock ? stock.clean_qty + stock.dirty_qty + stock.washing_qty : 0)
        );
    }, 0);
    const lowStockItems = linens.data.filter((linen) => {
        const stock = linen.central_stock;
        return stock && stock.clean_qty < 10;
    }).length;

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || "")) {
                applyFilters(searchQuery, categoryFilter);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const applyFilters = useCallback(
        (
            search: string,
            category: string,
            sort?: string,
            direction?: string,
        ) => {
            router.get(
                route("master.linen.index"),
                {
                    search: search || undefined,
                    category: category !== "all" ? category : undefined,
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

    const handleCategoryFilterChange = (value: string) => {
        setCategoryFilter(value);
        applyFilters(searchQuery, value);
    };

    const handleSort = (field: string) => {
        const newDirection =
            sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
        applyFilters(searchQuery, categoryFilter, field, newDirection);
    };

    const handleCreateLinen = () => {
        setFormData({
            name: "",
            sku_code: "",
            linen_category_id:
                categories.length > 0 ? String(categories[0].id) : "",
            weight_gram: 0,
            lifespan_cycles_estimate: 100,
            initial_stock: 0,
        });
        setIsCreateModalOpen(true);
    };

    const handleEditLinen = (linen: Linen) => {
        setSelectedLinen(linen);
        setFormData({
            name: linen.name,
            sku_code: linen.sku_code,
            linen_category_id: String(linen.linen_category_id),
            weight_gram: linen.weight_gram,
            lifespan_cycles_estimate: linen.lifespan_cycles_estimate,
            initial_stock: 0,
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteLinen = (linen: Linen) => {
        setSelectedLinen(linen);
        setIsDeleteDialogOpen(true);
    };

    const submitCreate = () => {
        setIsProcessing(true);
        router.post(
            route("master.linen.store"),
            {
                ...formData,
                linen_category_id: Number(formData.linen_category_id),
            },
            {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    resetForm();
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const submitEdit = () => {
        if (!selectedLinen) return;
        setIsProcessing(true);
        router.put(
            route("master.linen.update", selectedLinen.id),
            {
                ...formData,
                linen_category_id: Number(formData.linen_category_id),
            },
            {
                onSuccess: () => {
                    setIsEditModalOpen(false);
                    setSelectedLinen(null);
                    resetForm();
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const confirmDelete = () => {
        if (!selectedLinen) return;
        setIsProcessing(true);

        router.delete(route("master.linen.destroy", selectedLinen.id), {
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setSelectedLinen(null);
            },
            onFinish: () => setIsProcessing(false),
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            sku_code: "",
            linen_category_id: "",
            weight_gram: 0,
            lifespan_cycles_estimate: 100,
            initial_stock: 0,
        });
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const getTotalStock = (linen: Linen): number => {
        const stock = linen.central_stock;
        if (!stock) return 0;
        return stock.clean_qty + stock.dirty_qty + stock.washing_qty;
    };

    const canDelete = (linen: Linen): boolean => {
        return getTotalStock(linen) === 0;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Katalog Linen" />

            <div className="flex flex-col gap-8">
                {/* Page Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            Katalog Linen
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Kelola master data jenis linen rumah sakit.
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateLinen}
                        className="flex items-center gap-2 shadow-lg shadow-primary/30"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Linen
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <span className="text-sm text-slate-500">
                            Total Varian Item
                        </span>
                        <span className="text-2xl font-bold">
                            {totalVariants} Jenis
                        </span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <span className="text-sm text-slate-500">
                            Total Stok (Halaman Ini)
                        </span>
                        <span className="text-2xl font-bold">
                            {totalStock.toLocaleString()} pcs
                        </span>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                        <span className="text-sm text-slate-500">
                            Item Stok Rendah
                        </span>
                        <span
                            className={`text-2xl font-bold ${lowStockItems > 0 ? "text-red-600" : "text-emerald-600"}`}
                        >
                            {lowStockItems} Item
                        </span>
                    </div>
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
                            placeholder="Cari nama atau SKU..."
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Select
                            value={categoryFilter}
                            onValueChange={handleCategoryFilterChange}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <Filter className="h-4 w-4 mr-2 text-slate-500" />
                                <SelectValue placeholder="Filter Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Kategori
                                </SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem
                                        key={cat.id}
                                        value={String(cat.id)}
                                    >
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Linen Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4 pl-6 w-[12%]">
                                        <button
                                            onClick={() =>
                                                handleSort("sku_code")
                                            }
                                            className="flex items-center gap-1 hover:text-slate-900"
                                        >
                                            SKU
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-4 w-[25%]">
                                        <button
                                            onClick={() => handleSort("name")}
                                            className="flex items-center gap-1 hover:text-slate-900"
                                        >
                                            Nama Item
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-4 w-[15%]">Kategori</th>
                                    <th className="p-4 w-[12%]">
                                        <button
                                            onClick={() =>
                                                handleSort("weight_gram")
                                            }
                                            className="flex items-center gap-1 hover:text-slate-900"
                                        >
                                            Berat
                                            <ArrowUpDown className="h-3 w-3" />
                                        </button>
                                    </th>
                                    <th className="p-4 w-[10%]">Stok</th>
                                    <th className="p-4 w-[10%]">Lifecycle</th>
                                    <th className="p-4 text-right pr-6">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {linens.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Package className="h-12 w-12 text-slate-300" />
                                                <span>
                                                    Tidak ada linen ditemukan.
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    linens.data.map((linen) => {
                                        const totalStock = getTotalStock(linen);
                                        const isLowStock =
                                            linen.central_stock &&
                                            linen.central_stock.clean_qty < 10;

                                        return (
                                            <tr
                                                key={linen.id}
                                                className="group hover:bg-slate-50/80 transition-colors"
                                            >
                                                <td className="p-4 pl-6">
                                                    <span className="font-mono text-xs font-bold text-slate-500">
                                                        {linen.sku_code}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                            <Package className="h-4 w-4" />
                                                        </div>
                                                        <span className="font-semibold text-slate-900">
                                                            {linen.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge variant="secondary">
                                                        {linen.category?.name ||
                                                            "-"}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-slate-600">
                                                        <Scale className="h-4 w-4 text-slate-400" />
                                                        <span>
                                                            {linen.weight_gram}g
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`font-bold ${isLowStock ? "text-red-600" : "text-emerald-600"}`}
                                                    >
                                                        {totalStock}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <RefreshCw className="h-4 w-4 text-slate-400" />
                                                        <span>
                                                            {
                                                                linen.lifespan_cycles_estimate
                                                            }
                                                            x
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleEditLinen(
                                                                    linen,
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
                                                                handleDeleteLinen(
                                                                    linen,
                                                                )
                                                            }
                                                            title="Delete"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            disabled={
                                                                !canDelete(
                                                                    linen,
                                                                )
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
                            Showing {linens.data.length} of {linens.total} items
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        linens.links.find((l) =>
                                            l.label.includes("Previous"),
                                        )?.url || null,
                                    )
                                }
                                disabled={linens.current_page <= 1}
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
                                        linens.links.find((l) =>
                                            l.label.includes("Next"),
                                        )?.url || null,
                                    )
                                }
                                disabled={
                                    linens.current_page >= linens.last_page
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Linen</DialogTitle>
                        <DialogDescription>
                            Tambah item linen baru ke katalog.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nama Linen</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Contoh: Sprei Pasien Dewasa Putih"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sku_code">SKU Code</Label>
                            <Input
                                id="sku_code"
                                value={formData.sku_code}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sku_code: e.target.value,
                                    })
                                }
                                placeholder="Contoh: LIN-SPR-001"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Kategori</Label>
                            <Select
                                value={formData.linen_category_id}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        linen_category_id: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={String(cat.id)}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="weight_gram">
                                    Berat (gram)
                                </Label>
                                <Input
                                    id="weight_gram"
                                    type="number"
                                    value={formData.weight_gram}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            weight_gram: Number(e.target.value),
                                        })
                                    }
                                    placeholder="500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lifespan">
                                    Lifecycle (cuci)
                                </Label>
                                <Input
                                    id="lifespan"
                                    type="number"
                                    value={formData.lifespan_cycles_estimate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lifespan_cycles_estimate: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    placeholder="100"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="initial_stock">
                                Stok Awal (opsional)
                            </Label>
                            <Input
                                id="initial_stock"
                                type="number"
                                value={formData.initial_stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        initial_stock: Number(e.target.value),
                                    })
                                }
                                placeholder="0"
                            />
                            <p className="text-xs text-slate-500">
                                Jumlah stok bersih awal di gudang laundry.
                            </p>
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
                            disabled={
                                isProcessing ||
                                !formData.name ||
                                !formData.sku_code ||
                                !formData.linen_category_id
                            }
                        >
                            {isProcessing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Linen</DialogTitle>
                        <DialogDescription>Ubah data linen.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nama Linen</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Contoh: Sprei Pasien Dewasa Putih"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-sku_code">SKU Code</Label>
                            <Input
                                id="edit-sku_code"
                                value={formData.sku_code}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sku_code: e.target.value,
                                    })
                                }
                                placeholder="Contoh: LIN-SPR-001"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-category">Kategori</Label>
                            <Select
                                value={formData.linen_category_id}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        linen_category_id: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={String(cat.id)}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-weight_gram">
                                    Berat (gram)
                                </Label>
                                <Input
                                    id="edit-weight_gram"
                                    type="number"
                                    value={formData.weight_gram}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            weight_gram: Number(e.target.value),
                                        })
                                    }
                                    placeholder="500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-lifespan">
                                    Lifecycle (cuci)
                                </Label>
                                <Input
                                    id="edit-lifespan"
                                    type="number"
                                    value={formData.lifespan_cycles_estimate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            lifespan_cycles_estimate: Number(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                    placeholder="100"
                                />
                            </div>
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
                            disabled={
                                isProcessing ||
                                !formData.name ||
                                !formData.sku_code ||
                                !formData.linen_category_id
                            }
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
                title="Hapus Linen"
                description={`Apakah Anda yakin ingin menghapus linen "${selectedLinen?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Hapus"
                cancelLabel="Batal"
                onConfirm={confirmDelete}
                loading={isProcessing}
                variant="destructive"
            />
        </AuthenticatedLayout>
    );
}
