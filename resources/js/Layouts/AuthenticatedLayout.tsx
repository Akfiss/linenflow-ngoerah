import { useState, PropsWithChildren, ReactNode } from "react";
import { usePage } from "@inertiajs/react";
import { AppSidebar } from "@/Components/AppSidebar";
import { AppHeader } from "@/Components/AppHeader";

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { user } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans overflow-hidden">
            {/* Sidebar */}
            <AppSidebar
                className={
                    sidebarOpen ? "absolute z-30 h-full" : "hidden md:flex"
                }
            />

            {/* Backdrop for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
                        {header && <div className="mb-8">{header}</div>}
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
