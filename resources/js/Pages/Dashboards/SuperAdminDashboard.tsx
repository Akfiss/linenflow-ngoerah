import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
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
} from "lucide-react";

export default function SuperAdminDashboard() {
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
                                25
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
                                4
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
                                150
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
                        <Button variant="outline" size="sm" className="text-sm">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                        <Button variant="outline" size="sm" className="text-sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardHeader>
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
                                {[
                                    {
                                        time: "Oct 24, 10:42 AM",
                                        user: "Admin_01",
                                        action: "Created new role 'Auditor'",
                                        target: "System / Roles",
                                        status: "Success",
                                        color: "bg-indigo-500",
                                    },
                                    {
                                        time: "Oct 24, 10:30 AM",
                                        user: "User_A",
                                        action: "Logged into system dashboard",
                                        target: "Auth / Login",
                                        status: "Success",
                                        color: "bg-cyan-600",
                                    },
                                    {
                                        time: "Oct 24, 09:15 AM",
                                        user: "System",
                                        action: "Automated daily backup completed",
                                        target: "Database / Backup",
                                        status: "Success",
                                        color: "bg-slate-600",
                                    },
                                    {
                                        time: "Oct 23, 11:55 PM",
                                        user: "User_B2",
                                        action: "Failed login attempt (3x)",
                                        target: "Auth / Login",
                                        status: "Warning",
                                        color: "bg-orange-600",
                                    },
                                    {
                                        time: "Oct 23, 04:20 PM",
                                        user: "Admin_01",
                                        action: "Updated inventory threshold for 'Linen Bed Sheet'",
                                        target: "Inventaris / Gudang",
                                        status: "Success",
                                        color: "bg-indigo-500",
                                    },
                                    {
                                        time: "Oct 23, 02:10 PM",
                                        user: "Staff_04",
                                        action: "Exported monthly transaction report",
                                        target: "Laporan / Log",
                                        status: "Success",
                                        color: "bg-teal-600",
                                    },
                                ].map((log, i) => (
                                    <tr
                                        key={i}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="p-4 pl-6 font-mono text-slate-500 dark:text-slate-400">
                                            {log.time}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={`size-6 rounded-full ${log.color} flex items-center justify-center text-[10px] font-bold text-white`}
                                                >
                                                    {log.user
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </div>
                                                <span className="text-slate-900 dark:text-white font-medium">
                                                    {log.user}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-700 dark:text-slate-300">
                                            {log.action}
                                        </td>
                                        <td className="p-4 text-slate-500 dark:text-slate-400">
                                            {log.target}
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    log.status === "Success"
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                        : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                                                }`}
                                            >
                                                {log.status === "Success" ? (
                                                    <span className="size-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
                                                ) : (
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                )}
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t flex items-center justify-between text-xs text-slate-500">
                        <span>Showing 6 of 128 logs</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                Previous
                            </Button>
                            <Button variant="outline" size="sm">
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
