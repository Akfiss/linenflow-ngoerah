import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { usePage, router } from "@inertiajs/react";
import { useState } from "react";
import {
    Activity,
    Users,
    Shield,
    TrendingUp,
    AlertTriangle,
    Download,
    Filter,
    History,
    Minus,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
} from "lucide-react";

interface ActivityLog {
    id: number;
    user_id: number | null;
    action: string;
    target_type: string | null;
    target_name: string | null;
    status: "success" | "warning" | "error";
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

interface PaginatedLogs {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    stats: {
        totalUsers: number;
        activeRoles: number;
        avgActivity: number;
    };
    activityLogs: PaginatedLogs;
    filters: {
        action: string | null;
        status: string | null;
        user_id: string | null;
        date_from: string | null;
        date_to: string | null;
    };
    filterOptions: {
        actions: string[];
        users: Array<{ id: number; name: string }>;
    };
}

export default function SuperAdminDashboard() {
    const { stats, activityLogs, filters, filterOptions } = usePage<{
        stats: Props["stats"];
        activityLogs: Props["activityLogs"];
        filters: Props["filters"];
        filterOptions: Props["filterOptions"];
    }>().props;

    const [showFilters, setShowFilters] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        action: filters?.action || "",
        status: filters?.status || "",
        user_id: filters?.user_id || "",
        date_from: filters?.date_from || "",
        date_to: filters?.date_to || "",
    });

    const applyFilters = () => {
        router.get(
            route("dashboard.admin"),
            {
                action: localFilters.action || undefined,
                status: localFilters.status || undefined,
                user_id: localFilters.user_id || undefined,
                date_from: localFilters.date_from || undefined,
                date_to: localFilters.date_to || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        setLocalFilters({
            action: "",
            status: "",
            user_id: "",
            date_from: "",
            date_to: "",
        });
        router.get(route("dashboard.admin"), {}, { preserveState: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (localFilters.action) params.append("action", localFilters.action);
        if (localFilters.status) params.append("status", localFilters.status);
        if (localFilters.date_from)
            params.append("date_from", localFilters.date_from);
        if (localFilters.date_to)
            params.append("date_to", localFilters.date_to);

        window.location.href =
            route("dashboard.export-logs") + "?" + params.toString();
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getUserColor = (name: string) => {
        const colors = [
            "bg-indigo-500",
            "bg-cyan-600",
            "bg-slate-600",
            "bg-orange-600",
            "bg-teal-600",
            "bg-purple-600",
            "bg-pink-600",
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Headline */}
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Super Admin Dashboard
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    System health overview and administrative actions.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Users */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-full">
                                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                +8%
                            </span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Total Users
                        </h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                {stats?.totalUsers ?? 0}
                            </span>
                            <span className="text-slate-500 text-xs">
                                registered accounts
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Roles */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                <Shield className="h-6 w-6" />
                            </div>
                            <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-500/10 dark:text-slate-400 px-2 py-1 rounded-full">
                                <Minus className="h-3.5 w-3.5 mr-1" />
                                0%
                            </span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Active Roles
                        </h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                {stats?.activeRoles ?? 0}
                            </span>
                            <span className="text-slate-500 text-xs">
                                permission sets
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Activity */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Activity className="h-6 w-6" />
                            </div>
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-full">
                                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                                +5%
                            </span>
                        </div>
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            Avg Activity
                        </h3>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                {stats?.avgActivity ?? 0}
                            </span>
                            <span className="text-slate-500 text-xs">
                                actions / day
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Log Table */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        System Activity Log
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-sm"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardHeader>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="p-4 border-b bg-slate-50 dark:bg-slate-800/50">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Select
                                value={localFilters.action}
                                onValueChange={(v) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        action: v,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">
                                        All Actions
                                    </SelectItem>
                                    {filterOptions?.actions?.map((action) => (
                                        <SelectItem key={action} value={action}>
                                            {action}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={localFilters.status}
                                onValueChange={(v) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        status: v,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Status</SelectItem>
                                    <SelectItem value="success">
                                        Success
                                    </SelectItem>
                                    <SelectItem value="warning">
                                        Warning
                                    </SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                type="date"
                                value={localFilters.date_from}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        date_from: e.target.value,
                                    })
                                }
                                placeholder="From Date"
                            />

                            <Input
                                type="date"
                                value={localFilters.date_to}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        date_to: e.target.value,
                                    })
                                }
                                placeholder="To Date"
                            />

                            <div className="flex gap-2">
                                <Button onClick={applyFilters} size="sm">
                                    Apply
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearFilters}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4 pl-6 w-48">Timestamp</th>
                                    <th className="p-4 w-48">User</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4 w-48">Target</th>
                                    <th className="p-4 w-32 text-right pr-6">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                                {activityLogs?.data?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            No activity logs found.
                                        </td>
                                    </tr>
                                ) : (
                                    activityLogs?.data?.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <td className="p-4 pl-6 font-mono text-slate-500 dark:text-slate-400">
                                                {formatDate(log.created_at)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`size-6 rounded-full ${getUserColor(log.user?.name || "System")} flex items-center justify-center text-[10px] font-bold text-white`}
                                                    >
                                                        {(
                                                            log.user?.name ||
                                                            "SY"
                                                        )
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                    <span className="text-slate-900 dark:text-white font-medium">
                                                        {log.user?.name ||
                                                            "System"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-slate-700 dark:text-slate-300">
                                                {log.action}
                                                {log.target_name &&
                                                    ` "${log.target_name}"`}
                                            </td>
                                            <td className="p-4 text-slate-500 dark:text-slate-400">
                                                {log.target_type || "-"}
                                            </td>
                                            <td className="p-4 text-right pr-6">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        log.status === "success"
                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                            : log.status ===
                                                                "warning"
                                                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                                              : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                                    }`}
                                                >
                                                    {log.status ===
                                                    "success" ? (
                                                        <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                                                    ) : (
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                    )}
                                                    {log.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        log.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t flex items-center justify-between text-xs text-slate-500">
                        <span>
                            Showing {activityLogs?.data?.length || 0} of{" "}
                            {activityLogs?.total || 0} logs
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        activityLogs?.links?.find((l) =>
                                            l.label.includes("Previous"),
                                        )?.url || null,
                                    )
                                }
                                disabled={activityLogs?.current_page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        activityLogs?.links?.find((l) =>
                                            l.label.includes("Next"),
                                        )?.url || null,
                                    )
                                }
                                disabled={
                                    activityLogs?.current_page >=
                                    activityLogs?.last_page
                                }
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
