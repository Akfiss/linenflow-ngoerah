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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    ClipboardList,
    Save,
    Package,
    History,
    AlertCircle,
    CheckCircle,
    Loader2,
} from "lucide-react";
import { Link } from "@inertiajs/react";

// Types
interface StockItem {
    id: number;
    linen_id: number;
    linen_name: string;
    sku_code: string;
    category: string;
    system_clean: number;
    system_dirty: number;
    system_washing: number;
    system_total: number;
}

interface TransactionDetail {
    id: number;
    linen_id: number;
    qty: number;
    linen: {
        id: number;
        name: string;
    };
}

interface OpnameTransaction {
    id: number;
    trx_code: string;
    trx_date: string;
    notes: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    details: TransactionDetail[];
}

interface PhysicalCount {
    linen_id: number;
    physical_clean: number;
    physical_dirty: number;
    physical_washing: number;
}

interface Props {
    stocks: StockItem[];
    opnameHistory: OpnameTransaction[];
}

export default function OpnameIndex({ stocks, opnameHistory }: Props) {
    const [physicalCounts, setPhysicalCounts] = useState<{
        [key: number]: PhysicalCount;
    }>(() => {
        const initial: { [key: number]: PhysicalCount } = {};
        stocks.forEach((stock) => {
            initial[stock.linen_id] = {
                linen_id: stock.linen_id,
                physical_clean: stock.system_clean,
                physical_dirty: stock.system_dirty,
                physical_washing: stock.system_washing,
            };
        });
        return initial;
    });
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateCount = (
        linenId: number,
        field: keyof PhysicalCount,
        value: number,
    ) => {
        setPhysicalCounts((prev) => ({
            ...prev,
            [linenId]: {
                ...prev[linenId],
                [field]: value,
            },
        }));
    };

    const getDifference = (stock: StockItem): number => {
        const counts = physicalCounts[stock.linen_id];
        if (!counts) return 0;

        const physicalTotal =
            counts.physical_clean +
            counts.physical_dirty +
            counts.physical_washing;
        return physicalTotal - stock.system_total;
    };

    const hasChanges = (): boolean => {
        return stocks.some((stock) => {
            const counts = physicalCounts[stock.linen_id];
            if (!counts) return false;

            return (
                counts.physical_clean !== stock.system_clean ||
                counts.physical_dirty !== stock.system_dirty ||
                counts.physical_washing !== stock.system_washing
            );
        });
    };

    const handleSubmit = () => {
        const adjustments = stocks
            .filter((stock) => {
                const counts = physicalCounts[stock.linen_id];
                return (
                    counts &&
                    (counts.physical_clean !== stock.system_clean ||
                        counts.physical_dirty !== stock.system_dirty ||
                        counts.physical_washing !== stock.system_washing)
                );
            })
            .map((stock) => ({
                ...physicalCounts[stock.linen_id],
            }));

        if (adjustments.length === 0) {
            return;
        }

        setIsSubmitting(true);

        router.post(
            route("inventaris.opname.store"),
            {
                adjustments,
                notes,
            },
            {
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

    const changedCount = stocks.filter((stock) => {
        const counts = physicalCounts[stock.linen_id];
        return (
            counts &&
            (counts.physical_clean !== stock.system_clean ||
                counts.physical_dirty !== stock.system_dirty ||
                counts.physical_washing !== stock.system_washing)
        );
    }).length;

    return (
        <AuthenticatedLayout>
            <Head title="Stock Opname" />

            <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <ClipboardList className="h-6 w-6 text-primary" />
                            Stock Opname
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Input jumlah fisik linen dan bandingkan dengan data
                            sistem.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {changedCount > 0 && (
                            <Badge
                                variant="secondary"
                                className="text-sm py-1 px-3"
                            >
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {changedCount} item berubah
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Stock Opname Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Input Stok Fisik
                        </CardTitle>
                        <CardDescription>
                            Masukkan jumlah linen berdasarkan penghitungan fisik
                            aktual
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Nama Linen</TableHead>
                                        <TableHead
                                            className="text-center"
                                            colSpan={3}
                                        >
                                            Stok Sistem
                                        </TableHead>
                                        <TableHead
                                            className="text-center"
                                            colSpan={3}
                                        >
                                            Stok Fisik (Input)
                                        </TableHead>
                                        <TableHead className="text-center">
                                            Selisih
                                        </TableHead>
                                    </TableRow>
                                    <TableRow className="bg-slate-50">
                                        <TableHead></TableHead>
                                        <TableHead></TableHead>
                                        <TableHead className="text-center text-xs">
                                            Bersih
                                        </TableHead>
                                        <TableHead className="text-center text-xs">
                                            Kotor
                                        </TableHead>
                                        <TableHead className="text-center text-xs">
                                            Cuci
                                        </TableHead>
                                        <TableHead className="text-center text-xs">
                                            Bersih
                                        </TableHead>
                                        <TableHead className="text-center text-xs">
                                            Kotor
                                        </TableHead>
                                        <TableHead className="text-center text-xs">
                                            Cuci
                                        </TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stocks.map((stock) => {
                                        const diff = getDifference(stock);
                                        const counts =
                                            physicalCounts[stock.linen_id];
                                        const hasChange =
                                            counts &&
                                            (counts.physical_clean !==
                                                stock.system_clean ||
                                                counts.physical_dirty !==
                                                    stock.system_dirty ||
                                                counts.physical_washing !==
                                                    stock.system_washing);

                                        return (
                                            <TableRow
                                                key={stock.id}
                                                className={
                                                    hasChange
                                                        ? "bg-amber-50"
                                                        : ""
                                                }
                                            >
                                                <TableCell className="font-mono text-sm">
                                                    {stock.sku_code}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {stock.linen_name}
                                                </TableCell>
                                                <TableCell className="text-center text-emerald-600">
                                                    {stock.system_clean}
                                                </TableCell>
                                                <TableCell className="text-center text-amber-600">
                                                    {stock.system_dirty}
                                                </TableCell>
                                                <TableCell className="text-center text-blue-600">
                                                    {stock.system_washing}
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            counts?.physical_clean ??
                                                            0
                                                        }
                                                        onChange={(e) =>
                                                            updateCount(
                                                                stock.linen_id,
                                                                "physical_clean",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-16 h-8 text-center"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            counts?.physical_dirty ??
                                                            0
                                                        }
                                                        onChange={(e) =>
                                                            updateCount(
                                                                stock.linen_id,
                                                                "physical_dirty",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-16 h-8 text-center"
                                                    />
                                                </TableCell>
                                                <TableCell className="p-1">
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        value={
                                                            counts?.physical_washing ??
                                                            0
                                                        }
                                                        onChange={(e) =>
                                                            updateCount(
                                                                stock.linen_id,
                                                                "physical_washing",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                        className="w-16 h-8 text-center"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {diff !== 0 ? (
                                                        <Badge
                                                            variant={
                                                                diff > 0
                                                                    ? "secondary"
                                                                    : "destructive"
                                                            }
                                                        >
                                                            {diff > 0
                                                                ? `+${diff}`
                                                                : diff}
                                                        </Badge>
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Notes & Submit */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="text-sm text-slate-600 mb-1 block">
                                    Catatan Opname
                                </label>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Tambahkan catatan jika diperlukan..."
                                    rows={2}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!hasChanges() || isSubmitting}
                                    className="gap-2"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    Simpan Opname
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent History */}
                {opnameHistory.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <History className="h-4 w-4" />
                                Opname Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Catatan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {opnameHistory.map((trx) => (
                                        <TableRow key={trx.id}>
                                            <TableCell className="font-mono text-sm">
                                                {trx.trx_code}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(trx.created_at)}
                                            </TableCell>
                                            <TableCell>
                                                {trx.user.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {trx.details.length} item
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-500 truncate max-w-xs">
                                                {trx.notes || "-"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
