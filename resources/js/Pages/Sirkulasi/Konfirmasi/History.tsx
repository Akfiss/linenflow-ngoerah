import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Badge } from "@/Components/ui/badge";
import {
    History,
    Search,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    Eye,
    CheckCircle,
    Clock,
    Package,
    ArrowLeft,
    Calendar,
    User,
    Building2,
    FileText,
} from "lucide-react";
import { Link } from "@inertiajs/react";

// Types
interface Room {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
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

interface PaginatedTransactions {
    data: Transaction[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    transactions: PaginatedTransactions;
    filters: {
        status: string;
        date_from: string | null;
        date_to: string | null;
    };
}

export default function ConfirmationHistory({ transactions, filters }: Props) {
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || "all",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });

    const applyFilters = (
        overrides: Record<string, string | undefined> = {},
    ) => {
        router.get(
            route("confirmation.history"),
            {
                status:
                    overrides.status !== undefined
                        ? overrides.status
                        : localFilters.status,
                date_from:
                    overrides.date_from !== undefined
                        ? overrides.date_from
                        : localFilters.date_from || undefined,
                date_to:
                    overrides.date_to !== undefined
                        ? overrides.date_to
                        : localFilters.date_to || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearFilters = () => {
        setLocalFilters({
            status: "all",
            date_from: "",
            date_to: "",
        });
        router.get(route("confirmation.history"), {}, { preserveState: true });
    };

    const goToPage = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

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
        if (status === "confirmed") {
            return (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 hover:bg-emerald-200">
                    <CheckCircle className="h-3 w-3" />
                    Dikonfirmasi
                </Badge>
            );
        }
        return (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 hover:bg-amber-200">
                <Clock className="h-3 w-3" />
                Pending
            </Badge>
        );
    };

    const getTotalQty = (details: TransactionDetail[]) => {
        return details?.reduce((sum, d) => sum + d.qty, 0) || 0;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Konfirmasi" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <Link href={route("confirmation.index")}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="-ml-2"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                <History className="h-6 w-6 text-primary" />
                                Riwayat Konfirmasi
                            </h2>
                        </div>
                        <p className="text-slate-500 text-sm pl-10">
                            Riwayat penerimaan linen yang telah diproses.
                        </p>
                    </div>
                </div>

                {/* Filter Panel */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Select
                            value={localFilters.status}
                            onValueChange={(v) => {
                                setLocalFilters({ ...localFilters, status: v });
                                applyFilters({ status: v });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="confirmed">
                                    Dikonfirmasi
                                </SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Calendar className="h-4 w-4" />
                            </span>
                            <Input
                                type="date"
                                value={localFilters.date_from}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        date_from: e.target.value,
                                    })
                                }
                                className="pl-9"
                                placeholder="Dari Tanggal"
                            />
                        </div>

                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <Calendar className="h-4 w-4" />
                            </span>
                            <Input
                                type="date"
                                value={localFilters.date_to}
                                onChange={(e) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        date_to: e.target.value,
                                    })
                                }
                                className="pl-9"
                                placeholder="Sampai Tanggal"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => applyFilters()}
                                className="flex-1"
                            >
                                Terapkan
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={clearFilters}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="p-4 pl-6">Kode</th>
                                    <th className="p-4">Waktu Dikirim</th>
                                    <th className="p-4">Pengirim</th>
                                    <th className="p-4">Jumlah Item</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Waktu Dikonfirmasi</th>
                                    <th className="p-4 pr-6 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-200">
                                {transactions?.data?.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="p-8 text-center text-slate-500"
                                        >
                                            Tidak ada riwayat ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions?.data?.map((trx) => (
                                        <tr
                                            key={trx.id}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="p-4 pl-6 font-mono text-slate-600 font-medium">
                                                {trx.trx_code}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {formatDateTime(trx.created_at)}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {trx.user?.name || "-"}
                                            </td>
                                            <td className="p-4">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono"
                                                >
                                                    {getTotalQty(trx.details)}{" "}
                                                    pcs
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(trx.status)}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {trx.confirmed_at
                                                    ? formatDateTime(
                                                          trx.confirmed_at,
                                                      )
                                                    : "-"}
                                            </td>
                                            <td className="p-4 pr-6 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        setSelectedTransaction(
                                                            trx,
                                                        )
                                                    }
                                                    className="gap-1 hover:bg-slate-100"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Detail
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t flex items-center justify-between text-xs text-slate-500">
                        <span>
                            Showing {transactions?.data?.length || 0} of{" "}
                            {transactions?.total || 0} transaksi
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        transactions?.links?.find((l) =>
                                            l.label.includes("Previous"),
                                        )?.url || null,
                                    )
                                }
                                disabled={transactions?.current_page <= 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <span className="flex items-center px-2">
                                Page {transactions?.current_page} of{" "}
                                {transactions?.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    goToPage(
                                        transactions?.links?.find((l) =>
                                            l.label.includes("Next"),
                                        )?.url || null,
                                    )
                                }
                                disabled={
                                    transactions?.current_page >=
                                    transactions?.last_page
                                }
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog
                open={!!selectedTransaction}
                onOpenChange={() => setSelectedTransaction(null)}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Detail Penerimaan
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTransaction?.trx_code} (Ref:{" "}
                            {selectedTransaction?.id})
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTransaction && (
                        <div className="space-y-4">
                            {/* Transaction Info - Concise */}
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                                        Status
                                    </p>
                                    <div className="mt-1">
                                        {getStatusBadge(
                                            selectedTransaction.status,
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                                        Total Item
                                    </p>
                                    <p className="font-bold text-slate-800 mt-1">
                                        {getTotalQty(
                                            selectedTransaction.details,
                                        )}{" "}
                                        pcs
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                                        Waktu Dikirim
                                    </p>
                                    <p className="font-medium text-slate-700 mt-1">
                                        {formatDateTime(
                                            selectedTransaction.created_at,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                                        Waktu Dikonfirmasi
                                    </p>
                                    <p className="font-medium text-slate-700 mt-1">
                                        {selectedTransaction.confirmed_at
                                            ? formatDateTime(
                                                  selectedTransaction.confirmed_at,
                                              )
                                            : "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
                                <span className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    Pengirim:{" "}
                                    <span className="font-medium text-slate-700">
                                        {selectedTransaction.user?.name || "-"}
                                    </span>
                                </span>
                                <span className="mx-1">•</span>
                                <span className="flex items-center gap-1">
                                    <Building2 className="h-3 w-3" />
                                    Ruangan:{" "}
                                    <span className="font-medium text-slate-700">
                                        {selectedTransaction.room?.name || "-"}
                                    </span>
                                </span>
                            </div>

                            {/* Items Table */}
                            <div>
                                <p className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-500" />
                                    Daftar Item
                                </p>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="p-2 pl-3 text-left text-xs text-slate-500 font-medium">
                                                    Barang
                                                </th>
                                                <th className="p-2 pr-3 text-right text-xs text-slate-500 font-medium w-20">
                                                    Qty
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedTransaction.details?.map(
                                                (detail) => (
                                                    <tr key={detail.id}>
                                                        <td className="p-2 pl-3">
                                                            <div className="font-medium text-slate-700">
                                                                {
                                                                    detail.linen
                                                                        ?.name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-slate-400 font-mono">
                                                                {
                                                                    detail.linen
                                                                        ?.sku_code
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="p-2 pr-3 text-right font-bold text-slate-800">
                                                            {detail.qty}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                        <tfoot className="bg-slate-50 border-t">
                                            <tr>
                                                <td className="p-2 pl-3 text-xs font-bold text-slate-600 text-right">
                                                    Total
                                                </td>
                                                <td className="p-2 pr-3 text-right font-bold text-slate-800">
                                                    {getTotalQty(
                                                        selectedTransaction.details,
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Notes Display */}
                            {(selectedTransaction.notes ||
                                selectedTransaction.confirmation_notes) && (
                                <div className="space-y-3 pt-2">
                                    {selectedTransaction.notes && (
                                        <div className="text-sm">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">
                                                Catatan Pengiriman:
                                            </span>
                                            <p className="bg-blue-50 text-blue-800 p-2 rounded border border-blue-100">
                                                {selectedTransaction.notes}
                                            </p>
                                        </div>
                                    )}
                                    {selectedTransaction.confirmation_notes && (
                                        <div className="text-sm">
                                            <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">
                                                Catatan Konfirmasi:
                                            </span>
                                            <p className="bg-emerald-50 text-emerald-800 p-2 rounded border border-emerald-100">
                                                {
                                                    selectedTransaction.confirmation_notes
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
