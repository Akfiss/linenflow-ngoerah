import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import {
    Bed,
    CheckCircle,
    Info,
    AlertTriangle,
    Truck,
    Download,
    Upload,
    FileText,
    Search,
    Filter,
    Phone,
    Headset,
    MoreVertical,
    ChevronRight,
    Bell,
    Menu,
    Calendar,
    CalendarDays,
    Layers, // As generic inventory
    CheckCircle2,
} from "lucide-react";
import { usePage } from "@inertiajs/react";

export default function HeadNurseDashboard() {
    const { auth } = usePage().props as any;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-display text-slate-900 dark:text-gray-100">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Dashboard ICU
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

            {/* Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left Column: Stock Table & Info */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    {/* Stock Table Card */}
                    <div className="bg-white dark:bg-[#2c3136] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Layers className="text-[#298fa3] w-6 h-6" />
                                Stok Ruangan ICU Saat Ini
                            </h3>
                            <button className="text-sm font-semibold text-[#298fa3] hover:text-[#206f80] transition-colors">
                                Lihat Semua
                            </button>
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
                                    {/* Row 1 */}
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <Bed className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-bold">
                                                    Sprei Dewasa
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Cotton - White
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-base font-semibold">
                                            12
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-base">
                                            20
                                        </td>
                                        <td className="px-6 py-4 text-red-500 font-mono text-base font-bold">
                                            +8
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                                Low Stock
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 2 */}
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-bold">
                                                    Sarung Bantal
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Standard
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-base font-semibold">
                                            15
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-base">
                                            30
                                        </td>
                                        <td className="px-6 py-4 text-red-500 font-mono text-base font-bold">
                                            +15
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                                Low Stock
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 3 */}
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-bold">
                                                    Selimut Wool
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Teal - Thermal
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-base font-semibold">
                                            22
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-base">
                                            25
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-base">
                                            -
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                Normal
                                            </span>
                                        </td>
                                    </tr>
                                    {/* Row 4 */}
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                                <Layers className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-bold">
                                                    Handuk Mandi
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Large
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-base font-semibold">
                                            40
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-base">
                                            40
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-base">
                                            -
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                                                Normal
                                            </span>
                                        </td>
                                    </tr>
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
                                    Tips Efisiensi
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Stok sprei sering habis di hari Selasa.
                                    Pertimbangkan untuk meningkatkan permintaan
                                    di Senin sore.
                                </p>
                            </div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-6 border border-orange-100 dark:border-orange-900/30 flex items-start gap-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg text-orange-600 dark:text-orange-400">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                    Perhatian
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Terdapat 3 item dengan stok di bawah 40%.
                                    Segera buat permintaan baru jika laundry
                                    belum dikirim.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Actions & History */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Pending Action Card */}
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
                                    Sedang Dalam Perjalanan
                                </div>
                                <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    TRX-20260116-001
                                </span>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-2">
                                    Pengiriman Linen Bersih
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Dikirim dari Central Laundry, estimasi tiba
                                    pukul 10:30 WIB.
                                </p>
                            </div>
                            {/* Mini item preview */}
                            <div className="flex -space-x-3 mb-6 overflow-hidden py-1">
                                <div
                                    className="relative z-30 inline-flex h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#2c3136] bg-gray-100 dark:bg-gray-700 items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                                    title="Sprei"
                                >
                                    +40
                                </div>
                                <div
                                    className="relative z-20 inline-flex h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#2c3136] bg-gray-200 dark:bg-gray-600 items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                                    title="Sarung Bantal"
                                >
                                    +30
                                </div>
                                <div
                                    className="relative z-10 inline-flex h-10 w-10 rounded-full ring-2 ring-white dark:ring-[#2c3136] bg-gray-300 dark:bg-gray-500 items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300"
                                    title="Selimut"
                                >
                                    +20
                                </div>
                                <div className="relative z-0 inline-flex px-3 h-10 rounded-full bg-gray-50 dark:bg-gray-800 items-center text-xs text-gray-500 dark:text-gray-400 pl-5 border border-gray-100 dark:border-gray-700">
                                    3 Jenis Item
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 bg-[#298fa3] hover:bg-[#206f80] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-[#298fa3]/20 transition-all duration-300 transform group-hover:translate-y-[-2px]">
                                <CheckCircle className="w-[20px] h-[20px]" />
                                Konfirmasi Terima
                            </button>
                        </div>
                        {/* Background Pattern/Icon */}
                        <div className="absolute -bottom-6 -right-6 text-gray-50 dark:text-gray-800 pointer-events-none opacity-50 dark:opacity-10 transform rotate-12">
                            <Truck className="w-[140px] h-[140px]" />
                        </div>
                    </div>

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
                            {/* Item 1 */}
                            <div className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-800/50">
                                <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 mt-0.5">
                                    <Download className="w-[18px] h-[18px]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        Penerimaan Linen Bersih
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Diterima oleh Ns. Dewi
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                        08:00 AM
                                    </p>
                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 dark:bg-transparent dark:text-green-400">
                                        Success
                                    </span>
                                </div>
                            </div>
                            {/* Item 2 */}
                            <div className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-800/50">
                                <div className="h-9 w-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                                    <Upload className="w-[18px] h-[18px]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        Pengembalian Linen Kotor
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Diserahkan ke Petugas
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                        Kemarin
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        16:45 PM
                                    </p>
                                </div>
                            </div>
                            {/* Item 3 */}
                            <div className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                                    <FileText className="w-[18px] h-[18px]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                        Stok Opname Mingguan
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Verifikasi Manual
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                        Kemarin
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        09:15 AM
                                    </p>
                                </div>
                            </div>
                        </div>
                        <a
                            className="p-3 text-center text-xs font-bold text-gray-500 hover:text-[#298fa3] hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors border-t border-gray-100 dark:border-gray-800"
                            href="#"
                        >
                            Lihat Semua Riwayat
                        </a>
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
