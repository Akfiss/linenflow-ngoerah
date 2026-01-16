import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { DataTable } from "@/Components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { MoreHorizontal, Plus, Package } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

interface LinenItem {
    id: number;
    code: string;
    name: string;
    category: string;
    total_stock: number;
    par_stock: number;
    lifecycle: number; // washes
}

const data: LinenItem[] = [
    {
        id: 1,
        code: "L-001",
        name: "Sprei Dewasa Putih",
        category: "Bedding",
        total_stock: 450,
        par_stock: 500,
        lifecycle: 45,
    },
    {
        id: 2,
        code: "L-002",
        name: "Sarung Bantal Dewasa",
        category: "Bedding",
        total_stock: 600,
        par_stock: 600,
        lifecycle: 42,
    },
    {
        id: 3,
        code: "L-003",
        name: "Selimut Wool Teal",
        category: "Blanket",
        total_stock: 200,
        par_stock: 250,
        lifecycle: 120,
    },
    {
        id: 4,
        code: "L-004",
        name: "Baju Pasien (Pria)",
        category: "Apparel",
        total_stock: 300,
        par_stock: 300,
        lifecycle: 80,
    },
    {
        id: 5,
        code: "L-005",
        name: "Baju Pasien (Wanita)",
        category: "Apparel",
        total_stock: 310,
        par_stock: 300,
        lifecycle: 85,
    },
];

export const columns: ColumnDef<LinenItem>[] = [
    {
        accessorKey: "code",
        header: "Kode",
        cell: ({ row }) => (
            <span className="font-mono text-xs font-bold text-slate-500">
                {row.getValue("code")}
            </span>
        ),
    },
    {
        accessorKey: "name",
        header: "Nama Item",
        cell: ({ row }) => (
            <div className="flex items-center gap-2 font-medium">
                <Package className="h-4 w-4 text-primary" />
                {row.getValue("name")}
            </div>
        ),
    },
    {
        accessorKey: "category",
        header: "Kategori",
        cell: ({ row }) => (
            <Badge variant="secondary">{row.getValue("category")}</Badge>
        ),
    },
    {
        accessorKey: "total_stock",
        header: "Total Stok",
        cell: ({ row }) => {
            const stock = row.getValue("total_stock") as number;
            const par = row.original.par_stock;
            const ratio = (stock / par) * 100;
            let color = ratio < 80 ? "text-red-600" : "text-emerald-600";
            return <span className={`font-bold ${color}`}>{stock}</span>;
        },
    },
    {
        accessorKey: "par_stock",
        header: "Par Stock",
    },
    {
        accessorKey: "lifecycle",
        header: "Lifecycle (Cuci)",
        cell: ({ row }) => (
            <span className="text-slate-500">{row.getValue("lifecycle")}x</span>
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
                        <DropdownMenuItem>Detail & History</DropdownMenuItem>
                        <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                        <DropdownMenuItem>Edit Master</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function LinenIndex() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                        Katalog Linen (Master)
                    </h2>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" /> Tambah Item Baru
                    </Button>
                </div>
            }
        >
            <Head title="Katalog Linen" />

            <div className="py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col">
                        <span className="text-sm text-slate-500">
                            Total Varian Item
                        </span>
                        <span className="text-2xl font-bold">45 Jenis</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col">
                        <span className="text-sm text-slate-500">
                            Estimasi Aset
                        </span>
                        <span className="text-2xl font-bold">12,450 pcs</span>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col">
                        <span className="text-sm text-slate-500">
                            Item Perlu Re-Stock
                        </span>
                        <span className="text-2xl font-bold text-red-600">
                            5 Item
                        </span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={data}
                    filterColumn="name"
                    searchPlaceholder="Cari nama linen..."
                />
            </div>
        </AuthenticatedLayout>
    );
}
