import { useState, PropsWithChildren, ReactNode, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { AppSidebar } from "@/Components/AppSidebar";
import { AppHeader } from "@/Components/AppHeader";
import { Toaster } from "@/Components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { PageProps } from "@/types";

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { props } = usePage<PageProps>();
    const { user, flash } = props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (flash?.success) {
            toast({
                title: "Berhasil",
                description: flash.success,
                className: "bg-emerald-50 border-emerald-200 text-emerald-800",
            });
        }
        if (flash?.error) {
            toast({
                title: "Error",
                description: flash.error,
                variant: "destructive",
                className:
                    "animate-shake bg-red-50 border-red-300 text-red-800",
            });
        }
    }, [flash]);

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-sans overflow-hidden">
            <Toaster />
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
