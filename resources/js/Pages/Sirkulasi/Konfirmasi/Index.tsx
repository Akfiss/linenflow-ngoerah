import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    CheckCircle,
    Clock,
    Package,
    Building2,
    User,
    Calendar,
    History,
    Loader2,
} from "lucide-react";
import { Link } from "@inertiajs/react";

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

interface UserInfo {
    id: number;
    name: string;
}

interface Transaction {
    id: number;
    trx_code: string;
    type: string;
    status: string;
    trx_date: string;
    notes: string | null;
    created_at: string;
    confirmed_at: string | null;
    room: Room;
    user: UserInfo;
    details: TransactionDetail[];
}

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    pendingTransactions: PaginatedData<Transaction>;
    confirmedTransactions: Transaction[];
    userRoom: Room | null;
}

export default function KonfirmasiIndex({
    pendingTransactions,
    confirmedTransactions,
    userRoom,
}: Props) {
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [confirmedItems, setConfirmedItems] = useState<{
        [key: number]: number;
    }>({});
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openConfirmDialog = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        // Initialize with expected quantities
        const items: { [key: number]: number } = {};
        transaction.details.forEach((detail) => {
            items[detail.linen_id] = detail.qty;
        });
        setConfirmedItems(items);
        setNotes("");
    };

    const handleConfirm = () => {
        if (!selectedTransaction) return;

        setIsSubmitting(true);

        const items = Object.entries(confirmedItems).map(([linenId, qty]) => ({
            linen_id: Number(linenId),
            qty_received: qty,
        }));

        router.post(
            route("confirmation.confirm", selectedTransaction.id),
            {
                confirmed_items: items,
                notes,
            },
            {
                onSuccess: () => {
                    setSelectedTransaction(null);
                    setConfirmedItems({});
                    setNotes("");
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
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

    return (
        <AuthenticatedLayout>
            <Head title="Konfirmasi Terima" />

            <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <CheckCircle className="h-6 w-6 text-primary" />
                            Konfirmasi Penerimaan Linen
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {userRoom
                                ? `Konfirmasi penerimaan linen untuk ${userRoom.name}`
                                : "Konfirmasi penerimaan linen bersih dari laundry"}
                        </p>
                    </div>
                    <Link href={route("confirmation.history")}>
                        <Button variant="outline" className="gap-2">
                            <History className="h-4 w-4" />
                            Riwayat
                        </Button>
                    </Link>
                </div>

                {/* Pending Distributions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    Menunggu Konfirmasi
                                </CardTitle>
                                <CardDescription>
                                    Distribusi linen yang perlu dikonfirmasi
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="text-lg px-3">
                                {pendingTransactions.total}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {pendingTransactions.data.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>
                                    Tidak ada distribusi yang menunggu
                                    konfirmasi
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingTransactions.data.map((trx) => (
                                    <div
                                        key={trx.id}
                                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                                <Package className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {trx.trx_code}
                                                </p>
                                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {trx.room.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {trx.user.name}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(
                                                            trx.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant="secondary">
                                                {trx.details.reduce(
                                                    (acc, d) => acc + d.qty,
                                                    0,
                                                )}{" "}
                                                pcs
                                            </Badge>
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    openConfirmDialog(trx)
                                                }
                                            >
                                                Konfirmasi
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Confirmations */}
                {confirmedTransactions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                Baru Dikonfirmasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode Transaksi</TableHead>
                                        <TableHead>Ruangan</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Dikonfirmasi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {confirmedTransactions.map((trx) => (
                                        <TableRow key={trx.id}>
                                            <TableCell className="font-medium">
                                                {trx.trx_code}
                                            </TableCell>
                                            <TableCell>
                                                {trx.room.name}
                                            </TableCell>
                                            <TableCell>
                                                {trx.details.reduce(
                                                    (acc, d) => acc + d.qty,
                                                    0,
                                                )}{" "}
                                                pcs
                                            </TableCell>
                                            <TableCell>
                                                {trx.confirmed_at &&
                                                    formatDate(
                                                        trx.confirmed_at,
                                                    )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Confirmation Dialog */}
            <Dialog
                open={!!selectedTransaction}
                onOpenChange={() => setSelectedTransaction(null)}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Penerimaan</DialogTitle>
                        <DialogDescription>
                            Verifikasi jumlah linen yang diterima dari transaksi{" "}
                            <strong>{selectedTransaction?.trx_code}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedTransaction?.details.map((detail) => (
                                <div
                                    key={detail.id}
                                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-sm">
                                            {detail.linen.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {detail.linen.sku_code} • Dikirim:{" "}
                                            {detail.qty} pcs
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">
                                            Diterima:
                                        </span>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={detail.qty}
                                            value={
                                                confirmedItems[
                                                    detail.linen_id
                                                ] || 0
                                            }
                                            onChange={(e) =>
                                                setConfirmedItems({
                                                    ...confirmedItems,
                                                    [detail.linen_id]: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                            className="w-20 h-8"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="text-sm text-slate-600 mb-1 block">
                                Catatan (opsional)
                            </label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Tambahkan catatan jika ada selisih atau masalah..."
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setSelectedTransaction(null)}
                        >
                            Batal
                        </Button>
                        <Button onClick={handleConfirm} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Konfirmasi Terima
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
