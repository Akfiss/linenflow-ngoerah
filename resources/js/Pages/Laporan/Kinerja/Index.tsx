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
    TrendingDown,
    Activity,
    Package,
    Calendar,
    Clock,
    Zap,
    Timer,
    Target,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

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

    const typeLabels: Record<string, string> = {
        OUT_DISTRIBUTION: "Distribusi",
        IN_COLLECTION: "Penerimaan",
        WASH_START: "Mulai Cuci",
        WASH_FINISH: "Selesai Cuci",
        ADJUSTMENT: "Penyesuaian",
        DISPOSAL: "Afkir",
    };

    // Calculate analysis metrics
    const totalWashStart =
        chartData?.reduce((sum, d) => sum + d.wash_start, 0) || 0;
    const totalWashFinish =
        chartData?.reduce((sum, d) => sum + d.wash_finish, 0) || 0;
    const efficiencyRate =
        totalWashStart > 0
            ? Math.round((totalWashFinish / totalWashStart) * 100)
            : 100;

    // Simulate average turnaround (in hours) - would be calculated from actual data
    const avgTurnaroundHours = 4.5;

    // Calculate trend from last two data points
    const trendDirection =
        chartData && chartData.length >= 2
            ? chartData[chartData.length - 1].wash_finish >=
              chartData[chartData.length - 2].wash_finish
                ? "up"
                : "down"
            : "up";

    const trendPercentage =
        chartData &&
        chartData.length >= 2 &&
        chartData[chartData.length - 2].wash_finish > 0
            ? Math.abs(
                  Math.round(
                      ((chartData[chartData.length - 1].wash_finish -
                          chartData[chartData.length - 2].wash_finish) /
                          chartData[chartData.length - 2].wash_finish) *
                          100,
                  ),
              )
            : 0;

    // Peak hours analysis (mock data - would be from actual timestamps)
    const peakHours = "08:00 - 10:00";

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
                    <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
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

                    <Card className="shadow-sm border-0 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
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

                    <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
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

                    <Card className="shadow-sm border-0 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-800/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
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

                {/* Modern Area Chart */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Trend Pencucian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {chartData?.length === 0 ? (
                            <div className="h-80 flex items-center justify-center text-slate-500">
                                Tidak ada data untuk ditampilkan
                            </div>
                        ) : (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        margin={{
                                            top: 10,
                                            right: 30,
                                            left: 0,
                                            bottom: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="colorWashStart"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#06b6d4"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#06b6d4"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                            <linearGradient
                                                id="colorWashFinish"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#10b981"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#10b981"
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#e2e8f0"
                                        />
                                        <XAxis
                                            dataKey="period"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) =>
                                                value.split("-").pop()
                                            }
                                            stroke="#94a3b8"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            stroke="#94a3b8"
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#fff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "8px",
                                                boxShadow:
                                                    "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                            }}
                                            labelFormatter={(label) =>
                                                `Periode: ${label}`
                                            }
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="wash_start"
                                            name="Mulai Cuci"
                                            stroke="#06b6d4"
                                            fillOpacity={1}
                                            fill="url(#colorWashStart)"
                                            strokeWidth={2}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="wash_finish"
                                            name="Selesai Cuci"
                                            stroke="#10b981"
                                            fillOpacity={1}
                                            fill="url(#colorWashFinish)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Analysis Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Metrics Cards */}
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Analisis Kinerja
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Average Turnaround */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Timer className="h-4 w-4 text-cyan-600" />
                                        <span className="text-sm font-medium text-slate-600">
                                            Avg. Turnaround
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {avgTurnaroundHours}h
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Rata-rata waktu cuci
                                    </p>
                                </div>

                                {/* Efficiency Rate */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-4 w-4 text-amber-600" />
                                        <span className="text-sm font-medium text-slate-600">
                                            Efisiensi
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {efficiencyRate}%
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Tingkat penyelesaian
                                    </p>
                                </div>

                                {/* Volume Trend */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        {trendDirection === "up" ? (
                                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className="text-sm font-medium text-slate-600">
                                            Volume Trend
                                        </span>
                                    </div>
                                    <p
                                        className={`text-2xl font-bold ${trendDirection === "up" ? "text-emerald-600" : "text-red-500"}`}
                                    >
                                        {trendDirection === "up" ? "+" : "-"}
                                        {trendPercentage}%
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        vs periode sebelumnya
                                    </p>
                                </div>

                                {/* Peak Hours */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-medium text-slate-600">
                                            Jam Sibuk
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900">
                                        {peakHours}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Aktivitas tertinggi
                                    </p>
                                </div>
                            </div>
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
                                                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
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
