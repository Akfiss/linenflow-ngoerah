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
    AlertTriangle,
    Search,
    Building2,
    ArrowDown,
    ArrowUp,
    Package,
    TrendingDown,
} from "lucide-react";

// Types
interface Room {
    id: number;
    name: string;
    type: string;
}

interface AnalysisItem {
    room: Room;
    distributed: number;
    returned: number;
    current_stock: number;
    discrepancy: number;
    has_anomaly: boolean;
}

interface LinenBreakdownItem {
    linen_id: number;
    linen_name: string;
    sku_code: string;
    distributed: number;
    returned: number;
    room_stock: number;
    discrepancy: number;
}

interface Summary {
    totalDistributed: number;
    totalReturned: number;
    totalDiscrepancy: number;
    roomsWithAnomalies: number;
}

interface Filters {
    date_from: string;
    date_to: string;
    room: string | null;
}

interface Props {
    analysisData: AnalysisItem[];
    linenBreakdown: LinenBreakdownItem[];
    summary: Summary;
    rooms: Room[];
    filters: Filters;
}

export default function KehilanganIndex({
    analysisData,
    linenBreakdown,
    summary,
    rooms,
    filters,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo, setDateTo] = useState(filters.date_to);
    const [selectedRoom, setSelectedRoom] = useState(filters.room || "");

    const handleFilter = () => {
        router.get(
            route("laporan.kehilangan"),
            {
                date_from: dateFrom,
                date_to: dateTo,
                room: selectedRoom || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleRoomClick = (roomId: number) => {
        router.get(route("laporan.kehilangan"), {
            date_from: dateFrom,
            date_to: dateTo,
            room: roomId,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Analisa Kehilangan" />

            <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                        Analisa Kehilangan
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Analisa selisih antara linen yang dikirim vs
                        dikembalikan per ruangan.
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="text-sm text-slate-600 mb-1 block">
                                    Dari Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-40"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600 mb-1 block">
                                    Sampai Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-600 mb-1 block">
                                    Ruangan
                                </label>
                                <Select
                                    value={selectedRoom || "all"}
                                    onValueChange={(v) =>
                                        setSelectedRoom(v === "all" ? "" : v)
                                    }
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Semua ruangan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua ruangan
                                        </SelectItem>
                                        {rooms.map((room) => (
                                            <SelectItem
                                                key={room.id}
                                                value={String(room.id)}
                                            >
                                                {room.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleFilter} className="gap-2">
                                <Search className="h-4 w-4" />
                                Filter
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <ArrowUp className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Dikirim
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600">
                                        {summary.totalDistributed}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <ArrowDown className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Kembali
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {summary.totalReturned}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <TrendingDown className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Selisih
                                    </p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {summary.totalDiscrepancy}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Ruangan Anomali
                                    </p>
                                    <p className="text-2xl font-bold text-amber-600">
                                        {summary.roomsWithAnomalies}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Analysis Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Analisa per Ruangan
                        </CardTitle>
                        <CardDescription>
                            Klik ruangan untuk melihat detail per jenis linen
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {analysisData.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                                <p>Tidak ada data transaksi pada periode ini</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ruangan</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead className="text-right">
                                            Dikirim
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Kembali
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Stok Ruangan
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Selisih
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {analysisData.map((item) => (
                                        <TableRow
                                            key={item.room.id}
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() =>
                                                handleRoomClick(item.room.id)
                                            }
                                        >
                                            <TableCell className="font-medium">
                                                {item.room.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {item.room.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-600">
                                                +{item.distributed}
                                            </TableCell>
                                            <TableCell className="text-right text-blue-600">
                                                -{item.returned}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.current_stock}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                <span
                                                    className={
                                                        item.discrepancy > 0
                                                            ? "text-red-600"
                                                            : "text-slate-600"
                                                    }
                                                >
                                                    {item.discrepancy}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {item.has_anomaly ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="gap-1"
                                                    >
                                                        <AlertTriangle className="h-3 w-3" />
                                                        Anomali
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">
                                                        Normal
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Linen Breakdown (when room is selected) */}
                {linenBreakdown.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Detail per Jenis Linen
                            </CardTitle>
                            <CardDescription>
                                Breakdown selisih per jenis linen untuk ruangan
                                yang dipilih
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Nama Linen</TableHead>
                                        <TableHead className="text-right">
                                            Dikirim
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Kembali
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Stok
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Selisih
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {linenBreakdown.map((item) => (
                                        <TableRow key={item.linen_id}>
                                            <TableCell className="font-mono text-sm">
                                                {item.sku_code}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.linen_name}
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-600">
                                                +{item.distributed}
                                            </TableCell>
                                            <TableCell className="text-right text-blue-600">
                                                -{item.returned}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.room_stock}
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                <span
                                                    className={
                                                        item.discrepancy > 0
                                                            ? "text-red-600"
                                                            : "text-slate-600"
                                                    }
                                                >
                                                    {item.discrepancy}
                                                </span>
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
