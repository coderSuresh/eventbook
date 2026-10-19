"use client"

import type { AdminEvent } from "@/services/admin.service"

type AdminEventListProps = {
    events: AdminEvent[]
    onEdit: (event: AdminEvent) => void
    onCancel: (event: AdminEvent) => void
}

function formatEventDate(date: string) {
    const eventDate = new Date(date)

    return {
        month: eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: eventDate.getDate(),
        time: eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
}

export default function AdminEventList({ events, onEdit, onCancel }: AdminEventListProps) {
    return (
        <section className="overflow-hidden rounded-2xl border border-line bg-white/55">
            <div className="border-b border-line bg-panel/55 px-6 py-5 sm:px-8">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">All events</h2>
                <p className="mt-1 text-sm text-muted">Manage your published and cancelled events.</p>
            </div>
            <div className="px-6 sm:px-8">
                {events.length === 0 ? <p className="border-b border-line py-5 text-sm text-muted">No events have been created yet.</p> : events.map((event) => {
                    const formattedDate = formatEventDate(event.date)

                    return (
                        <div key={event.id} className="grid gap-5 border-b border-line py-5 sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-6">
                            <div className="flex size-16 flex-col items-center justify-center border border-line bg-accent-soft max-sm:size-13"><span className="text-[0.62rem] font-bold tracking-[0.12em] text-accent-dark">{formattedDate.month}</span><strong className="text-2xl tracking-[-0.06em]">{formattedDate.day}</strong></div>
                            <div className="min-w-0">
                                <p className="m-0 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-accent-dark">Event</p>
                                <h3 className="m-0 mb-1 truncate text-[1.1rem] tracking-[-0.035em] max-sm:text-[0.95rem]">{event.title}</h3>
                                <p className="m-0 text-xs text-muted">{event.venue} <span className="px-1.5 text-accent">/</span> {formattedDate.time} <span className="px-1.5 text-accent">/</span> {event.totalSeats} seats</p>
                            </div>
                            <div className="flex items-center gap-2 sm:justify-end">
                                <button type="button" onClick={() => onEdit(event)} className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">Edit</button>
                                <button type="button" onClick={() => onCancel(event)} disabled={!event.isActive} className="rounded-full px-4 py-2 text-xs font-semibold text-accent-dark transition hover:bg-accent-soft focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-muted/60 disabled:hover:bg-transparent">{event.isActive ? "Cancel" : "Cancelled"}</button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
