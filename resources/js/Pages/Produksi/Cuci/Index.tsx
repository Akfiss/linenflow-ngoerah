import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Checkbox } from "@/Components/ui/checkbox";
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
    WashingMachine,
    Play,
    CheckCircle,
    History,
    Package,
    Loader2,
} from "lucide-react";
import { Link } from "@inertiajs/react";

// Types
interface LinenCategory {
    id: number;
    name: string;
}

interface Linen {
    id: number;
    name: string;
    sku_code: string;
    category?: LinenCategory;
}

interface CentralStock {
    id: number;
    linen_id: number;
    clean_qty: number;
    dirty_qty: number;
    washing_qty: number;
    linen: Linen;
}

interface SelectedItem {
    linen_id: number;
    qty: number;
    maxQty: number;
    name: string;
}

interface Props {
    stocks: CentralStock[];
}

export default function ProsesCuciIndex({ stocks }: Props) {
    const [selectedDirty, setSelectedDirty] = useState<SelectedItem[]>([]);
    const [selectedWashing, setSelectedWashing] = useState<SelectedItem[]>([]);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeAction, setActiveAction] = useState<"start" | "finish" | null>(
        null,
    );

    const dirtyStocks = stocks.filter((s) => s.dirty_qty > 0);
    const washingStocks = stocks.filter((s) => s.washing_qty > 0);

    const toggleDirtyItem = (stock: CentralStock) => {
        const exists = selectedDirty.find((s) => s.linen_id === stock.linen_id);
        if (exists) {
            setSelectedDirty(
                selectedDirty.filter((s) => s.linen_id !== stock.linen_id),
            );
        } else {
            setSelectedDirty([
                ...selectedDirty,
                {
                    linen_id: stock.linen_id,
                    qty: stock.dirty_qty,
                    maxQty: stock.dirty_qty,
                    name: stock.linen.name,
                },
            ]);
        }
    };

    const toggleWashingItem = (stock: CentralStock) => {
        const exists = selectedWashing.find(
            (s) => s.linen_id === stock.linen_id,
        );
        if (exists) {
            setSelectedWashing(
                selectedWashing.filter((s) => s.linen_id !== stock.linen_id),
            );
        } else {
            setSelectedWashing([
                ...selectedWashing,
                {
                    linen_id: stock.linen_id,
                    qty: stock.washing_qty,
                    maxQty: stock.washing_qty,
                    name: stock.linen.name,
                },
            ]);
        }
    };

    const updateDirtyQty = (linenId: number, qty: number) => {
        setSelectedDirty(
            selectedDirty.map((s) =>
                s.linen_id === linenId
                    ? { ...s, qty: Math.min(qty, s.maxQty) }
                    : s,
            ),
        );
    };

    const updateWashingQty = (linenId: number, qty: number) => {
        setSelectedWashing(
            selectedWashing.map((s) =>
                s.linen_id === linenId
                    ? { ...s, qty: Math.min(qty, s.maxQty) }
                    : s,
            ),
        );
    };

    const handleStartWash = () => {
        if (selectedDirty.length === 0) return;

        setIsSubmitting(true);
        setActiveAction("start");

        router.post(
            route("washing.start"),
            {
                items: selectedDirty.map((item) => ({
                    linen_id: item.linen_id,
                    qty: item.qty,
                })),
                notes,
            },
            {
                onSuccess: () => {
                    setSelectedDirty([]);
                    setNotes("");
                },
                onFinish: () => {
                    setIsSubmitting(false);
                    setActiveAction(null);
                },
            },
        );
    };

    const handleFinishWash = () => {
        if (selectedWashing.length === 0) return;

        setIsSubmitting(true);
        setActiveAction("finish");

        router.post(
            route("washing.finish"),
            {
                items: selectedWashing.map((item) => ({
                    linen_id: item.linen_id,
                    qty: item.qty,
                })),
                notes,
            },
            {
                onSuccess: () => {
                    setSelectedWashing([]);
                    setNotes("");
                },
                onFinish: () => {
                    setIsSubmitting(false);
                    setActiveAction(null);
                },
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Proses Cuci" />

            <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <WashingMachine className="h-6 w-6 text-primary" />
                            Proses Cuci
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Kelola proses pencucian linen dari kotor ke bersih.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dirty Stock - Waiting to Wash */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Badge
                                            variant="destructive"
                                            className="h-6"
                                        >
                                            Kotor
                                        </Badge>
                                        Menunggu Cuci
                                    </CardTitle>
                                    <CardDescription>
                                        Pilih linen kotor untuk memulai proses
                                        cuci
                                    </CardDescription>
                                </div>
                                <span className="text-2xl font-bold text-red-600">
                                    {dirtyStocks.reduce(
                                        (acc, s) => acc + s.dirty_qty,
                                        0,
                                    )}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {dirtyStocks.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Package className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p>Tidak ada linen kotor</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {dirtyStocks.map((stock) => {
                                            const selected = selectedDirty.find(
                                                (s) =>
                                                    s.linen_id ===
                                                    stock.linen_id,
                                            );
                                            return (
                                                <div
                                                    key={stock.id}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                                                        selected
                                                            ? "border-primary bg-primary/5"
                                                            : "border-slate-200"
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={!!selected}
                                                        onCheckedChange={() =>
                                                            toggleDirtyItem(
                                                                stock,
                                                            )
                                                        }
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {stock.linen.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {
                                                                stock.linen
                                                                    .sku_code
                                                            }
                                                        </p>
                                                    </div>
                                                    {selected ? (
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={
                                                                stock.dirty_qty
                                                            }
                                                            value={selected.qty}
                                                            onChange={(e) =>
                                                                updateDirtyQty(
                                                                    stock.linen_id,
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="w-20 h-8"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-red-600">
                                                            {stock.dirty_qty}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        onClick={handleStartWash}
                                        disabled={
                                            isSubmitting ||
                                            selectedDirty.length === 0
                                        }
                                        className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                                    >
                                        {isSubmitting &&
                                        activeAction === "start" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                        Mulai Cuci (
                                        {selectedDirty.reduce(
                                            (acc, s) => acc + s.qty,
                                            0,
                                        )}{" "}
                                        pcs)
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Washing Stock - In Process */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Badge className="h-6 bg-amber-500">
                                            Cuci
                                        </Badge>
                                        Sedang Dicuci
                                    </CardTitle>
                                    <CardDescription>
                                        Pilih linen yang sudah selesai dicuci
                                    </CardDescription>
                                </div>
                                <span className="text-2xl font-bold text-amber-600">
                                    {washingStocks.reduce(
                                        (acc, s) => acc + s.washing_qty,
                                        0,
                                    )}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {washingStocks.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <WashingMachine className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p>Tidak ada linen sedang dicuci</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {washingStocks.map((stock) => {
                                            const selected =
                                                selectedWashing.find(
                                                    (s) =>
                                                        s.linen_id ===
                                                        stock.linen_id,
                                                );
                                            return (
                                                <div
                                                    key={stock.id}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                                                        selected
                                                            ? "border-emerald-500 bg-emerald-50"
                                                            : "border-slate-200"
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={!!selected}
                                                        onCheckedChange={() =>
                                                            toggleWashingItem(
                                                                stock,
                                                            )
                                                        }
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">
                                                            {stock.linen.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {
                                                                stock.linen
                                                                    .sku_code
                                                            }
                                                        </p>
                                                    </div>
                                                    {selected ? (
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            max={
                                                                stock.washing_qty
                                                            }
                                                            value={selected.qty}
                                                            onChange={(e) =>
                                                                updateWashingQty(
                                                                    stock.linen_id,
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="w-20 h-8"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-amber-600">
                                                            {stock.washing_qty}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        onClick={handleFinishWash}
                                        disabled={
                                            isSubmitting ||
                                            selectedWashing.length === 0
                                        }
                                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {isSubmitting &&
                                        activeAction === "finish" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4" />
                                        )}
                                        Selesai Cuci (
                                        {selectedWashing.reduce(
                                            (acc, s) => acc + s.qty,
                                            0,
                                        )}{" "}
                                        pcs)
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Notes */}
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">
                            Catatan (Opsional)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tambahkan catatan jika diperlukan..."
                            rows={2}
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
