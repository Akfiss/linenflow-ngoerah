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
    FileText,
    Search,
    Download,
    ChevronLeft,
    ChevronRight,
    ArrowRightLeft,
    Filter,
    X,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Eye,
    CheckCircle,
    Clock,
    Package,
} from "lucide-react";

interface User {
    id: number;
    name: string;
}

interface Room {
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
    linen: Linen;
    qty: number;
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
    rooms: Room[];
    users: User[];
    types: Record<string, string>;
    filters: {
        type: string | null;
        room: string | null;
        user: string | null;
        date_from: string | null;
        date_to: string | null;
        search: string | null;
        sort: string;
        direction: string;
    };
}

export default function LogTransaksi({
    transactions,
    rooms,
    users,
    types,
    filters,
}: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [localFilters, setLocalFilters] = useState({
        type: filters?.type || "",
        room: filters?.room || "",
        user: filters?.user || "",
        date_from: filters?.date_from || "",
        date_to: filters?.date_to || "",
        search: filters?.search || "",
    });

    const applyFilters = (
        overrides: Record<string, string | undefined> = {},
    ) => {
        router.get(
            route("laporan.transaksi"),
            {
                type:
                    overrides.type !== undefined
                        ? overrides.type
                        : localFilters.type || undefined,
                room:
                    overrides.room !== undefined
                        ? overrides.room
                        : localFilters.room || undefined,
                user:
                    overrides.user !== undefined
                        ? overrides.user
                        : localFilters.user || undefined,
                date_from:
                    overrides.date_from !== undefined
                        ? overrides.date_from
                        : localFilters.date_from || undefined,
                date_to:
                    overrides.date_to !== undefined
                        ? overrides.date_to
                        : localFilters.date_to || undefined,
                search:
                    overrides.search !== undefined
                        ? overrides.search
                        : localFilters.search || undefined,
                sort: overrides.sort ?? filters?.sort,
                direction: overrides.direction ?? filters?.direction,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSort = (field: string) => {
        const newDirection =
            filters?.sort === field && filters?.direction === "asc"
                ? "desc"
                : "asc";
        applyFilters({ sort: field, direction: newDirection });
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (filters?.sort !== field) {
            return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
        }
        return filters?.direction === "asc" ? (
            <ArrowUp className="h-3 w-3 ml-1" />
        ) : (
            <ArrowDown className="h-3 w-3 ml-1" />
        );
    };

    const clearFilters = () => {
        setLocalFilters({
            type: "",
            room: "",
            user: "",
            date_from: "",
            date_to: "",
            search: "",
        });
        router.get(route("laporan.transaksi"), {}, { preserveState: true });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (localFilters.type) params.append("type", localFilters.type);
        if (localFilters.date_from)
            params.append("date_from", localFilters.date_from);
        if (localFilters.date_to)
            params.append("date_to", localFilters.date_to);

        window.location.href =
            route("laporan.transaksi.export") + "?" + params.toString();
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

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            OUT_DISTRIBUTION: "bg-blue-100 text-blue-700 border-blue-200",
            IN_COLLECTION: "bg-amber-100 text-amber-700 border-amber-200",
            WASH_START: "bg-cyan-100 text-cyan-700 border-cyan-200",
            WASH_FINISH: "bg-emerald-100 text-emerald-700 border-emerald-200",
            ADJUSTMENT: "bg-purple-100 text-purple-700 border-purple-200",
            DISPOSAL: "bg-red-100 text-red-700 border-red-200",
        };
        return colors[type] || "bg-slate-100 text-slate-700 border-slate-200";
    };

    const getStatusBadge = (status: string, type: string) => {
        // Only OUT_DISTRIBUTION needs confirmation
        if (type !== "OUT_DISTRIBUTION") {
            return (
                <Badge
                    variant="secondary"
                    className="bg-slate-100 text-slate-600"
                >
                    -
                </Badge>
            );
        }

        if (status === "confirmed") {
            return (
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Dikonfirmasi
                </Badge>
            );
        }
        return (
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
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
            <Head title="Log Transaksi" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <FileText className="h-6 w-6 text-primary" />
                            Log Transaksi
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Riwayat lengkap semua transaksi linen.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            value={localFilters.search}
                            onChange={(e) =>
                                setLocalFilters({
                                    ...localFilters,
                                    search: e.target.value,
                                })
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && applyFilters()
                            }
                            className="pl-10"
                            placeholder="Cari kode transaksi..."
                        />
                    </div>
                    <Button onClick={() => applyFilters()}>Cari</Button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <Select
                                value={localFilters.type}
                                onValueChange={(v) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        type: v,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tipe Transaksi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua Tipe</SelectItem>
                                    {Object.entries(types || {}).map(
                                        ([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>

                            <Select
                                value={localFilters.room}
                                onValueChange={(v) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        room: v,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Ruangan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">
                                        Semua Ruangan
                                    </SelectItem>
                                    {rooms?.map((room) => (
                                        <SelectItem
                                            key={room.id}
                                            value={String(room.id)}
                                        >
                                            {room.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={localFilters.user}
                                onValueChange={(v) =>
                                    setLocalFilters({
                                        ...localFilters,
                                        user: v,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="User" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Semua User</SelectItem>
                                    {users?.map((user) => (
                                        <SelectItem
                                            key={user.id}
                                            value={String(user.id)}
                                        >
                                            {user.name}
                                        </SelectItem>
                                    ))}
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
                                placeholder="Dari Tanggal"
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
                                placeholder="Sampai Tanggal"
                            />

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
                )}

                {/* Transactions Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th
                                        className="p-4 pl-6 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("trx_code")}
                                    >
                                        <div className="flex items-center">
                                            Kode
                                            <SortIcon field="trx_code" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("created_at")}
                                    >
                                        <div className="flex items-center">
                                            Waktu
                                            <SortIcon field="created_at" />
                                        </div>
                                    </th>
                                    <th
                                        className="p-4 cursor-pointer hover:bg-slate-100"
                                        onClick={() => handleSort("type")}
                                    >
                                        <div className="flex items-center">
                                            Tipe
                                            <SortIcon field="type" />
                                        </div>
                                    </th>
                                    <th className="p-4">Ruangan</th>
                                    <th className="p-4">User</th>
                                    <th className="p-4">Status</th>
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
                                            Tidak ada transaksi ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    transactions?.data?.map((trx) => (
                                        <tr
                                            key={trx.id}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="p-4 pl-6 font-mono text-slate-600">
                                                {trx.trx_code}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {formatDateTime(trx.created_at)}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeBadge(trx.type)}`}
                                                >
                                                    <ArrowRightLeft className="h-3 w-3" />
                                                    {types?.[trx.type] ||
                                                        trx.type}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {trx.room?.name || "-"}
                                            </td>
                                            <td className="p-4 text-slate-600">
                                                {trx.user?.name || "-"}
                                            </td>
                                            <td className="p-4">
                                                {getStatusBadge(
                                                    trx.status,
                                                    trx.type,
                                                )}
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
                                                    className="gap-1"
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
                            Detail Transaksi
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTransaction?.trx_code}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTransaction && (
                        <div className="space-y-4">
                            {/* Transaction Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Waktu</p>
                                    <p className="font-medium">
                                        {formatDateTime(
                                            selectedTransaction.created_at,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Tipe</p>
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${getTypeBadge(selectedTransaction.type)}`}
                                    >
                                        {types?.[selectedTransaction.type] ||
                                            selectedTransaction.type}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-slate-500">Ruangan</p>
                                    <p className="font-medium">
                                        {selectedTransaction.room?.name || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Operator</p>
                                    <p className="font-medium">
                                        {selectedTransaction.user?.name || "-"}
                                    </p>
                                </div>
                                {selectedTransaction.type ===
                                    "OUT_DISTRIBUTION" && (
                                    <>
                                        <div>
                                            <p className="text-slate-500">
                                                Status
                                            </p>
                                            {getStatusBadge(
                                                selectedTransaction.status,
                                                selectedTransaction.type,
                                            )}
                                        </div>
                                        {selectedTransaction.confirmed_at && (
                                            <div>
                                                <p className="text-slate-500">
                                                    Dikonfirmasi
                                                </p>
                                                <p className="font-medium text-xs">
                                                    {formatDateTime(
                                                        selectedTransaction.confirmed_at,
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Items */}
                            <div>
                                <p className="text-sm text-slate-500 mb-2">
                                    Item (
                                    {getTotalQty(selectedTransaction.details)}{" "}
                                    pcs)
                                </p>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="p-2 pl-3 text-left text-xs text-slate-500 font-medium">
                                                    SKU
                                                </th>
                                                <th className="p-2 text-left text-xs text-slate-500 font-medium">
                                                    Nama
                                                </th>
                                                <th className="p-2 pr-3 text-right text-xs text-slate-500 font-medium">
                                                    Qty
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedTransaction.details?.map(
                                                (detail) => (
                                                    <tr key={detail.id}>
                                                        <td className="p-2 pl-3 font-mono text-xs text-slate-600">
                                                            {detail.linen
                                                                ?.sku_code ||
                                                                "-"}
                                                        </td>
                                                        <td className="p-2 text-slate-700">
                                                            {detail.linen?.name}
                                                        </td>
                                                        <td className="p-2 pr-3 text-right font-bold">
                                                            {detail.qty}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                            {(!selectedTransaction.details ||
                                                selectedTransaction.details
                                                    .length === 0) && (
                                                <tr>
                                                    <td
                                                        colSpan={3}
                                                        className="p-4 text-center text-slate-400"
                                                    >
                                                        Tidak ada item
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedTransaction.notes && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">
                                        Catatan
                                    </p>
                                    <p className="text-sm bg-slate-50 p-3 rounded-lg">
                                        {selectedTransaction.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
