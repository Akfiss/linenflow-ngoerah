import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { usePage, Link } from "@inertiajs/react";
import {
    Truck,
    ArrowRightToLine,
    Play,
    Check,
    CheckCircle2,
    Clock,
    Plus,
    Shirt, // If available, otherwise use Layers
    Waves,
    Zap, // For 'bolt' icon equivalent
    CalendarDays,
} from "lucide-react";
import { useState } from "react";

export default function OperatorDashboard() {
    const { auth } = usePage().props as any;

    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: "Distribusi ke IGD",
            time: "08:00 AM",
            urgent: true,
            completed: false,
        },
        {
            id: 2,
            title: "Ambil kotor dari ICU",
            time: "09:30 AM",
            no_urgent: true,
            completed: false,
        },
        {
            id: 3,
            title: "Cek stok deterjen",
            time: "11:00 AM",
            completed: false,
        },
        {
            id: 4,
            title: "Briefing Pagi",
            time: "07:00 AM",
            completed: true,
        },
    ]);

    const toggleTask = (id: number) => {
        setTasks(
            tasks.map((t) =>
                t.id === id ? { ...t, completed: !t.completed } : t,
            ),
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-sans text-slate-800 dark:text-white">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-1">
                        Halo, {auth.user.name.split(" ")[0]} 👋
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
                        Ringkasan aktivitas operasional laundry hari ini.
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
            </div>

            {/* Status Cards (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Clean Linen */}
                <div className="bg-white dark:bg-[#2d333b] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 className="w-24 h-24 text-green-500 -mr-4 -mt-4 transform rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                <Shirt className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Linen Bersih
                            </span>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                    1,250
                                </span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    pcs
                                </span>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Siap Kirim
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dirty Linen */}
                <div className="bg-white dark:bg-[#2d333b] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Waves className="w-24 h-24 text-orange-500 -mr-4 -mt-4 transform rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                <Waves className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Linen Kotor
                            </span>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                    320
                                </span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    pcs
                                </span>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                Menunggu
                            </div>
                        </div>
                    </div>
                </div>

                {/* Washing Process */}
                <div className="bg-white dark:bg-[#2d333b] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        {/* Droplets or similar for washing */}
                        <Waves className="w-24 h-24 text-yellow-500 -mr-4 -mt-4 transform rotate-12" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                                <Waves className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Sedang Cuci
                            </span>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                    80
                                </span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    pcs
                                </span>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                Di Mesin
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Actions & Tasks Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions Grid (Span 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#22a8c3]" />
                        Aksi Cepat (Quick Actions)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Distribute Button */}
                        <Link href="/sirkulasi/distribusi" className="block">
                            <button className="group relative flex flex-col justify-between p-6 h-40 w-full rounded-2xl bg-[#22a8c3] text-white hover:bg-[#22a8c3]/90 transition-all shadow-lg shadow-[#22a8c3]/20 overflow-hidden text-left">
                                <div className="absolute right-0 top-0 p-4 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all">
                                    <Truck className="w-24 h-24 -mr-6 -mt-6" />
                                </div>
                                <div className="bg-white/20 w-fit p-2 rounded-lg backdrop-blur-sm">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">
                                        Distribusi Bersih
                                    </p>
                                    <p className="text-white/80 text-sm mt-1">
                                        Kirim linen ke ruangan
                                    </p>
                                </div>
                            </button>
                        </Link>

                        {/* Receive Button */}
                        <Link href="/sirkulasi/penerimaan" className="block">
                            <button className="group relative flex flex-col justify-between p-6 h-40 w-full rounded-2xl bg-white dark:bg-[#2d333b] border-2 border-[#22a8c3]/20 hover:border-[#22a8c3] text-slate-900 dark:text-white hover:shadow-lg transition-all text-left">
                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                                    <ArrowRightToLine className="w-24 h-24 -mr-6 -mt-6 text-[#22a8c3]" />
                                </div>
                                <div className="bg-[#22a8c3]/10 w-fit p-2 rounded-lg text-[#22a8c3]">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">
                                        Terima Kotor
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        Input linen masuk
                                    </p>
                                </div>
                            </button>
                        </Link>

                        {/* Start Wash */}
                        <Link href="/produksi/cuci" className="block">
                            <button className="group relative flex flex-col justify-between p-6 h-40 w-full rounded-2xl bg-white dark:bg-[#2d333b] border border-slate-200 dark:border-slate-700 hover:border-[#22a8c3]/50 text-slate-900 dark:text-white hover:shadow-md transition-all text-left">
                                <div className="bg-slate-100 dark:bg-slate-800 w-fit p-2 rounded-lg text-slate-600 dark:text-slate-300 group-hover:text-[#22a8c3] group-hover:bg-[#22a8c3]/10 transition-colors">
                                    <Play className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold">
                                        Mulai Cuci
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        Set mesin & cycle
                                    </p>
                                </div>
                            </button>
                        </Link>

                        {/* Finish Wash */}
                        <Link href="/produksi/cuci" className="block">
                            <button className="group relative flex flex-col justify-between p-6 h-40 w-full rounded-2xl bg-white dark:bg-[#2d333b] border border-slate-200 dark:border-slate-700 hover:border-[#22a8c3]/50 text-slate-900 dark:text-white hover:shadow-md transition-all text-left">
                                <div className="bg-slate-100 dark:bg-slate-800 w-fit p-2 rounded-lg text-slate-600 dark:text-slate-300 group-hover:text-green-600 group-hover:bg-green-50 transition-colors">
                                    <Check className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold">
                                        Selesai Cuci
                                    </p>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        Konfirmasi hasil cuci
                                    </p>
                                </div>
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Tasks Widget */}
                <div className="bg-white dark:bg-[#2d333b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col h-full">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Tugas Hari Ini</h3>
                        <span className="bg-slate-100 dark:bg-slate-800 text-xs font-bold px-2 py-1 rounded text-slate-500 dark:text-slate-400">
                            {tasks.filter((t) => !t.completed).length} Pending
                        </span>
                    </div>
                    <div className="p-4 space-y-3 flex-1">
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-3">
                                {tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleTask(task.id)}
                                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer group ${
                                            task.completed
                                                ? "bg-slate-50 dark:bg-white/5 opacity-60"
                                                : "hover:bg-slate-50 dark:hover:bg-white/5"
                                        }`}
                                    >
                                        <div
                                            className={`mt-0.5 flex items-center justify-center w-5 h-5 border-2 rounded transition-colors ${
                                                task.completed
                                                    ? "bg-slate-400 border-slate-400"
                                                    : "border-slate-300 dark:border-slate-600 group-hover:border-[#22a8c3]"
                                            }`}
                                        >
                                            {task.completed && (
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p
                                                className={`text-sm font-semibold transition-colors ${
                                                    task.completed
                                                        ? "text-slate-500 line-through"
                                                        : "text-slate-800 dark:text-slate-200 group-hover:text-[#22a8c3]"
                                                }`}
                                            >
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span
                                                    className={`text-xs flex items-center gap-1 ${
                                                        task.completed
                                                            ? "text-slate-400"
                                                            : "text-slate-500"
                                                    }`}
                                                >
                                                    <Clock className="w-3 h-3" />{" "}
                                                    {task.time}
                                                </span>
                                                {task.urgent &&
                                                    !task.completed && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded font-medium">
                                                            Urgent
                                                        </span>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 p-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#22a8c3] hover:bg-[#22a8c3]/5 rounded-xl border border-dashed border-[#22a8c3]/30 hover:border-[#22a8c3] transition-all">
                                <Plus className="w-5 h-5" />
                                Tambah Tugas Baru
                            </button>
                        </ScrollArea>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white dark:bg-[#2d333b] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg">Aktivitas Terakhir</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
                            <tr>
                                <th className="px-6 py-3">Waktu</th>
                                <th className="px-6 py-3">Aktivitas</th>
                                <th className="px-6 py-3">Lokasi</th>
                                <th className="px-6 py-3">Jumlah</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                {
                                    time: "09:15",
                                    activity: "Penerimaan Kotor",
                                    location: "Ruang Operasi (OK)",
                                    amount: "45 pcs",
                                    status: "Selesai",
                                    statusColor:
                                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                                },
                                {
                                    time: "08:45",
                                    activity: "Mulai Cuci",
                                    location: "Mesin A-02",
                                    amount: "80 pcs",
                                    status: "Proses",
                                    statusColor:
                                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
                                },
                                {
                                    time: "08:10",
                                    activity: "Distribusi Bersih",
                                    location: "Rawat Inap Lt. 3",
                                    amount: "120 pcs",
                                    status: "Selesai",
                                    statusColor:
                                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
                                },
                            ].map((row, i) => (
                                <tr
                                    key={i}
                                    className="bg-white dark:bg-[#2d333b] border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4">{row.time}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {row.activity}
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.location}
                                    </td>
                                    <td className="px-6 py-4">{row.amount}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`${row.statusColor} text-xs font-medium px-2.5 py-0.5 rounded`}
                                        >
                                            {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
