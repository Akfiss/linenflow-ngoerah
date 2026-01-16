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
    defs,
    linearGradient,
    stop,
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
import { usePage } from "@inertiajs/react";

const data = [
    { name: "Senin", total: 1200 },
    { name: "Selasa", total: 1800 },
    { name: "Rabu", total: 1400 },
    { name: "Kamis", total: 2600 },
    { name: "Jumat", total: 1800 },
    { name: "Sabtu", total: 3200 },
    { name: "Minggu", total: 2400 },
];

export default function ManagerDashboard() {
    const { auth } = usePage().props as any;

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
                        2,450
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
                        850
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
                        1,200
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
                        12 Items
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
                            Trend Distribusi Mingguan
                        </h3>
                        <p className="text-sm text-slate-500">
                            Total 15,400 Pcs didistribusikan dalam 7 hari
                            terakhir.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select className="text-sm border-slate-200 dark:border-slate-700 dark:bg-[#2b303b] dark:text-white rounded-lg focus:ring-[#298fa3] focus:border-[#298fa3]">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>This Month</option>
                        </select>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
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
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        Sprei Pasien Putih
                                    </td>
                                    <td className="px-6 py-4">Gudang Utama</td>
                                    <td className="px-6 py-4 text-red-600 font-bold">
                                        120
                                    </td>
                                    <td className="px-6 py-4">250</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-md font-medium">
                                            Critical
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        Selimut Wool
                                    </td>
                                    <td className="px-6 py-4">Ruang VIP</td>
                                    <td className="px-6 py-4 text-amber-600 font-bold">
                                        15
                                    </td>
                                    <td className="px-6 py-4">20</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs px-2 py-1 rounded-md font-medium">
                                            Low
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        Baju Operasi Hijau
                                    </td>
                                    <td className="px-6 py-4">Unit OK</td>
                                    <td className="px-6 py-4 text-red-600 font-bold">
                                        45
                                    </td>
                                    <td className="px-6 py-4">100</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-md font-medium">
                                            Critical
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        Sarung Bantal
                                    </td>
                                    <td className="px-6 py-4">Gudang Utama</td>
                                    <td className="px-6 py-4 text-amber-600 font-bold">
                                        88
                                    </td>
                                    <td className="px-6 py-4">100</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs px-2 py-1 rounded-md font-medium">
                                            Low
                                        </span>
                                    </td>
                                </tr>
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
                        {/* Item 1 */}
                        <div className="flex gap-4">
                            <div className="relative mt-1">
                                <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 z-10 relative">
                                    <Check className="w-4 h-4" />
                                </div>
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-100 dark:bg-slate-800 -z-0"></div>
                            </div>
                            <div className="flex-1 pb-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Distribusi Bersih ke ICU
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    250 items accepted by Sr. Nurse Ani
                                </p>
                                <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                                    10:45 AM
                                </span>
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="flex gap-4">
                            <div className="relative mt-1">
                                <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 z-10 relative">
                                    <WashingMachine className="w-4 h-4" />
                                </div>
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-100 dark:bg-slate-800 -z-0"></div>
                            </div>
                            <div className="flex-1 pb-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Mulai Siklus Cuci #402
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Mesin A & C • 150kg Load
                                </p>
                                <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                                    09:30 AM
                                </span>
                            </div>
                        </div>
                        {/* Item 3 */}
                        <div className="flex gap-4">
                            <div className="relative mt-1">
                                <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 z-10 relative">
                                    <Archive className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex-1 pb-2">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Penerimaan Linen Kotor
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Dari Ruang Rawat Inap Lt.3
                                </p>
                                <span className="text-[10px] font-medium text-slate-400 mt-2 block">
                                    08:15 AM
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        View Full Log
                    </button>
                </div>
            </div>
        </div>
    );
}
