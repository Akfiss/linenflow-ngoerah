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
    Building2,
    Search,
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
}

interface Room {
    id: number;
    name: string;
}

interface RoomStock {
    id: number;
    room_id: number;
    linen_id: number;
    current_qty: number;
    par_stock: number;
    room: Room;
    linen: Linen;
}

interface PaginatedStocks {
    data: RoomStock[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    stocks: PaginatedStocks;
    rooms: Room[];
    lowStockCount: number;
    filters: {
        room: string | null;
        search: string | null;
        low_stock: string | null;
        sort: string;
        direction: string;
    };
}

export default function StokRuangan({
    stocks,
    rooms,
    lowStockCount,
    filters,
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || "");
    const [roomFilter, setRoomFilter] = useState(filters?.room || "all");
    const [showLowStock, setShowLowStock] = useState(
        filters?.low_stock === "true",
    );

    const applyFilters = (
        overrides: Record<string, string | undefined> = {},
    ) => {
        router.get(
            route("inventaris.ruangan"),
            {
                room:
                    overrides.room !== undefined
                        ? overrides.room !== "all"
                            ? overrides.room
                            : undefined
                        : roomFilter !== "all"
                          ? roomFilter
                          : undefined,
                search:
                    overrides.search !== undefined
                        ? overrides.search
                        : searchQuery || undefined,
                low_stock:
                    overrides.low_stock !== undefined
                        ? overrides.low_stock
                        : showLowStock
                          ? "true"
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            applyFilters();
        }
    };

    const toggleLowStock = () => {
        const newValue = !showLowStock;
        setShowLowStock(newValue);
        applyFilters({ low_stock: newValue ? "true" : undefined });
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const getStockStatus = (current: number, par: number) => {
        if (current >= par) {
            return {
                label: "Normal",
                color: "bg-emerald-100 text-emerald-700 border-emerald-200",
            };
        } else if (current >= par * 0.5) {
            return {
                label: "Rendah",
                color: "bg-amber-100 text-amber-700 border-amber-200",
            };
        } else {
            return {
                label: "Kritis",
                color: "bg-red-100 text-red-700 border-red-200",
            };
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Stok Ruangan" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            Stok Ruangan
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Monitoring stok linen per ruangan.
                        </p>
                    </div>
                    {lowStockCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                {lowStockCount} item di bawah par stock
                            </span>
                        </div>
                    )}
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
                            placeholder="Cari nama linen..."
                        />
                    </div>
                    <Select
                        value={roomFilter}
                        onValueChange={(v) => {
                            setRoomFilter(v);
                            applyFilters({ room: v });
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Filter Ruangan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Ruangan</SelectItem>
                            {rooms?.map((room) => (
                                <SelectItem
                                    key={room.id}
                                    value={String(room.id)}
                                >
                                    {room.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant={showLowStock ? "default" : "outline"}
                        onClick={toggleLowStock}
                        className="gap-2"
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Low Stock Only
                    </Button>
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
                                        onClick={() => handleSort("room_name")}
                                    >
                                        <div className="flex items-center">
                                            Ruangan
                                            <SortIcon field="room_name" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("linen_name")}
                                    >
                                        <div className="flex items-center">
                                            Linen
                                            <SortIcon field="linen_name" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 text-center cursor-pointer hover:bg-slate-100"
                                        onClick={() =>
                                            handleSort("current_qty")
                                        }
                                    >
                                        <div className="flex items-center justify-center">
                                            Stok Saat Ini
                                            <SortIcon field="current_qty" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 text-center cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("par_stock")}
                                    >
                                        <div className="flex items-center justify-center">
                                            Par Stock
                                            <SortIcon field="par_stock" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 text-center cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("difference")}
                                    >
                                        <div className="flex items-center justify-center">
                                            Selisih
                                            <SortIcon field="difference" />
                                        </div>
                                    </th>
                                    <th className="p-4 text-center pr-6">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {stocks?.data?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            Tidak ada data stok ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    stocks?.data?.map((stock) => {
                                        const difference =
                                            stock.current_qty - stock.par_stock;
                                        const status = getStockStatus(
                                            stock.current_qty,
                                            stock.par_stock,
                                        );
                                        return (
                                            <tr
                                                key={stock.id}
                                                className="hover:bg-slate-50/80 transition-colors"
                                            >
                                                <td className="p-4 pl-6 font-medium text-slate-900">
                                                    {stock.room?.name || "-"}
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {stock.linen?.name || "-"}
                                                </td>
                                                <td className="p-4 text-center font-bold text-slate-900">
                                                    {stock.current_qty}
                                                </td>
                                                <td className="p-4 text-center text-slate-600">
                                                    {stock.par_stock}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-medium ${difference >= 0 ? "text-emerald-600" : "text-red-600"}`}
                                                    >
                                                        {difference >= 0
                                                            ? `+${difference}`
                                                            : difference}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center pr-6">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${status.color}`}
                                                    >
                                                        {status.label}
                                                    </span>
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
