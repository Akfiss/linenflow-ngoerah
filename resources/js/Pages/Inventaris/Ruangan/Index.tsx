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
    DoorOpen,
    Search,
    AlertTriangle,
    CheckCircle,
    Package,
} from "lucide-react";

interface Linen {
    id: number;
    name: string;
    sku_code: string;
}

interface Room {
    id: number;
    name: string;
}

interface Stock {
    id: number;
    room_id: number;
    linen_id: number;
    current_qty: number;
    par_stock: number;
    room: Room;
    linen: Linen;
}

interface Props {
    stocks: Stock[];
    rooms: Room[];
    lowStockCount: number;
    filters: {
        room: string | null;
        search: string | null;
        low_stock: string | null;
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

    const applyFilters = () => {
        router.get(
            route("inventaris.ruangan"),
            {
                search: searchQuery || undefined,
                room: roomFilter !== "all" ? roomFilter : undefined,
                low_stock: showLowStock ? "true" : undefined,
            },
            { preserveState: true, preserveScroll: true },
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
        router.get(
            route("inventaris.ruangan"),
            {
                search: searchQuery || undefined,
                room: roomFilter !== "all" ? roomFilter : undefined,
                low_stock: newValue ? "true" : undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const getStockStatus = (current: number, par: number) => {
        const percentage = (current / par) * 100;
        if (percentage < 50)
            return {
                status: "critical",
                color: "text-red-600",
                bg: "bg-red-100",
            };
        if (percentage < 75)
            return {
                status: "low",
                color: "text-amber-600",
                bg: "bg-amber-100",
            };
        return {
            status: "normal",
            color: "text-emerald-600",
            bg: "bg-emerald-100",
        };
    };

    return (
        <AuthenticatedLayout>
            <Head title="Stok Ruangan" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <DoorOpen className="h-6 w-6 text-primary" />
                            Stok Ruangan
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Monitoring stok linen di setiap ruangan.
                        </p>
                    </div>
                    {lowStockCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <span className="text-amber-700 font-medium">
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
                            router.get(
                                route("inventaris.ruangan"),
                                {
                                    search: searchQuery || undefined,
                                    room: v !== "all" ? v : undefined,
                                    low_stock: showLowStock
                                        ? "true"
                                        : undefined,
                                },
                                { preserveState: true, preserveScroll: true },
                            );
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
                    <Button onClick={applyFilters}>Cari</Button>
                </div>

                {/* Stock Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4 pl-6">Ruangan</th>
                                    <th className="p-4">Linen</th>
                                    <th className="p-4 text-center">
                                        Stok Saat Ini
                                    </th>
                                    <th className="p-4 text-center">
                                        Par Stock
                                    </th>
                                    <th className="p-4 text-center">Selisih</th>
                                    <th className="p-4 text-center pr-6">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {stocks?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            Tidak ada data stok ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    stocks?.map((stock) => {
                                        const diff =
                                            stock.current_qty - stock.par_stock;
                                        const { status, color, bg } =
                                            getStockStatus(
                                                stock.current_qty,
                                                stock.par_stock,
                                            );

                                        return (
                                            <tr
                                                key={stock.id}
                                                className={`hover:bg-slate-50/80 transition-colors ${status === "critical" ? "bg-red-50/30" : ""}`}
                                            >
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-2">
                                                        <DoorOpen className="h-4 w-4 text-slate-400" />
                                                        <span className="font-medium text-slate-900">
                                                            {stock.room?.name ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {stock.linen?.name || "-"}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="font-bold text-slate-900 text-lg">
                                                        {stock.current_qty}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center text-slate-600">
                                                    {stock.par_stock}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span
                                                        className={`font-medium ${diff < 0 ? "text-red-600" : "text-emerald-600"}`}
                                                    >
                                                        {diff > 0 ? "+" : ""}
                                                        {diff}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center pr-6">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${color}`}
                                                    >
                                                        {status === "normal" ? (
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <AlertTriangle className="h-3.5 w-3.5" />
                                                        )}
                                                        {status === "critical"
                                                            ? "Kritis"
                                                            : status === "low"
                                                              ? "Rendah"
                                                              : "Normal"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
