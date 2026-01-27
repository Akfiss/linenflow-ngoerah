import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
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
    ArrowLeft,
    Package,
    Calendar,
    User,
    FileText,
    ArrowDown,
    ArrowUp,
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
    room: Room;
    details: TransactionDetail[];
}

interface Props {
    transaction: Transaction;
}

export default function RiwayatShow({ transaction }: Props) {
    const getTypeLabel = (type: string) => {
        const labels: { [key: string]: string } = {
            OUT_DISTRIBUTION: "Terima Linen Bersih",
            IN_COLLECTION: "Kirim Linen Kotor",
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
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const totalQty = transaction.details.reduce((sum, d) => sum + d.qty, 0);

    return (
        <AuthenticatedLayout>
            <Head title={`Detail Transaksi ${transaction.trx_code}`} />

            <div className="flex flex-col gap-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route("nurse.riwayat")}>
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {transaction.trx_code}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Detail transaksi linen
                        </p>
                    </div>
                </div>

                {/* Transaction Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Informasi Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Tipe
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {getTypeBadge(transaction.type)}
                                        <span className="text-slate-700">
                                            {getTypeLabel(transaction.type)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Tanggal
                                    </p>
                                    <p className="text-slate-700">
                                        {formatDate(transaction.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Operator
                                    </p>
                                    <p className="text-slate-700">
                                        {transaction.user?.name || "-"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Status
                                    </p>
                                    {getStatusBadge(transaction.status)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                Ringkasan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6">
                                <p className="text-sm text-slate-500 mb-2">
                                    Total Item
                                </p>
                                <p className="text-5xl font-bold text-primary">
                                    {totalQty}
                                </p>
                                <p className="text-sm text-slate-500 mt-2">
                                    {transaction.details.length} jenis linen
                                </p>
                            </div>
                            {transaction.notes && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-500 mb-1">
                                        Catatan:
                                    </p>
                                    <p className="text-slate-700">
                                        {transaction.notes}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Detail Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Detail Linen
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Nama Linen</TableHead>
                                    <TableHead className="text-right">
                                        Jumlah
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transaction.details.map((detail, index) => (
                                    <TableRow key={detail.id}>
                                        <TableCell className="text-slate-500">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {detail.linen?.sku_code}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {detail.linen?.name}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {detail.qty}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-slate-50">
                                    <TableCell
                                        colSpan={3}
                                        className="font-bold text-right"
                                    >
                                        Total
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-lg">
                                        {totalQty}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
