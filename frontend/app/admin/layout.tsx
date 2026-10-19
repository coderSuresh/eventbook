"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const isEvents = pathname.startsWith("/admin/events") || pathname === "/admin";
    const isBookings = pathname.startsWith("/admin/bookings");

    return (
        <div className="min-h-full bg-background">
            <aside className="bg-foreground p-5 text-background lg:fixed lg:h-full lg:w-64 lg:p-8">
                <Link href="/" className="text-xl font-bold tracking-[-0.04em]">EventBook</Link>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-background/55">Admin workspace</p>
                <nav className="mt-8 space-y-1">
                    <Link href="/admin/events" className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${isEvents ? "bg-background/10 text-background" : "text-background/65 hover:bg-background/10 hover:text-background"}`}>Events</Link>
                    <Link href="/admin/bookings" className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${isBookings ? "bg-background/10 text-background" : "text-background/65 hover:bg-background/10 hover:text-background"}`}>Bookings</Link>
                </nav>
            </aside>
            <main className="px-5 py-8 lg:ml-64 lg:px-12 lg:py-10">
                <div className="mx-auto max-w-6xl">{children}</div>
            </main>
        </div>
    );
}
