import {
    LayoutDashboard,
    ArrowRightLeft,
    Send,
    PackageOpen,
    CheckCircle,
    Factory,
    WashingMachine,
    Trash2,
    Package,
    Warehouse,
    Building2,
    ClipboardList,
    FileText,
    AlertTriangle,
    BarChart3,
    Database,
    BookOpen,
    MapPin,
    Tags,
    Settings,
    Users,
    Shield,
    LucideIcon,
    History,
} from "lucide-react";

export interface MenuItem {
    title: string;
    href: string;
    icon: LucideIcon;
    permission: string;
}

export interface MenuGroup {
    group: string;
    icon?: LucideIcon;
    items: MenuItem[];
}

export const menuConfig: MenuGroup[] = [
    {
        group: "main",
        items: [
            {
                title: "Dashboard",
                href: "/admin/dashboard",
                icon: LayoutDashboard,
                permission: "view_admin_dashboard",
            },
            {
                title: "Dashboard",
                href: "/manager/dashboard",
                icon: LayoutDashboard,
                permission: "view_manager_dashboard",
            },
            {
                title: "Dashboard",
                href: "/operator/dashboard",
                icon: LayoutDashboard,
                permission: "view_operator_dashboard",
            },
            {
                title: "Dashboard",
                href: "/head-nurse/dashboard",
                icon: LayoutDashboard,
                permission: "view_nurse_dashboard",
            },
        ],
    },
    {
        group: "Sirkulasi Linen",
        icon: ArrowRightLeft,
        items: [
            {
                title: "Distribusi Bersih",
                href: "/sirkulasi/distribusi",
                icon: Send,
                permission: "create_trx_distribution",
            },
            {
                title: "Penerimaan Kotor",
                href: "/sirkulasi/penerimaan",
                icon: PackageOpen,
                permission: "create_trx_collection",
            },
            {
                title: "Konfirmasi Terima",
                href: "/sirkulasi/konfirmasi",
                icon: CheckCircle,
                permission: "confirm_receipt",
            },
        ],
    },
    {
        group: "Produksi",
        icon: Factory,
        items: [
            {
                title: "Proses Cuci",
                href: "/produksi/cuci",
                icon: WashingMachine,
                permission: "create_transaction_process",
            },
            {
                title: "Afkir Barang",
                href: "/produksi/afkir",
                icon: Trash2,
                permission: "create_adjustment",
            },
        ],
    },
    {
        group: "Inventaris",
        icon: Package,
        items: [
            {
                title: "Stok Gudang",
                href: "/inventaris/gudang",
                icon: Warehouse,
                permission: "view_own_dashboard",
            },
            {
                title: "Stok Ruangan",
                href: "/inventaris/ruangan",
                icon: Building2,
                permission: "view_all_stats",
            },
            {
                title: "Stock Opname",
                href: "/inventaris/opname",
                icon: ClipboardList,
                permission: "create_adjustment",
            },
            {
                title: "Riwayat Ruangan",
                href: "/inventaris/riwayat-ruangan",
                icon: History,
                permission: "view_nurse_dashboard",
            },
        ],
    },
    {
        group: "Laporan",
        icon: FileText,
        items: [
            {
                title: "Log Transaksi",
                href: "/laporan/transaksi",
                icon: FileText,
                permission: "view_global_report",
            },
            {
                title: "Analisa Kehilangan",
                href: "/laporan/kehilangan",
                icon: AlertTriangle,
                permission: "view_financial_reports",
            },
            {
                title: "Kinerja Laundry",
                href: "/laporan/kinerja",
                icon: BarChart3,
                permission: "view_global_report",
            },
        ],
    },
    {
        group: "Data Master",
        icon: Database,
        items: [
            {
                title: "Katalog Linen",
                href: "/master/linen",
                icon: BookOpen,
                permission: "manage_master_data",
            },
            {
                title: "Data Ruangan",
                href: "/master/ruangan",
                icon: MapPin,
                permission: "manage_master_data",
            },
            {
                title: "Kategori",
                href: "/master/kategori",
                icon: Tags,
                permission: "manage_master_data",
            },
        ],
    },
    {
        group: "System",
        icon: Settings,
        items: [
            {
                title: "Manajemen User",
                href: "/system/users",
                icon: Users,
                permission: "manage_users",
            },
            {
                title: "Roles & Akses",
                href: "/system/roles",
                icon: Shield,
                permission: "assign_roles",
            },
        ],
    },
];

// Helper to get filtered menu for a user's permissions
export function getFilteredMenu(permissions: string[]): MenuGroup[] {
    return menuConfig
        .map((group) => ({
            ...group,
            items: group.items.filter((item) =>
                permissions.includes(item.permission)
            ),
        }))
        .filter((group) => group.items.length > 0);
}
