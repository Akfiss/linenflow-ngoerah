import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    BarChart3,
    TrendingUp,
    Activity,
    Package,
    Calendar,
} from "lucide-react";

interface ChartDataPoint {
    period: string;
    wash_start: number;
    wash_finish: number;
}

interface Props {
    chartData: ChartDataPoint[];
    summary: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        totalProcessed: number;
    };
    distributionByType: Record<string, number>;
    period: string;
}

export default function KinerjaLaundry({
    chartData,
    summary,
    distributionByType,
    period,
}: Props) {
    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            route("laporan.kinerja"),
            { period: newPeriod },
            { preserveState: true, preserveScroll: true },
        );
    };

    const maxValue = Math.max(
        ...chartData.map((d) => Math.max(d.wash_start, d.wash_finish)),
        1,
    );

    const typeLabels: Record<string, string> = {
        OUT_DISTRIBUTION: "Distribusi",
        IN_COLLECTION: "Penerimaan",
        WASH_START: "Mulai Cuci",
        WASH_FINISH: "Selesai Cuci",
        ADJUSTMENT: "Penyesuaian",
        DISPOSAL: "Afkir",
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kinerja Laundry" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <BarChart3 className="h-6 w-6 text-primary" />
                            Kinerja Laundry
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Statistik dan analisis performa laundry.
                        </p>
                    </div>
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Periode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">
                                Harian (30 hari)
                            </SelectItem>
                            <SelectItem value="weekly">
                                Mingguan (12 minggu)
                            </SelectItem>
                            <SelectItem value="monthly">
                                Bulanan (12 bulan)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Hari Ini
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {summary?.today ?? 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Minggu Ini
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {summary?.thisWeek ?? 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Calendar className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Bulan Ini
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {summary?.thisMonth ?? 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Package className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Item
                                    </p>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {summary?.totalProcessed ?? 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Trend Pencucian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {chartData?.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-slate-500">
                                    Tidak ada data untuk ditampilkan
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Legend */}
                                    <div className="flex gap-4 justify-end text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-cyan-500"></div>
                                            <span className="text-slate-600">
                                                Mulai Cuci
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded bg-emerald-500"></div>
                                            <span className="text-slate-600">
                                                Selesai Cuci
                                            </span>
                                        </div>
                                    </div>

                                    {/* Simple Bar Chart */}
                                    <div className="h-64 flex items-end gap-2 px-4">
                                        {chartData?.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex-1 flex flex-col items-center gap-1"
                                            >
                                                <div className="w-full flex gap-1 h-48 items-end">
                                                    <div
                                                        className="flex-1 bg-cyan-500 rounded-t transition-all"
                                                        style={{
                                                            height: `${(item.wash_start / maxValue) * 100}%`,
                                                            minHeight:
                                                                item.wash_start >
                                                                0
                                                                    ? "4px"
                                                                    : "0",
                                                        }}
                                                        title={`Mulai Cuci: ${item.wash_start}`}
                                                    ></div>
                                                    <div
                                                        className="flex-1 bg-emerald-500 rounded-t transition-all"
                                                        style={{
                                                            height: `${(item.wash_finish / maxValue) * 100}%`,
                                                            minHeight:
                                                                item.wash_finish >
                                                                0
                                                                    ? "4px"
                                                                    : "0",
                                                        }}
                                                        title={`Selesai Cuci: ${item.wash_finish}`}
                                                    ></div>
                                                </div>
                                                <span className="text-[10px] text-slate-500 truncate max-w-full">
                                                    {item.period
                                                        .split("-")
                                                        .pop()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Distribution by Type */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">
                                Distribusi Transaksi
                            </CardTitle>
                            <p className="text-sm text-slate-500">Bulan ini</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(distributionByType || {})
                                    .length === 0 ? (
                                    <div className="text-center text-slate-500 py-8">
                                        Tidak ada data transaksi bulan ini
                                    </div>
                                ) : (
                                    Object.entries(
                                        distributionByType || {},
                                    ).map(([type, count]) => {
                                        const total = Object.values(
                                            distributionByType || {},
                                        ).reduce((a, b) => a + b, 0);
                                        const percentage =
                                            total > 0
                                                ? (count / total) * 100
                                                : 0;

                                        return (
                                            <div
                                                key={type}
                                                className="space-y-2"
                                            >
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-600">
                                                        {typeLabels[type] ||
                                                            type}
                                                    </span>
                                                    <span className="font-medium text-slate-900">
                                                        {count}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary rounded-full transition-all"
                                                        style={{
                                                            width: `${percentage}%`,
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
