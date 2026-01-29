import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
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
    Calendar,
    User,
    Building2,
    FileText,
    Package,
    CheckCircle,
    Clock,
    XCircle,
} from "lucide-react";

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

interface Room {
    id: number;
    name: string;
}

interface Transaction {
    id: number;
    trx_code: string;
    trx_date: string;
    created_at: string;
    type: string;
    status: string;
    notes: string | null;
    confirmed_at: string | null;
    confirmation_notes: string | null;
    user: User | null;
    room: Room | null;
    details: TransactionDetail[];
    confirmed_by_user?: User | null;
}

interface TransactionDetailModalProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TransactionDetailModal({
    transaction,
    open,
    onOpenChange,
}: TransactionDetailModalProps) {
    if (!transaction) return null;

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "confirmed":
                return (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Dikonfirmasi
                    </Badge>
                );
            case "pending":
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <Clock className="w-3 h-3 mr-1" />
                        Menunggu
                    </Badge>
                );
            case "cancelled":
                return (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <XCircle className="w-3 h-3 mr-1" />
                        Dibatalkan
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case "OUT_DISTRIBUTION":
                return (
                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Distribusi Keluar
                    </Badge>
                );
            case "IN_COLLECTION":
                return (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Penerimaan Kotor
                    </Badge>
                );
            default:
                return <Badge>{type}</Badge>;
        }
    };

    const getTotalQty = () => {
        return transaction.details.reduce((sum, d) => sum + d.qty, 0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Detail Transaksi
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Transaction Info */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-500">Kode:</span>
                                <span className="font-semibold">
                                    {transaction.trx_code}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-500">Tanggal:</span>
                                <span className="font-medium">
                                    {formatDateTime(transaction.trx_date)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-500">
                                    Operator:
                                </span>
                                <span className="font-medium">
                                    {transaction.user?.name ?? "-"}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Building2 className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-500">Ruangan:</span>
                                <span className="font-medium">
                                    {transaction.room?.name ?? "-"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500">Tipe:</span>
                                {getTypeBadge(transaction.type)}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500">Status:</span>
                                {getStatusBadge(transaction.status)}
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Info */}
                    {transaction.confirmed_at && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-700 dark:text-green-400">
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                Dikonfirmasi pada{" "}
                                {formatDateTime(transaction.confirmed_at)}
                                {transaction.confirmed_by_user && (
                                    <>
                                        {" "}
                                        oleh{" "}
                                        {transaction.confirmed_by_user.name}
                                    </>
                                )}
                            </p>
                            {transaction.confirmation_notes && (
                                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                    Catatan: {transaction.confirmation_notes}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Items Table */}
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Detail Item ({transaction.details.length} jenis)
                        </h4>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800">
                                        <TableHead>No</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Nama Linen</TableHead>
                                        <TableHead className="text-right">
                                            Qty
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transaction.details.map(
                                        (detail, index) => (
                                            <TableRow key={detail.id}>
                                                <TableCell className="font-medium">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="text-slate-500 font-mono text-sm">
                                                    {detail.linen?.sku_code ??
                                                        "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {detail.linen?.name ?? "-"}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    {detail.qty}
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                    <TableRow className="bg-slate-50 dark:bg-slate-800 font-bold">
                                        <TableCell colSpan={3}>Total</TableCell>
                                        <TableCell className="text-right">
                                            {getTotalQty()} pcs
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Notes */}
                    {transaction.notes && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                <FileText className="w-4 h-4 inline mr-1" />
                                Catatan: {transaction.notes}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
