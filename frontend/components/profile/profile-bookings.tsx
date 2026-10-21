"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { cancelBooking, getUserBookings, type Booking, type BookingPagination } from "@/services/booking.service"
import { getAuthErrorMessage, restoreSession } from "@/services/auth.service"

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: (booking: Booking) => Promise<void> }) {
    const [isCancelling, setIsCancelling] = useState(false)
    const event = booking.event

    async function handleCancel() {
        setIsCancelling(true)
        try {
            await onCancel(booking)
        } finally {
            setIsCancelling(false)
        }
    }

    return (
        <article className="rounded-2xl border border-line bg-white/55 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">{event?.title ?? "Event unavailable"}</h3>
                    {event && <p className="mt-2 text-sm text-muted">{formatDate(event.date)} <span className="px-1.5 text-accent">/</span> {event.venue}</p>}
                </div>
                <span className={`self-start rounded-full px-2.5 py-1 text-xs font-semibold ${booking.status === "CONFIRMED" ? "bg-panel text-foreground" : "bg-foreground/10 text-muted"}`}>
                    {booking.status === "CONFIRMED" ? "Confirmed" : "Cancelled"}
                </span>
            </div>
            {booking.status === "CONFIRMED" && event?.isUpcoming && (
                <button className="mt-5 rounded-full border border-line px-4 py-2 text-xs font-semibold text-foreground transition hover:border-accent hover:text-accent-dark disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={handleCancel} disabled={isCancelling}>
                    {isCancelling ? "Cancelling..." : "Cancel booking"}
                </button>
            )}
        </article>
    )
}

export default function ProfileBookings() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [pagination, setPagination] = useState<BookingPagination | null>(null)
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let isCurrentRequest = true

        restoreSession()
            .then(() => getUserBookings(page))
            .then((result) => {
                if (isCurrentRequest) {
                    setBookings(result.data)
                    setPagination(result.pagination)
                }
            })
            .catch((requestError) => {
                if (isCurrentRequest) setError(getAuthErrorMessage(requestError))
            })
            .finally(() => {
                if (isCurrentRequest) setIsLoading(false)
            })

        return () => {
            isCurrentRequest = false
        }
    }, [page])

    const currentBookings = useMemo(() => bookings.filter((booking) => booking.status === "CONFIRMED" && booking.event?.isUpcoming), [bookings])
    const historicalBookings = useMemo(() => bookings.filter((booking) => !currentBookings.includes(booking)), [bookings, currentBookings])

    async function handleCancel(booking: Booking) {
        try {
            await cancelBooking(booking.id)
            setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: "CANCELLED" } : item))
        } catch (cancelError) {
            setError(getAuthErrorMessage(cancelError))
        }
    }

    function renderSection(title: string, sectionBookings: Booking[], emptyMessage: string) {
        return (
            <section className="mt-10">
                <h2 className="text-2xl font-semibold tracking-tighter">{title}</h2>
                <div className="mt-4 space-y-3">
                    {sectionBookings.length === 0 ? <p className="rounded-2xl border border-line bg-white/55 p-6 text-sm text-muted">{emptyMessage}</p> : sectionBookings.map((booking) => <BookingCard key={booking.id} booking={booking} onCancel={handleCancel} />)}
                </div>
            </section>
        )
    }

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 lg:px-8 lg:py-24">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">Your EventBook</p>
            <h1 className="text-5xl font-semibold tracking-[-0.07em] text-foreground">Profile</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">Keep track of the plans you have made and revisit the events you have attended.</p>
            {error && <p className="mt-8 rounded-lg border border-accent-soft bg-accent-soft/50 px-4 py-3 text-sm text-accent-dark" role="alert">{error}</p>}
            {isLoading ? <p className="mt-10 text-sm text-muted">Loading your bookings...</p> : <>
                {renderSection("Current bookings", currentBookings, "You do not have any upcoming bookings.")}
                {renderSection("Booking history", historicalBookings, "Your cancelled and past bookings will appear here.")}
                {pagination && pagination.totalPages > 1 && <nav className="mt-10 flex items-center justify-between gap-4" aria-label="Booking pages">
                    {pagination.hasPreviousPage ? <button className="rounded-full border border-line px-4 py-2 text-xs font-semibold transition hover:border-accent hover:text-accent-dark" type="button" onClick={() => setPage((current) => current - 1)}>Previous</button> : <span />}
                    <p className="text-xs text-muted">Page {pagination.page} of {pagination.totalPages}</p>
                    {pagination.hasNextPage ? <button className="rounded-full border border-line px-4 py-2 text-xs font-semibold transition hover:border-accent hover:text-accent-dark" type="button" onClick={() => setPage((current) => current + 1)}>Next</button> : <span />}
                </nav>}
            </>}
            <Link className="mt-10 inline-flex text-sm font-semibold text-foreground hover:text-accent-dark" href="/#events">Browse upcoming events</Link>
        </main>
    )
}
