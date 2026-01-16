import { Link, usePage } from "@inertiajs/react";
import { usePermission } from "@/hooks/usePermission";
import { menuConfig } from "@/lib/menu-config";
import { cn } from "@/lib/utils";
import { LogOut, ChevronRight } from "lucide-react";

export function AppSidebar({ className }: { className?: string }) {
    const { can, user } = usePermission();
    const { url } = usePage();

    // Determine active menu item
    const isActive = (href: string) => url.startsWith(href);

    return (
        <aside
            className={cn(
                "flex flex-col w-72 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-border-dark flex-shrink-0 transition-colors duration-200",
                className
            )}
        >
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-border-dark/50">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                    {/* Material Symbol equivalent for local_laundry_service using generic icon or text if needed, but here using a placeholder div or importing a specific icon */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-washing-machine"
                    >
                        <path d="M3 6h3" />
                        <path d="M17 6h.01" />
                        <path d="M19 6V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2" />
                        <rect width="20" height="15" x="2" y="6" rx="2" />
                        <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                        <path d="M12 17v.01" />
                    </svg>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                        LinenFlow
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium tracking-wide">
                        {user?.role
                            ? user.role.replace("_", " ").toUpperCase()
                            : "SYSTEM"}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 gap-6 custom-scroll">
                {menuConfig.map((group) => {
                    // Filter items by permission
                    const visibleItems = group.items.filter((item) =>
                        can(item.permission)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.group} className="flex flex-col gap-1">
                            <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                {group.group === "main" ? "Main" : group.group}
                            </p>
                            {visibleItems.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                                            active
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <Icon
                                            className={cn(
                                                "size-5",
                                                active
                                                    ? "text-white"
                                                    : "text-slate-500 dark:text-slate-400 group-hover:text-primary"
                                            )}
                                        />
                                        <span>{item.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-border-dark">
                <div className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group cursor-pointer">
                    <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300">
                        {/* Avatar Placeholder */}
                        <span className="text-sm font-bold">
                            {user?.name?.charAt(0) || "U"}
                        </span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-slate-900 dark:text-white text-sm font-medium truncate">
                            {user?.name || "User"}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                            {user?.email || "user@example.com"}
                        </p>
                    </div>
                    <Link href={route("logout")} method="post" as="button">
                        <LogOut className="size-5 text-slate-400 hover:text-red-500 transition-colors" />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
