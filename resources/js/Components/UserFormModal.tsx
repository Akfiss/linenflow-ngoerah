import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface Role {
    id: number;
    name: string;
}

interface Room {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    room_id?: number | null;
    roles: Role[];
}

interface UserFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: User | null;
    roles: Role[];
    rooms: Room[];
    mode: "create" | "edit";
}

export function UserFormModal({
    open,
    onOpenChange,
    user,
    roles,
    rooms,
    mode,
}: UserFormModalProps) {
    const isEdit = mode === "edit";

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        role: "",
        room_id: "",
    });

    useEffect(() => {
        if (open && user && isEdit) {
            setData({
                name: user.name,
                email: user.email,
                password: "",
                role: user.roles[0]?.name || "",
                room_id: user.room_id?.toString() || "",
            });
        } else if (open && !isEdit) {
            reset();
        }
    }, [open, user, isEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && user) {
            put(route("system.users.update", user.id), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            post(route("system.users.store"), {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    const getRoleDisplayName = (roleName: string): string => {
        const names: Record<string, string> = {
            super_admin: "Super Admin",
            laundry_manager: "Laundry Manager",
            laundry_operator: "Laundry Operator",
            head_nurse: "Head Nurse",
        };
        return names[roleName] || roleName.replace("_", " ");
    };

    const showRoomField = data.role === "head_nurse";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit User" : "Tambah User Baru"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update informasi user di bawah ini."
                            : "Isi form di bawah untuk menambahkan user baru."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Masukkan nama lengkap"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            placeholder="email@domain.com"
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {!isEdit && (
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="Minimal 8 karakter"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">
                                    {errors.password}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={data.role}
                            onValueChange={(value) => setData("role", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.name}>
                                        {getRoleDisplayName(role.name)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.role && (
                            <p className="text-sm text-red-500">
                                {errors.role}
                            </p>
                        )}
                    </div>

                    {showRoomField && (
                        <div className="space-y-2">
                            <Label htmlFor="room">Ruangan</Label>
                            <Select
                                value={data.room_id}
                                onValueChange={(value) =>
                                    setData("room_id", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih ruangan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map((room) => (
                                        <SelectItem
                                            key={room.id}
                                            value={room.id.toString()}
                                        >
                                            {room.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.room_id && (
                                <p className="text-sm text-red-500">
                                    {errors.room_id}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? "Menyimpan..."
                                : isEdit
                                  ? "Simpan Perubahan"
                                  : "Tambah User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
