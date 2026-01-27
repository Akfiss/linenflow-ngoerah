import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
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
    Trash2,
    Plus,
    History,
    Package,
    AlertTriangle,
    Send,
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

interface DisposalItem {
    linen_id: string;
    qty: number;
    reason: string;
    maxQty: number;
}

interface Props {
    stocks: CentralStock[];
}

const DISPOSAL_REASONS = [
    "Sobek/Rusak",
    "Bernoda Permanen",
    "Menipis/Aus",
    "Hilang",
    "Tidak Layak Pakai",
    "Lainnya",
];

export default function AfkirIndex({ stocks }: Props) {
    const [items, setItems] = useState<DisposalItem[]>([
        { linen_id: "", qty: 1, reason: "", maxQty: 0 },
    ]);
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addItem = () => {
        setItems([...items, { linen_id: "", qty: 1, reason: "", maxQty: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (
        index: number,
        field: keyof DisposalItem,
        value: string | number,
    ) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Update maxQty when linen is selected
        if (field === "linen_id" && value) {
            const stock = stocks.find((s) => String(s.linen_id) === value);
            newItems[index].maxQty = stock?.clean_qty || 0;
        }

        setItems(newItems);
    };

    const getLinenName = (linenId: string): string => {
        const stock = stocks.find((s) => String(s.linen_id) === linenId);
        return stock?.linen.name || "";
    };

    const handleSubmit = () => {
        const validItems = items.filter(
            (item) => item.linen_id && item.qty > 0 && item.reason,
        );

        if (validItems.length === 0) return;

        setIsSubmitting(true);

        router.post(
            route("disposal.store"),
            {
                items: validItems.map((item) => ({
                    linen_id: Number(item.linen_id),
                    qty: item.qty,
                    reason: item.reason,
                })),
                notes,
            },
            {
                onSuccess: () => {
                    setItems([{ linen_id: "", qty: 1, reason: "", maxQty: 0 }]);
                    setNotes("");
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const getTotalItems = (): number => {
        return items.reduce((acc, item) => acc + (item.qty || 0), 0);
    };

    const isValid = items.some(
        (item) => item.linen_id && item.qty > 0 && item.reason,
    );

    return (
        <AuthenticatedLayout>
            <Head title="Afkir Barang" />

            <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <Trash2 className="h-6 w-6 text-red-500" />
                            Afkir Barang
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Catat linen yang dimusnahkan karena rusak atau tidak
                            layak pakai.
                        </p>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800">Perhatian</p>
                        <p className="text-sm text-amber-700">
                            Linen yang diafkir akan mengurangi stok bersih
                            secara permanen. Pastikan data yang diinput sudah
                            benar.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Item Input */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Daftar Linen Afkir
                                </CardTitle>
                                <CardDescription>
                                    Pilih linen yang akan diafkir beserta
                                    alasannya
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-slate-200 rounded-lg space-y-3"
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-500 mb-1 block">
                                                    Pilih Linen
                                                </label>
                                                <Select
                                                    value={item.linen_id}
                                                    onValueChange={(v) =>
                                                        updateItem(
                                                            index,
                                                            "linen_id",
                                                            v,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih linen..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {stocks.map((stock) => (
                                                            <SelectItem
                                                                key={
                                                                    stock.linen_id
                                                                }
                                                                value={String(
                                                                    stock.linen_id,
                                                                )}
                                                            >
                                                                {
                                                                    stock.linen
                                                                        .sku_code
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    stock.linen
                                                                        .name
                                                                }
                                                                (
                                                                {
                                                                    stock.clean_qty
                                                                }{" "}
                                                                tersedia)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-xs text-slate-500 mb-1 block">
                                                    Jumlah
                                                </label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={item.maxQty}
                                                    value={item.qty}
                                                    onChange={(e) =>
                                                        updateItem(
                                                            index,
                                                            "qty",
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            <div className="pt-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    disabled={
                                                        items.length === 1
                                                    }
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">
                                                Alasan Afkir
                                            </label>
                                            <Select
                                                value={item.reason}
                                                onValueChange={(v) =>
                                                    updateItem(
                                                        index,
                                                        "reason",
                                                        v,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih alasan..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DISPOSAL_REASONS.map(
                                                        (reason) => (
                                                            <SelectItem
                                                                key={reason}
                                                                value={reason}
                                                            >
                                                                {reason}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    variant="outline"
                                    onClick={addItem}
                                    className="w-full gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Item
                                </Button>
                            </CardContent>
                        </Card>

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
                                    rows={3}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Section */}
                    <div className="space-y-6">
                        <Card className="sticky top-4">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">
                                    Ringkasan Afkir
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {items
                                        .filter((i) => i.linen_id)
                                        .map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between text-sm py-1 border-b last:border-0"
                                            >
                                                <span className="text-slate-600 truncate max-w-[60%]">
                                                    {getLinenName(
                                                        item.linen_id,
                                                    )}
                                                </span>
                                                <span className="font-medium text-red-600">
                                                    -{item.qty}
                                                </span>
                                            </div>
                                        ))}
                                </div>

                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-slate-500">
                                        Total Afkir
                                    </span>
                                    <span className="font-bold text-lg text-red-600">
                                        {getTotalItems()} pcs
                                    </span>
                                </div>

                                <hr />

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !isValid}
                                    variant="destructive"
                                    className="w-full gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {isSubmitting
                                        ? "Menyimpan..."
                                        : "Simpan Afkir"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Available Stock */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base">
                                    Stok Bersih Tersedia
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {stocks.map((stock) => (
                                        <div
                                            key={stock.id}
                                            className="flex justify-between text-sm py-1 border-b last:border-0"
                                        >
                                            <span className="text-slate-600 truncate">
                                                {stock.linen.name}
                                            </span>
                                            <Badge variant="secondary">
                                                {stock.clean_qty}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
