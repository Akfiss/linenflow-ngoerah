import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, Link } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    History,
    Search,
    Package,
    ArrowDown,
    ArrowUp,
    Clock,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Eye,
} from "lucide-react";

// Types
interface Room {
    id: number;
    name: string;
    type: string;
}

interface Linen {
    id: number;
    name: string;
    sku_code: string;
}

interface TransactionDetail {
    id: number;
    linen_id: number;
    qty: number;
    linen: Linen;
}

interface User {
    id: number;
    name: string;
}

interface Transaction {
    id: number;
    trx_code: string;
    type: string;
    trx_date: string;
    status: string;
    notes: string | null;
    created_at: string;
    user: User;
    details: TransactionDetail[];
}

interface CurrentStock {
    id: number;
    linen_id: number;
    current_qty: number;
    par_stock: number;
    linen: Linen;
}

interface PaginatedData {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Summary {
    totalReceived: number;
    totalReturned: number;
    currentStockTotal: number;
    pendingConfirmation: number;
}

interface Filters {
    date_from: string;
    date_to: string;
    type: string | null;
}

interface Props {
    room: Room;
    transactions: PaginatedData;
    currentStock: CurrentStock[];
    summary: Summary;
    filters: Filters;
}

export default function RiwayatIndex({
    room,
    transactions,
    currentStock,
    summary,
    filters,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [selectedType, setSelectedType] = useState(filters.type || "");

    const handleFilter = () => {
        router.get(
            route("nurse.riwayat"),
            {
                date_from: dateFrom,
                date_to: dateTo,
                type: selectedType || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const getTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            OUT_DISTRIBUTION: "Terima Bersih",
            IN_COLLECTION: "Kirim Kotor",
        };
        return labels[type] || type;
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "OUT_DISTRIBUTION":
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <ArrowDown className="h-3 w-3 mr-1" />
                        Terima
                    </Badge>
                );
            case "IN_COLLECTION":
                return (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Kirim
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{type}</Badge>;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700"
                    >
                        Dikonfirmasi
                    </Badge>
                );
            case "pending":
                return (
                    <Badge
                        variant="secondary"
                        className="bg-amber-50 text-amber-700"
                    >
                        Menunggu
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getTotalQty = (details: TransactionDetail[]) => {
        return details.reduce((sum, d) => sum + d.qty, 0);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Ruangan" />

            <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <History className="h-6 w-6 text-primary" />
                        Riwayat Ruangan
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Riwayat transaksi linen untuk{" "}
                        {room?.name || "ruangan Anda"}
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <ArrowDown className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Diterima
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {summary.totalReceived}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <ArrowUp className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Dikirim
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {summary.totalReturned}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Stok Saat Ini
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {summary.currentStockTotal}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Menunggu Konfirmasi
                                    </p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {summary.pendingConfirmation}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="text-sm text-slate-600 mb-1 block">
                                    Dari Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-40"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600 mb-1 block">
                                    Sampai Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600 mb-1 block">
                                    Tipe Transaksi
                                </label>
                                <Select
                                    value={selectedType || "all"}
                                    onValueChange={(v) =>
                                        setSelectedType(v === "all" ? "" : v)
                                    }
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Semua tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua tipe
                                        </SelectItem>
                                        <SelectItem value="OUT_DISTRIBUTION">
                                            Terima Bersih
                                        </SelectItem>
                                        <SelectItem value="IN_COLLECTION">
                                            Kirim Kotor
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleFilter} className="gap-2">
                                <Search className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Riwayat Transaksi
                        </CardTitle>
                        <CardDescription>
                            Menampilkan {transactions.total} transaksi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>Tidak ada transaksi pada periode ini</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Tipe</TableHead>
                                            <TableHead className="text-right">
                                                Qty
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Operator</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((trx) => (
                                            <TableRow key={trx.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {trx.trx_code}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(trx.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    {getTypeBadge(trx.type)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {getTotalQty(trx.details)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(trx.status)}
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    {trx.user?.name || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={route(
                                                            "nurse.riwayat.show",
                                                            trx.id,
                                                        )}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {transactions.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <p className="text-sm text-slate-500">
                                            Halaman {transactions.current_page}{" "}
                                            dari {transactions.last_page}
                                        </p>
                                        <div className="flex gap-1">
                                            {transactions.links.map(
                                                (link, i) => (
                                                    <Button
                                                        key={i}
                                                        variant={
                                                            link.active
                                                                ? "default"
                                                                : "outline"
                                                        }
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() =>
                                                            link.url &&
                                                            router.get(link.url)
                                                        }
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Current Stock */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Stok Linen Saat Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentStock.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                Tidak ada stok linen di ruangan ini
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Nama Linen</TableHead>
                                        <TableHead className="text-right">
                                            Stok
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Par Level
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentStock.map((stock) => {
                                        const isLow =
                                            stock.current_qty < stock.par_stock;
                                        return (
                                            <TableRow key={stock.id}>
                                                <TableCell className="font-mono text-sm">
                                                    {stock.linen?.sku_code}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {stock.linen?.name}
                                                </TableCell>
                                                <TableCell className="text-right font-bold">
                                                    {stock.current_qty}
                                                </TableCell>
                                                <TableCell className="text-right text-slate-500">
                                                    {stock.par_stock}
                                                </TableCell>
                                                <TableCell>
                                                    {isLow ? (
                                                        <Badge
                                                            variant="destructive"
                                                            className="gap-1"
                                                        >
                                                            <AlertCircle className="h-3 w-3" />
                                                            Kurang
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-emerald-50 text-emerald-700"
                                                        >
                                                            Cukup
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
