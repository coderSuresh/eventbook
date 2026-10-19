"use client"

import { useEffect, useState } from "react"
import { getAdminEvents, getEventBookings, type AdminEvent, type AttendeeBooking } from "@/services/admin.service"

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

function formatDateTime(date: string) {
    return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    })
}

const AdminBookingPage = () => {
    const [events, setEvents] = useState<AdminEvent[]>([])
    const [selectedEventId, setSelectedEventId] = useState("")
    const [bookings, setBookings] = useState<AttendeeBooking[]>([])
    const [isLoadingEvents, setIsLoadingEvents] = useState(true)
    const [isLoadingBookings, setIsLoadingBookings] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        getAdminEvents()
            .then((loadedEvents) => {
                setEvents(loadedEvents)
                setSelectedEventId(loadedEvents[0]?.id ?? "")
            })
            .catch(() => setError("Unable to load events right now."))
            .finally(() => setIsLoadingEvents(false))
    }, [])

    useEffect(() => {
        if (!selectedEventId) {
            setBookings([])
            return
        }

        let isCurrentRequest = true
        setIsLoadingBookings(true)
        setError("")

        getEventBookings(selectedEventId)
            .then((loadedBookings) => {
                if (isCurrentRequest) {
                    setBookings(loadedBookings)
                }
            })
            .catch(() => {
                if (isCurrentRequest) {
                    setError("Unable to load bookings for this event.")
                    setBookings([])
                }
            })
            .finally(() => {
                if (isCurrentRequest) {
                    setIsLoadingBookings(false)
                }
            })

        return () => {
            isCurrentRequest = false
        }
    }, [selectedEventId])

    const selectedEvent = events.find((event) => event.id === selectedEventId)
    const confirmedBookings = bookings.filter((booking) => booking.status === "CONFIRMED")
    const cancelledBookings = bookings.filter((booking) => booking.status === "CANCELLED")
    const remainingSeats = selectedEvent ? Math.max(selectedEvent.totalSeats - confirmedBookings.length, 0) : 0

    return (
        <main className="max-w-5xl">
            <header className="mb-8">
                <h1 className="text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">Bookings</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Keep an eye on attendance and see who is booked for each event.</p>
            </header>

            <section className="mb-6 rounded-2xl border border-line bg-white/55 p-6 sm:p-8">
                <label className="flex max-w-xl flex-col gap-2 text-sm font-semibold" htmlFor="event-select">
                    Select an event
                    <select id="event-select" value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)} disabled={isLoadingEvents || events.length === 0} className="rounded-lg border border-line bg-background px-4 py-3 font-normal outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60">
                        {isLoadingEvents ? <option>Loading events...</option> : events.length === 0 ? <option>No events available</option> : events.map((event) => <option key={event.id} value={event.id}>{event.title}{event.isActive ? "" : " (Cancelled)"}</option>)}
                    </select>
                </label>
                {selectedEvent && <p className="mt-4 text-sm text-muted">{formatDate(selectedEvent.date)} <span className="px-1.5 text-accent">/</span> {selectedEvent.venue}</p>}
            </section>

            {error && <p className="mb-6 rounded-lg border border-accent-soft bg-accent-soft/50 px-4 py-3 text-sm text-accent-dark" role="alert">{error}</p>}

            {selectedEvent && <>
                <section className="mb-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-line bg-white/55 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Confirmed</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.06em]">{confirmedBookings.length}</p>
                        <p className="mt-1 text-xs text-muted">{selectedEvent.totalSeats} total seats</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/55 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Remaining</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.06em]">{remainingSeats}</p>
                        <p className="mt-1 text-xs text-muted">available seats</p>
                    </div>
                    <div className="rounded-2xl border border-line bg-white/55 p-5">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Cancelled</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.06em]">{cancelledBookings.length}</p>
                        <p className="mt-1 text-xs text-muted">booking records</p>
                    </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-line bg-white/55">
                    <div className="border-b border-line bg-panel/55 px-6 py-5 sm:px-8">
                        <h2 className="text-lg font-semibold tracking-[-0.02em]">Attendees</h2>
                        <p className="mt-1 text-sm text-muted">People currently associated with this event.</p>
                    </div>

                    {isLoadingBookings ? <p className="px-6 py-8 text-sm text-muted sm:px-8">Loading bookings...</p> : bookings.length === 0 ? <p className="px-6 py-8 text-sm text-muted sm:px-8">No bookings for this event yet.</p> : <div className="overflow-x-auto">
                        <table className="w-full min-w-155 text-left text-sm">
                            <thead className="border-b border-line text-xs uppercase tracking-[0.12em] text-muted">
                                <tr>
                                    <th className="px-6 py-4 font-semibold sm:px-8">Attendee</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold sm:px-8">Booked on</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => <tr key={booking.id} className="border-b border-line last:border-b-0">
                                    <td className="px-6 py-4 sm:px-8"><p className="font-semibold">{booking.user.name}</p><p className="mt-1 text-xs text-muted">{booking.user.email}</p></td>
                                    <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${booking.status === "CONFIRMED" ? "bg-panel text-foreground" : "bg-foreground/10 text-muted"}`}>{booking.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}</span></td>
                                    <td className="px-6 py-4 text-muted sm:px-8">{formatDateTime(booking.createdAt)}</td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>}
                </section>
            </>}
        </main>
    )
}

export default AdminBookingPage
