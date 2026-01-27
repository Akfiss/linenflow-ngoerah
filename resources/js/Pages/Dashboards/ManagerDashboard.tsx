import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    Check,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    ArrowRight,
    Download,
    Plus,
    Shirt,
    Trash2,
    WashingMachine,
    MoreHorizontal,
    Archive,
    CalendarDays,
    Minus,
} from "lucide-react";
import { usePage, Link } from "@inertiajs/react";

// Types for props
interface Stats {
    totalClean: number;
    totalDirty: number;
    totalWashing: number;
    totalInRooms: number;
    totalLinens: number;
    totalRooms: number;
}

interface LowStockRoom {
    id: number;
    room: { id: number; name: string };
    linen: { id: number; name: string };
    current_qty: number;
    par_stock: number;
}

interface RecentTransaction {
    id: number;
    trx_code: string;
    type: string;
    trx_date: string;
    created_at: string;
    room?: { id: number; name: string };
    user?: { id: number; name: string };
}

interface MonthlyTransactions {
    [key: string]: number;
}

export default function ManagerDashboard() {
    const {
        auth,
        stats,
        lowStockRooms,
        recentTransactions,
        monthlyTransactions,
        chartData: chartDataProp,
    } = usePage().props as any;

    // State for chart period selection
    const [chartPeriod, setChartPeriod] = useState<
        "last7Days" | "last30Days" | "thisMonth"
    >("last7Days");

    // Get current chart data based on period
    const currentChartData = chartDataProp?.[chartPeriod] || [];
    const currentTotal = chartDataProp?.totals?.[chartPeriod] || 0;

    // Period labels
    const periodLabels = {
        last7Days: { label: "Last 7 Days", description: "7 hari terakhir" },
        last30Days: {
            label: "Last 30 Days",
            description: "30 hari terakhir (per minggu)",
        },
        thisMonth: { label: "This Month", description: "Bulan ini (per hari)" },
    };

    const getTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            OUT_DISTRIBUTION: "Distribusi Bersih",
            IN_COLLECTION: "Penerimaan Kotor",
            WASH_START: "Mulai Cuci",
            WASH_FINISH: "Selesai Cuci",
            ADJUSTMENT: "Penyesuaian",
            DISPOSAL: "Afkir",
        };
        return labels[type] || type;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "OUT_DISTRIBUTION":
                return <Check className="w-4 h-4" />;
            case "IN_COLLECTION":
                return <Archive className="w-4 h-4" />;
            case "WASH_START":
            case "WASH_FINISH":
                return <WashingMachine className="w-4 h-4" />;
            default:
                return <Archive className="w-4 h-4" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "OUT_DISTRIBUTION":
                return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600";
            case "IN_COLLECTION":
                return "bg-amber-100 dark:bg-amber-900/30 text-amber-600";
            case "WASH_START":
            case "WASH_FINISH":
                return "bg-blue-100 dark:bg-blue-900/30 text-blue-600";
            default:
                return "bg-slate-100 dark:bg-slate-800 text-slate-600";
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#21242c] font-display animate-in fade-in duration-500">
            {/* Header / Overview Section */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Overview
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Real-time update sirkulasi linen rumah sakit hari ini.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                    {/* System Online Badge */}
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

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2b303b] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 transition-colors">
                            <Download className="w-[18px] h-[18px]" />
                            Export Report
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#298fa3] text-white rounded-lg text-sm font-medium shadow-sm hover:bg-[#1f7a8c] transition-colors">
                            <Plus className="w-[18px] h-[18px]" />
                            Request Linen
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Clean Linen Card */}
                <div className="bg-white dark:bg-[#2b303b] p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <Shirt className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                            +5.2%
                            <TrendingUp className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                        Linen Bersih
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {stats?.totalClean?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2">
                        Ready for distribution
                    </p>
                </div>

                {/* Dirty Linen Card */}
                <div className="bg-white dark:bg-[#2b303b] p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                            +2.1%
                            <TrendingUp className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                        Linen Kotor
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {stats?.totalDirty?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2">
                        Pending collection
                    </p>
                </div>

                {/* Washing Process Card */}
                <div className="bg-white dark:bg-[#2b303b] p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <WashingMachine className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                            0.8%
                            <Minus className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                        Proses Cuci
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        {stats?.totalWashing?.toLocaleString() || "0"}
                    </h3>
                    <p className="text-slate-400 text-xs mt-2">
                        Currently in machines
                    </p>
                </div>

                {/* Critical Stock Card */}
                <div className="bg-white dark:bg-[#2b303b] p-6 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full -mr-6 -mt-6"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                            -3 Items
                            <TrendingDown className="w-3.5 h-3.5 ml-0.5" />
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium relative z-10">
                        Stok Kritis (Par Level)
                    </p>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1 relative z-10">
                        {lowStockRooms?.length || 0} Items
                    </h3>
                    <p className="text-red-500 text-xs mt-2 font-medium relative z-10">
                        Requires immediate attention
                    </p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="w-full bg-white dark:bg-[#2b303b] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Trend Distribusi{" "}
                            {periodLabels[chartPeriod].description}
                        </h3>
                        <p className="text-sm text-slate-500">
                            Total {currentTotal.toLocaleString()} Pcs
                            didistribusikan pada{" "}
                            {periodLabels[chartPeriod].description}.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            className="text-sm border-slate-200 dark:border-slate-700 dark:bg-[#2b303b] dark:text-white rounded-lg focus:ring-[#298fa3] focus:border-[#298fa3]"
                            value={chartPeriod}
                            onChange={(e) =>
                                setChartPeriod(e.target.value as any)
                            }
                        >
                            <option value="last7Days">Last 7 Days</option>
                            <option value="last30Days">Last 30 Days</option>
                            <option value="thisMonth">This Month</option>
                        </select>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={currentChartData}
                            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient
                                    id="gradientPrimary"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#298fa3"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#298fa3"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#f1f5f9"
                            />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "#94a3b8",
                                    fontSize: 12,
                                    fontWeight: 500,
                                }}
                                dy={10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#1e293b",
                                    border: "none",
                                    borderRadius: "8px",
                                    color: "#fff",
                                }}
                                itemStyle={{ color: "#fff" }}
                                cursor={{ stroke: "#298fa3", strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#298fa3"
                                strokeWidth={3}
                                fill="url(#gradientPrimary)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Row Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Par Level Alerts */}
                <div className="lg:col-span-2 bg-white dark:bg-[#2b303b] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <AlertTriangle className="text-red-500 w-5 h-5" />
                            Par Level Alerts
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-2 py-0.5 rounded-full">
                                Low Stock
                            </span>
                        </h3>
                        <a
                            href="#"
                            className="text-sm text-[#298fa3] font-medium hover:underline"
                        >
                            View Inventory
                        </a>
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500">
                                <tr>
                                    <th className="px-6 py-3">Item Name</th>
                                    <th className="px-6 py-3">Lokasi</th>
                                    <th className="px-6 py-3">Current</th>
                                    <th className="px-6 py-3">Min Level</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {lowStockRooms && lowStockRooms.length > 0 ? (
                                    lowStockRooms
                                        .slice(0, 5)
                                        .map((item: any) => {
                                            const ratio =
                                                item.current_qty /
                                                item.par_stock;
                                            const isCritical = ratio < 0.5;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                                        {item.linen?.name ||
                                                            "-"}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.room?.name || "-"}
                                                    </td>
                                                    <td
                                                        className={`px-6 py-4 font-bold ${isCritical ? "text-red-600" : "text-amber-600"}`}
                                                    >
                                                        {item.current_qty}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.par_stock}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-md font-medium ${
                                                                isCritical
                                                                    ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                                                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                                                            }`}
                                                        >
                                                            {isCritical
                                                                ? "Critical"
                                                                : "Low"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-6 py-8 text-center text-slate-500"
                                        >
                                            Tidak ada stok kritis saat ini
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Transaksi Terakhir */}
                <div className="bg-white dark:bg-[#2b303b] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-900 dark:text-white">
                            Transaksi Terakhir
                        </h3>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-6 flex-1">
                        {recentTransactions && recentTransactions.length > 0 ? (
                            recentTransactions
                                .slice(0, 5)
                                .map((trx: any, index: number) => (
                                    <div className="flex gap-4" key={trx.id}>
                                        <div className="relative mt-1">
                                            <div
                                                className={`size-8 rounded-full flex items-center justify-center z-10 relative ${getTypeColor(trx.type)}`}
                                            >
                                                {getTypeIcon(trx.type)}
                                            </div>
                                            {index <
                                                Math.min(
                                                    recentTransactions.length -
                                                        1,
                                                    4,
                                                ) && (
                                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-100 dark:bg-slate-800 -z-0"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-2">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {getTypeLabel(trx.type)}{" "}
                                                {trx.room
                                                    ? `ke ${trx.room.name}`
                                                    : ""}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {trx.trx_code} •{" "}
                                                {trx.user?.name || "System"}
                                            </p>
                                            <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                                                {formatTime(trx.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                Belum ada transaksi hari ini
                            </div>
                        )}
                    </div>
                    <Link href={route("laporan.transaksi")}>
                        <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            View Full Log
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
