import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { DataTable } from "@/Components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { MoreHorizontal, Plus, Shield, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

interface UserTyping {
    id: number;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    last_login: string;
}

const data: UserTyping[] = [
    {
        id: 1,
        name: "Admin Utama",
        email: "superadmin@linenflow.com",
        role: "super_admin",
        status: "active",
        last_login: "2 mins ago",
    },
    {
        id: 2,
        name: "Budi Manager",
        email: "manager@linenflow.com",
        role: "laundry_manager",
        status: "active",
        last_login: "1 hour ago",
    },
    {
        id: 3,
        name: "Operator Cuci 1",
        email: "operator1@linenflow.com",
        role: "laundry_operator",
        status: "active",
        last_login: "5 hours ago",
    },
    {
        id: 4,
        name: "Operator Cuci 2",
        email: "operator2@linenflow.com",
        role: "laundry_operator",
        status: "inactive",
        last_login: "2 days ago",
    },
    {
        id: 5,
        name: "Nurse Ani",
        email: "nurse.ani@ngoerah.com",
        role: "head_nurse",
        status: "active",
        last_login: "12 mins ago",
    },
];

export const columns: ColumnDef<UserTyping>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="font-medium flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                    <User className="h-4 w-4" />
                </div>
                {row.getValue("name")}
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const role = row.getValue("role") as string;
            const color =
                role === "super_admin"
                    ? "bg-purple-100 text-purple-700"
                    : role === "laundry_manager"
                    ? "bg-blue-100 text-blue-700"
                    : role === "head_nurse"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-slate-100 text-slate-700";
            return (
                <Badge
                    variant="outline"
                    className={`${color} border-transparent capitalize`}
                >
                    {role.replace("_", " ")}
                </Badge>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge
                    variant={status === "active" ? "default" : "secondary"}
                    className={
                        status === "active"
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : ""
                    }
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit details</DropdownMenuItem>
                        <DropdownMenuItem>Change Password</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            Deactivate User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function UserIndex() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-white">
                        User Management
                    </h2>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" /> Add New User
                    </Button>
                </div>
            }
        >
            <Head title="Manajemen User" />

            <div className="py-6">
                <DataTable
                    columns={columns}
                    data={data}
                    filterColumn="name"
                    searchPlaceholder="Search users..."
                />
            </div>
        </AuthenticatedLayout>
    );
}
