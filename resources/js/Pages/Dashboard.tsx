import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { usePermission } from "@/hooks/usePermission";
import ManagerDashboard from "./Dashboards/ManagerDashboard";
import SuperAdminDashboard from "./Dashboards/SuperAdminDashboard";
import OperatorDashboard from "./Dashboards/OperatorDashboard";
import HeadNurseDashboard from "./Dashboards/HeadNurseDashboard";

export default function Dashboard() {
    const { hasRole } = usePermission();

    // Logic to determine which dashboard to show
    let DashboardComponent = ManagerDashboard; // Default fallback

    if (hasRole("super_admin")) {
        DashboardComponent = SuperAdminDashboard;
    } else if (hasRole("laundry_manager")) {
        DashboardComponent = ManagerDashboard;
    } else if (hasRole("laundry_operator")) {
        DashboardComponent = OperatorDashboard;
    } else if (hasRole("head_nurse")) {
        DashboardComponent = HeadNurseDashboard;
    }

    return (
        <AuthenticatedLayout
            header={
                !hasRole("laundry_operator") &&
                !hasRole("head_nurse") &&
                !hasRole("laundry_manager") && (
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                            Dashboard
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
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
                )
            }
        >
            <Head title="Dashboard" />
            <DashboardComponent />
        </AuthenticatedLayout>
    );
}
