"use client"

import axios from "axios"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createBooking } from "@/services/booking.service"
import { getAuthErrorMessage } from "@/services/auth.service"
import { useAuth } from "@/contexts/auth.context"
import Link from "next/link"
import { checkIfAlreadyBooked } from "@/services/events.service"

type BookEventButtonProps = {
    eventId: string
}

export default function BookEventButton({ eventId }: BookEventButtonProps) {
    const router = useRouter()
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isBooked, setIsBooked] = useState(false)
    const { status } = useAuth()

    useEffect(() => {
        if (status === "authenticated") {
            checkIfAlreadyBooked(eventId).then((isBooked) => {
                console.log("Booking status for event", eventId, ":", isBooked)
                setIsBooked(isBooked)
            })
        }
    }, [status, eventId])

    async function handleBooking() {
        setError("")
        setIsSubmitting(true)

        try {
            await createBooking(eventId)
            setIsBooked(true)
        } catch (bookingError) {
            if (axios.isAxiosError(bookingError) && bookingError.response?.status === 401) {
                router.replace(`/login?redirect=/events/${eventId}`)
                return
            }

            setError(getAuthErrorMessage(bookingError))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (status === "loading") {
        return (
            <div className="mt-8">
                <button className="inline-flex rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled>
                    Loading...
                </button>
            </div>
        )
    }

    if (status === "unauthenticated") {
        return (
            <div className="mt-8">
                <Link className="inline-flex rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60" href={`/login?redirect=/events/${eventId}`}>
                    Log in to book
                </Link>
            </div>
        )
    }

    if (isBooked) {
        return (
            <p className="mt-8 text-sm font-semibold text-accent-dark">Booking confirmed</p>
        )
    }

    return (
        <div className="mt-8">
            <button className="inline-flex rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={handleBooking} disabled={isSubmitting || isBooked}>
                {isBooked ? "Booking confirmed" : isSubmitting ? "Booking..." : "Confirm booking"}
            </button>
            {error && <p className="mt-3 text-sm text-accent-dark" role="alert">{error}</p>}
        </div>
    )
}