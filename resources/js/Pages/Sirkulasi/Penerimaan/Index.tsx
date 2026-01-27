import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
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
import { Label } from "@/Components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    PackageOpen,
    Plus,
    Trash2,
    Building2,
    Package,
    Send,
    History,
} from "lucide-react";
import { Link } from "@inertiajs/react";

// Types
interface Room {
    id: number;
    name: string;
    type: string;
}

interface CentralStock {
    clean_qty: number;
    dirty_qty: number;
    washing_qty: number;
}

interface Linen {
    id: number;
    name: string;
    sku_code: string;
    central_stock?: CentralStock;
}

interface RoomStock {
    id: number;
    linen_id: number;
    current_qty: number;
    linen: Linen;
}

interface LineItem {
    linen_id: string;
    qty: number;
}

interface Props {
    rooms: Room[];
    linens: Linen[];
}

export default function PenerimaanIndex({ rooms, linens }: Props) {
    const [selectedRoom, setSelectedRoom] = useState<string>("");
    const [roomStocks, setRoomStocks] = useState<RoomStock[]>([]);
    const [items, setItems] = useState<LineItem[]>([{ linen_id: "", qty: 1 }]);
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch room stock when room is selected
    useEffect(() => {
        if (selectedRoom) {
            setIsLoading(true);
            fetch(route("collection.room.stock", selectedRoom))
                .then((res) => res.json())
                .then((data) => {
                    setRoomStocks(data.stocks || []);
                    setIsLoading(false);
                })
                .catch(() => {
                    setRoomStocks([]);
                    setIsLoading(false);
                });
        } else {
            setRoomStocks([]);
        }
    }, [selectedRoom]);

    const addItem = () => {
        setItems([...items, { linen_id: "", qty: 1 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const updateItem = (
        index: number,
        field: keyof LineItem,
        value: string | number,
    ) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const getMaxQty = (linenId: string): number => {
        const stock = roomStocks.find((s) => String(s.linen_id) === linenId);
        return stock?.current_qty || 0;
    };

    const handleSubmit = () => {
        const validItems = items.filter(
            (item) => item.linen_id && item.qty > 0,
        );

        if (!selectedRoom || validItems.length === 0) {
            return;
        }

        setIsSubmitting(true);

        router.post(
            route("collection.store"),
            {
                room_id: selectedRoom,
                items: validItems.map((item) => ({
                    linen_id: Number(item.linen_id),
                    qty: item.qty,
                })),
                notes,
            },
            {
                onSuccess: () => {
                    setItems([{ linen_id: "", qty: 1 }]);
                    setNotes("");
                    setSelectedRoom("");
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const getTotalItems = (): number => {
        return items.reduce((acc, item) => acc + (item.qty || 0), 0);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Penerimaan Kotor" />

            <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            <PackageOpen className="h-6 w-6 text-primary" />
                            Penerimaan Linen Kotor
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Catat linen kotor yang dikembalikan dari ruangan ke
                            laundry.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Room Selection */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Pilih Ruangan
                                </CardTitle>
                                <CardDescription>
                                    Pilih ruangan asal linen kotor
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={selectedRoom}
                                    onValueChange={setSelectedRoom}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih ruangan..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {rooms.map((room) => (
                                            <SelectItem
                                                key={room.id}
                                                value={String(room.id)}
                                            >
                                                {room.name} ({room.type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>

                        {/* Item Input */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Daftar Linen Kotor
                                </CardTitle>
                                <CardDescription>
                                    Tambahkan item linen yang diterima
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-3 items-start"
                                    >
                                        <div className="flex-1">
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
                                                    {linens.map((linen) => (
                                                        <SelectItem
                                                            key={linen.id}
                                                            value={String(
                                                                linen.id,
                                                            )}
                                                        >
                                                            {linen.sku_code} -{" "}
                                                            {linen.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {item.linen_id && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Stok di ruangan:{" "}
                                                    {getMaxQty(item.linen_id)}{" "}
                                                    pcs
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                type="number"
                                                min={1}
                                                max={getMaxQty(item.linen_id)}
                                                value={item.qty}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "qty",
                                                        Number(e.target.value),
                                                    )
                                                }
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
                                    Ringkasan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Ruangan
                                    </span>
                                    <span className="font-medium">
                                        {selectedRoom
                                            ? rooms.find(
                                                  (r) =>
                                                      String(r.id) ===
                                                      selectedRoom,
                                              )?.name
                                            : "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Jumlah Item
                                    </span>
                                    <span className="font-medium">
                                        {items.filter((i) => i.linen_id).length}{" "}
                                        jenis
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">
                                        Total Qty
                                    </span>
                                    <span className="font-bold text-lg">
                                        {getTotalItems()} pcs
                                    </span>
                                </div>

                                <hr />

                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        isSubmitting ||
                                        !selectedRoom ||
                                        items.filter(
                                            (i) => i.linen_id && i.qty > 0,
                                        ).length === 0
                                    }
                                    className="w-full gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {isSubmitting
                                        ? "Menyimpan..."
                                        : "Simpan Transaksi"}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Room Stock Preview */}
                        {selectedRoom && roomStocks.length > 0 && (
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">
                                        Stok di Ruangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {roomStocks.map((stock) => (
                                            <div
                                                key={stock.id}
                                                className="flex justify-between text-sm py-1 border-b last:border-0"
                                            >
                                                <span className="text-slate-600 truncate">
                                                    {stock.linen.name}
                                                </span>
                                                <span className="font-medium">
                                                    {stock.current_qty}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
