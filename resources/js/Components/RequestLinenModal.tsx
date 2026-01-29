import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import { Plus, Minus, Package, Search, Loader2, Send, X } from "lucide-react";
import { router } from "@inertiajs/react";

interface Linen {
    id: number;
    name: string;
    sku_code: string;
    category_name: string;
}

interface SelectedItem {
    linen_id: number;
    name: string;
    sku_code: string;
    qty: number;
}

interface RequestLinenModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RequestLinenModal({
    open,
    onOpenChange,
}: RequestLinenModalProps) {
    const [linens, setLinens] = useState<Linen[]>([]);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [notes, setNotes] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            fetch(route("linen-request.linens"))
                .then((res) => res.json())
                .then((data) => {
                    setLinens(data);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        } else {
            // Reset state when modal closes
            setSelectedItems([]);
            setSearchTerm("");
            setNotes("");
        }
    }, [open]);

    const filteredLinens = linens.filter(
        (linen) =>
            linen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            linen.sku_code.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const addItem = (linen: Linen) => {
        const exists = selectedItems.find((s) => s.linen_id === linen.id);
        if (!exists) {
            setSelectedItems([
                ...selectedItems,
                {
                    linen_id: linen.id,
                    name: linen.name,
                    sku_code: linen.sku_code,
                    qty: 1,
                },
            ]);
        }
    };

    const removeItem = (linenId: number) => {
        setSelectedItems(selectedItems.filter((s) => s.linen_id !== linenId));
    };

    const updateQty = (linenId: number, qty: number) => {
        if (qty < 1) return;
        setSelectedItems(
            selectedItems.map((s) =>
                s.linen_id === linenId ? { ...s, qty } : s,
            ),
        );
    };

    const handleSubmit = () => {
        if (selectedItems.length === 0) return;

        setIsSubmitting(true);

        router.post(
            route("linen-request.store"),
            {
                items: selectedItems.map((item) => ({
                    linen_id: item.linen_id,
                    qty: item.qty,
                })),
                notes,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    const getTotalQty = () => {
        return selectedItems.reduce((sum, s) => sum + s.qty, 0);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-primary" />
                        Request Linen ke Supplier
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {/* Search and Linen List */}
                    <div className="space-y-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Cari linen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="border rounded-lg max-h-40 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-800">
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Nama Linen</TableHead>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLinens
                                            .slice(0, 10)
                                            .map((linen) => (
                                                <TableRow key={linen.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {linen.sku_code}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {linen.name}
                                                    </TableCell>
                                                    <TableCell className="text-slate-500">
                                                        {linen.category_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                addItem(linen)
                                                            }
                                                            disabled={selectedItems.some(
                                                                (s) =>
                                                                    s.linen_id ===
                                                                    linen.id,
                                                            )}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    {/* Selected Items */}
                    {selectedItems.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Item Dipilih ({selectedItems.length})
                            </h4>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 dark:bg-slate-800">
                                            <TableHead>Linen</TableHead>
                                            <TableHead className="text-center w-32">
                                                Qty
                                            </TableHead>
                                            <TableHead className="w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedItems.map((item) => (
                                            <TableRow key={item.linen_id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">
                                                            {item.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-mono">
                                                            {item.sku_code}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                updateQty(
                                                                    item.linen_id,
                                                                    item.qty -
                                                                        1,
                                                                )
                                                            }
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            value={item.qty}
                                                            onChange={(e) =>
                                                                updateQty(
                                                                    item.linen_id,
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="w-16 h-7 text-center"
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-7 w-7"
                                                            onClick={() =>
                                                                updateQty(
                                                                    item.linen_id,
                                                                    item.qty +
                                                                        1,
                                                                )
                                                            }
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-red-500 hover:text-red-700"
                                                        onClick={() =>
                                                            removeItem(
                                                                item.linen_id,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-slate-50 dark:bg-slate-800">
                                            <TableCell className="font-bold">
                                                Total
                                            </TableCell>
                                            <TableCell className="text-center font-bold">
                                                {getTotalQty()} pcs
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Catatan (Opsional)
                        </label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Tambahkan catatan untuk supplier..."
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedItems.length === 0 || isSubmitting}
                        className="gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                        Kirim Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
