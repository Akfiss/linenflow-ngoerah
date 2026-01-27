import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Bed,
    CheckCircle,
    Info,
    AlertTriangle,
    Truck,
    Download,
    Upload,
    FileText,
    Filter,
    Phone,
    Headset,
    CalendarDays,
    Layers,
    Package,
    Clock,
    ArrowRight,
} from "lucide-react";
import { usePage, Link, router } from "@inertiajs/react";

interface RoomStock {
    id: number;
    linen_id: number;
    current_qty: number;
    par_stock: number;
    linen: {
        id: number;
        name: string;
        sku_code: string;
        category?: { name: string };
    };
}

interface Transaction {
    id: number;
    trx_code: string;
    type: string;
    status: string;
    created_at: string;
    user?: { name: string };
    details?: { qty: number }[];
}

interface Room {
    id: number;
    name: string;
}

export default function HeadNurseDashboard() {
    const { auth, ownRoomStock, ownRoomPending, ownRoomTransactions } =
        usePage().props as any;

    const roomName = auth?.user?.room?.name || "Ruangan Anda";

    // Calculate room statistics from ownRoomStock
    const stockArray = ownRoomStock || [];
    const roomStats = {
        totalStock: stockArray.reduce(
            (sum: number, s: any) => sum + (s.current_qty || 0),
            0,
        ),
        totalPar: stockArray.reduce(
            (sum: number, s: any) => sum + (s.par_stock || 0),
            0,
        ),
        lowStockItems: stockArray.filter(
            (s: any) => s.current_qty < s.par_stock,
        ).length,
        normalItems: stockArray.filter((s: any) => s.current_qty >= s.par_stock)
            .length,
    };

    // Get room transactions from props
    const roomTransactions = ownRoomTransactions || [];

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 24) {
            return date.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (hours < 48) {
            return "Kemarin";
        } else {
            return date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
            });
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "OUT_DISTRIBUTION":
                return <Download className="w-[18px] h-[18px]" />;
            case "IN_COLLECTION":
                return <Upload className="w-[18px] h-[18px]" />;
            default:
                return <FileText className="w-[18px] h-[18px]" />;
        }
    };

    const getTransactionLabel = (type: string) => {
        switch (type) {
            case "OUT_DISTRIBUTION":
                return "Penerimaan Linen Bersih";
            case "IN_COLLECTION":
                return "Pengembalian Linen Kotor";
            default:
                return type;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case "OUT_DISTRIBUTION":
                return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
            case "IN_COLLECTION":
                return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
            default:
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-display text-slate-900 dark:text-gray-100">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Dashboard {roomName}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl text-base">
                        Ringkasan stok linen, pengiriman tertunda, dan aktivitas
                        ruangan terkini.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        System Online
                    </span>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        <span>
                            {new Date().toLocaleDateString("id-ID", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </span>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#2c3136] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total Stok
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {roomStats.totalStock}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#2c3136] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Stok Normal
                            </p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {roomStats.normalItems}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#2c3136] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Stok Kurang
                            </p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {roomStats.lowStockItems}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#2c3136] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Pending
                            </p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {ownRoomPending || 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Stock Table & Info */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    {/* Stock Table Card */}
                    <div className="bg-white dark:bg-[#2c3136] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Layers className="text-[#298fa3] w-6 h-6" />
                                Stok Ruangan {roomName} Saat Ini
                            </h3>
                            <Link
                                href={route("nurse.riwayat")}
                                className="text-sm font-semibold text-[#298fa3] hover:text-[#206f80] transition-colors"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 dark:bg-gray-800/30 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
                                        <th className="px-6 py-4 rounded-tl-lg">
                                            Item Name
                                        </th>
                                        <th className="px-6 py-4">
                                            Stok Fisik
                                        </th>
                                        <th className="px-6 py-4">Par Level</th>
                                        <th className="px-6 py-4">Kebutuhan</th>
                                        <th className="px-6 py-4 rounded-tr-lg text-right">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                    {ownRoomStock && ownRoomStock.length > 0 ? (
                                        ownRoomStock.map((stock: any) => {
                                            const need =
                                                stock.par_stock -
                                                stock.current_qty;
                                            const isLow =
                                                stock.current_qty <
                                                stock.par_stock;
                                            return (
                                                <tr
                                                    key={stock.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                                >
                                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                        <div
                                                            className={`h-10 w-10 rounded flex items-center justify-center ${
                                                                isLow
                                                                    ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                                                    : "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                                                            }`}
                                                        >
                                                            <Layers className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold">
                                                                {
                                                                    stock.linen
                                                                        ?.name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {
                                                                    stock.linen
                                                                        ?.sku_code
                                                                }
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-base font-semibold">
                                                        {stock.current_qty}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-base">
                                                        {stock.par_stock}
                                                    </td>
                                                    <td
                                                        className={`px-6 py-4 font-mono text-base font-bold ${
                                                            need > 0
                                                                ? "text-red-500"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {need > 0
                                                            ? `+${need}`
                                                            : "-"}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {isLow ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                                                Low Stock
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                                Normal
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                                Belum ada data stok untuk
                                                ruangan ini
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Chart/Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#298fa3]/5 dark:bg-[#298fa3]/10 rounded-xl p-6 border border-[#298fa3]/10 flex items-start gap-4">
                            <div className="bg-[#298fa3]/20 p-3 rounded-lg text-[#298fa3]">
                                <Info className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                    Ringkasan Stok
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total {roomStats.totalStock} dari{" "}
                                    {roomStats.totalPar} par level.
                                    {roomStats.lowStockItems > 0 && (
                                        <span className="text-orange-600 dark:text-orange-400">
                                            {" "}
                                            {roomStats.lowStockItems} item
                                            membutuhkan restock.
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        {roomStats.lowStockItems > 0 && (
                            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-6 border border-orange-100 dark:border-orange-900/30 flex items-start gap-4">
                                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg text-orange-600 dark:text-orange-400">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                        Perhatian
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Terdapat {roomStats.lowStockItems} item
                                        dengan stok di bawah par level. Segera
                                        konfirmasi pengiriman jika ada.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions & History */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Pending Action Card */}
                    {(ownRoomPending || 0) > 0 ? (
                        <div className="bg-white dark:bg-[#2c3136] rounded-xl shadow-sm overflow-hidden border border-[#298fa3]/20 dark:border-[#298fa3]/40 relative group">
                            {/* Decorative Top Bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-[#298fa3] to-cyan-400"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-[#298fa3] font-bold text-sm uppercase tracking-wider">
                                        <span className="animate-pulse relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#298fa3] opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#298fa3]"></span>
                                        </span>
                                        Menunggu Konfirmasi
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                                        Pengiriman Linen Bersih
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        {ownRoomPending} pengiriman menunggu
                                        konfirmasi
                                    </p>
                                </div>
                                <Link href={route("confirmation.index")}>
                                    <button className="w-full flex items-center justify-center gap-2 bg-[#298fa3] hover:bg-[#206f80] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-[#298fa3]/20 transition-all duration-300 transform group-hover:translate-y-[-2px]">
                                        <CheckCircle className="w-[20px] h-[20px]" />
                                        Konfirmasi Terima
                                    </button>
                                </Link>
                            </div>
                            {/* Background Pattern/Icon */}
                            <div className="absolute -bottom-6 -right-6 text-gray-50 dark:text-gray-800 pointer-events-none opacity-50 dark:opacity-10 transform rotate-12">
                                <Truck className="w-[140px] h-[140px]" />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#2c3136] rounded-xl shadow-sm overflow-hidden border border-green-200 dark:border-green-800 p-6">
                            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                                <CheckCircle className="w-8 h-8" />
                                <div>
                                    <h4 className="font-bold">
                                        Tidak Ada Pending
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Semua pengiriman sudah dikonfirmasi
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* History Widget */}
                    <div className="bg-white dark:bg-[#2c3136] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Riwayat Terakhir
                            </h3>
                            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <Filter className="w-[20px] h-[20px]" />
                            </button>
                        </div>
                        <div className="flex flex-col">
                            {roomTransactions.length > 0 ? (
                                roomTransactions.map(
                                    (trx: any, index: number) => (
                                        <div
                                            key={trx.id}
                                            className={`flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                                                index <
                                                roomTransactions.length - 1
                                                    ? "border-b border-gray-50 dark:border-gray-800/50"
                                                    : ""
                                            }`}
                                        >
                                            <div
                                                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getTransactionColor(
                                                    trx.type,
                                                )}`}
                                            >
                                                {getTransactionIcon(trx.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                    {getTransactionLabel(
                                                        trx.type,
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {trx.user?.name || "System"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                                    {formatTime(trx.created_at)}
                                                </p>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-[10px] ${
                                                        trx.status ===
                                                        "confirmed"
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-amber-50 text-amber-700"
                                                    }`}
                                                >
                                                    {trx.status === "confirmed"
                                                        ? "Success"
                                                        : "Pending"}
                                                </Badge>
                                            </div>
                                        </div>
                                    ),
                                )
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    Belum ada transaksi
                                </div>
                            )}
                        </div>
                        <Link
                            href={route("nurse.riwayat")}
                            className="p-3 text-center text-xs font-bold text-gray-500 hover:text-[#298fa3] hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-1"
                        >
                            Lihat Semua Riwayat
                            <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white relative overflow-hidden shadow-lg">
                        <div className="relative z-10">
                            <h4 className="font-bold text-sm mb-1 opacity-90">
                                Butuh Bantuan Cepat?
                            </h4>
                            <p className="text-xs text-gray-300 mb-3">
                                Kontak Admin Laundry
                            </p>
                            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors text-white text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-2 w-fit">
                                <Phone className="w-4 h-4" />
                                Hubungi Admin
                            </button>
                        </div>
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-20">
                            <Headset className="w-[80px] h-[80px]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
