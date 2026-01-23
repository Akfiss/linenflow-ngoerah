import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
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
    Warehouse,
    Search,
    Download,
    Package,
    Sparkles,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

interface Linen {
    id: number;
    name: string;
    sku_code: string;
    category?: {
        id: number;
        name: string;
    };
}

interface Stock {
    id: number;
    linen_id: number;
    clean_qty: number;
    dirty_qty: number;
    washing_qty: number;
    linen: Linen;
}

interface Category {
    id: number;
    name: string;
}

interface PaginatedStocks {
    data: Stock[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    stocks: PaginatedStocks;
    totals: {
        clean: number;
        dirty: number;
        washing: number;
        total: number;
    };
    categories: Category[];
    filters: {
        search: string | null;
        category: string | null;
        sort: string;
        direction: string;
    };
}

export default function StokGudang({
    stocks,
    totals,
    categories,
    filters,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [categoryFilter, setCategoryFilter] = useState(
        filters?.category || "all",
    );

    const applyFilters = (
        overrides: Record<string, string | undefined> = {},
    ) => {
        router.get(
            route("inventaris.gudang"),
            {
                search:
                    overrides.search !== undefined
                        ? overrides.search
                        : searchQuery || undefined,
                category:
                    overrides.category !== undefined
                        ? overrides.category !== "all"
                            ? overrides.category
                            : undefined
                        : categoryFilter !== "all"
                          ? categoryFilter
                          : undefined,
                sort: overrides.sort ?? filters?.sort,
                direction: overrides.direction ?? filters?.direction,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSort = (field: string) => {
        const newDirection =
            filters?.sort === field && filters?.direction === "asc"
                ? "desc"
                : "asc";
        applyFilters({ sort: field, direction: newDirection });
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (filters?.sort !== field) {
            return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
        }
        return filters?.direction === "asc" ? (
            <ArrowUp className="h-3 w-3 ml-1" />
        ) : (
            <ArrowDown className="h-3 w-3 ml-1" />
        );
    };

    const handleExport = () => {
        window.location.href = route("inventaris.gudang.export");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            applyFilters();
        }
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Stok Gudang" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Warehouse className="h-6 w-6 text-primary" />
                            Stok Gudang
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Monitoring stok linen di gudang pusat.
                        </p>
                    </div>
                    <Button
                        onClick={handleExport}
                        variant="outline"
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Sparkles className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Stok Bersih
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {totals?.clean ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Stok Kotor
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {totals?.dirty ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Loader2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Sedang Cuci
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {totals?.washing ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Package className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Semua
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {totals?.total ?? 0}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pl-10"
                            placeholder="Cari nama linen atau SKU..."
                        />
                    </div>
                    <Select
                        value={categoryFilter}
                        onValueChange={(v) => {
                            setCategoryFilter(v);
                            applyFilters({ category: v });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => applyFilters()}>Cari</Button>
                </div>

                {/* Stock Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th
                                        className="p-4 pl-6 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("sku_code")}
                                    >
                                        <div className="flex items-center">
                                            SKU
                                            <SortIcon field="sku_code" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("linen_name")}
                                    >
                                        <div className="flex items-center">
                                            Nama Linen
                                            <SortIcon field="linen_name" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 cursor-pointer hover:bg-slate-100"
                                        onClick={() =>
                                            handleSort("category_name")
                                        }
                                    >
                                        <div className="flex items-center">
                                            Kategori
                                            <SortIcon field="category_name" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 text-center cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("clean_qty")}
                                    >
                                        <div className="flex items-center justify-center">
                                            Bersih
                                            <SortIcon field="clean_qty" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 text-center cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("dirty_qty")}
                                    >
                                        <div className="flex items-center justify-center">
                                            Kotor
                                            <SortIcon field="dirty_qty" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 text-center cursor-pointer hover:bg-slate-100"
                                        onClick={() =>
                                            handleSort("washing_qty")
                                        }
                                    >
                                        <div className="flex items-center justify-center">
                                            Cuci
                                            <SortIcon field="washing_qty" />
                                        </div>
                                    </th>
                                    <th className="p-4 text-center pr-6">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {stocks?.data?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            Tidak ada data stok ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    stocks?.data?.map((stock) => {
                                        const total =
                                            stock.clean_qty +
                                            stock.dirty_qty +
                                            stock.washing_qty;
                                        return (
                                            <tr
                                                key={stock.id}
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                <td className="p-4 pl-6 font-mono text-slate-600">
                                                    {stock.linen?.sku_code ||
                                                        "-"}
                                                </td>
                                                <td className="p-4 font-medium text-slate-900">
                                                    {stock.linen?.name || "-"}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {stock.linen?.category
                                                        ?.name || "-"}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                                                        {stock.clean_qty}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                                                        {stock.dirty_qty}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                                        {stock.washing_qty}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center pr-6 font-bold text-slate-900">
                                                    {total}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t flex items-center justify-between text-xs text-slate-500">
                        <span>
                            Showing {stocks?.data?.length || 0} of{" "}
                            {stocks?.total || 0} items
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        stocks?.links?.find((l) =>
                                            l.label.includes("Previous"),
                                        )?.url || null,
                                    )
                                }
                                disabled={stocks?.current_page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <span className="flex items-center px-2">
                                Page {stocks?.current_page} of{" "}
                                {stocks?.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        stocks?.links?.find((l) =>
                                            l.label.includes("Next"),
                                        )?.url || null,
                                    )
                                }
                                disabled={
                                    stocks?.current_page >= stocks?.last_page
                                }
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
