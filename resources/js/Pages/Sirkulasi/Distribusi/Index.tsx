import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { DataTable } from "@/Components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { MoreHorizontal, Plus, ArrowRight, Truck } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

interface DistributionTrx {
    id: string;
    target_room: string;
    status: "pending" | "shipping" | "received" | "rejected";
    items_count: number;
    driver?: string;
    created_at: string;
}

const data: DistributionTrx[] = [
    {
        id: "TRX-001",
        target_room: "ICU Central",
        status: "shipping",
        items_count: 50,
        driver: "Budi (Driver)",
        created_at: "2024-10-24 08:30",
    },
    {
        id: "TRX-002",
        target_room: "Rawat Inap A (Lt 2)",
        status: "received",
        items_count: 120,
        driver: "Agus",
        created_at: "2024-10-23 14:00",
    },
    {
        id: "TRX-003",
        target_room: "IGD",
        status: "pending",
        items_count: 85,
        driver: "-",
        created_at: "2024-10-24 09:15",
    },
    {
        id: "TRX-004",
        target_room: "Kamar Operasi 1",
        status: "received",
        items_count: 200,
        driver: "Budi (Driver)",
        created_at: "2024-10-23 09:00",
    },
];

export const columns: ColumnDef<DistributionTrx>[] = [
    {
        accessorKey: "id",
        header: "No. TRX",
        cell: ({ row }) => (
            <span className="font-mono font-bold">{row.getValue("id")}</span>
        ),
    },
    {
        accessorKey: "target_room",
        header: "Ruangan Tujuan",
        cell: ({ row }) => (
            <span className="font-semibold">{row.getValue("target_room")}</span>
        ),
    },
    {
        accessorKey: "items_count",
        header: "Total Item",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const color =
                status === "received"
                    ? "bg-emerald-100 text-emerald-700"
                    : status === "shipping"
                    ? "bg-blue-100 text-blue-700 animate-pulse"
                    : status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700";
            return (
                <Badge
                    variant="outline"
                    className={`${color} border-transparent capitalize`}
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "driver",
        header: "Petugas Distribusi",
    },
    {
        accessorKey: "created_at",
        header: "Waktu Input",
        cell: ({ row }) => (
            <span className="text-slate-500 text-xs">
                {row.getValue("created_at")}
            </span>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            Lihat Detail Request
                        </DropdownMenuItem>
                        <DropdownMenuItem>Cetak Surat Jalan</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function DistributionIndex() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                        Distribusi Linen Bersih
                    </h2>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" /> Buat Pengiriman Baru
                    </Button>
                </div>
            }
        >
            <Head title="Distribusi Linen" />

            <div className="py-6">
                <DataTable
                    columns={columns}
                    data={data}
                    filterColumn="target_room"
                    searchPlaceholder="Cari ruangan..."
                />
            </div>
        </AuthenticatedLayout>
    );
}
