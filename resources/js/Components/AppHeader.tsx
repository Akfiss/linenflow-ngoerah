import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";

interface AppHeaderProps {
    className?: string;
    onMenuClick?: () => void;
}

export function AppHeader({ className, onMenuClick }: AppHeaderProps) {
    const { url } = usePage();

    // Simple breadcrumb logic
    const segments = url.split("/").filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        return {
            name: segment.charAt(0).toUpperCase() + segment.slice(1),
            path,
        };
    });

    return (
        <header
            className={cn(
                "h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 dark:border-border-dark bg-surface-light/50 dark:bg-surface-dark/50 backdrop-blur-md sticky top-0 z-20",
                className
            )}
        >
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <Menu className="size-6" />
                </button>

                {/* Breadcrumbs */}
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="hover:text-primary cursor-pointer transition-colors">
                        Home
                    </span>
                    {breadcrumbs.map((crumb, index) => (
                        <div
                            key={crumb.path}
                            className="flex items-center gap-2"
                        >
                            <span className="text-xs">/</span>
                            <span
                                className={cn(
                                    "font-medium transition-colors",
                                    index === breadcrumbs.length - 1
                                        ? "text-slate-900 dark:text-white"
                                        : "hover:text-primary"
                                )}
                            >
                                {crumb.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-4">
                {/* Search */}
                <div className="relative group hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <Search className="size-4" />
                    </div>
                    <input
                        className="bg-slate-50 dark:bg-background-dark border-none rounded-lg block w-64 pl-10 p-2.5 text-sm focus:ring-1 focus:ring-primary placeholder-slate-400 transition-all shadow-sm"
                        placeholder="Search logs, data..."
                        type="text"
                    />
                </div>

                {/* Icons */}
                <button className="relative p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <Bell className="size-5" />
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-surface-light dark:border-surface-dark"></span>
                </button>

                <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <Settings className="size-5" />
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-border-dark mx-1 hidden md:block"></div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <Avatar className="size-9 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all border border-slate-200 dark:border-border-dark">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuItem>Team</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
