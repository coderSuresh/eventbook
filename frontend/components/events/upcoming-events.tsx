import Link from "next/link"
import type { Event } from "@/services/events.service"

type UpcomingEventsProps = {
    events: Event[]
}

function formatEventDate(date: string) {
    const eventDate = new Date(date)

    return {
        month: eventDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: eventDate.getDate(),
        time: eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    }
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
    return (
        <div className="mt-10">
            {events.length === 0 ? (
                <p className="border-b border-line py-5 text-sm text-muted">No upcoming events are available right now.</p>
            ) : events.map((event) => {
                const formattedDate = formatEventDate(event.date)

                return (
                    <Link key={event.id} href={`/events/${event.id}`} className="grid grid-cols-[4rem_1fr_auto] items-center gap-6 border-b border-line py-5 no-underline transition hover:bg-panel/60 max-sm:grid-cols-[3.25rem_1fr_auto] max-sm:gap-3" aria-label={`View details for ${event.title}`}>
                        <div className="flex size-16 flex-col items-center justify-center border border-line bg-accent-soft max-sm:size-13"><span className="text-[0.62rem] font-bold tracking-[0.12em] text-accent-dark">{formattedDate.month}</span><strong className="text-2xl tracking-[-0.06em]">{formattedDate.day}</strong></div>
                        <div><p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-accent-dark">Event</p><h3 className="m-0 mb-1 text-[1.1rem] tracking-[-0.035em] max-sm:text-[0.95rem]">{event.title}</h3><p className="m-0 text-xs text-muted">{event.venue} <span className="px-1.5 text-accent">/</span> {formattedDate.time} {event.remainingSeats !== undefined && <><span className="px-1.5 text-accent">/</span> <span className={event.remainingSeats === 0 ? "text-accent-dark" : ""}>{event.remainingSeats === 0 ? "Sold out" : `${event.remainingSeats} seats left`}</span></>}</p></div>
                        <span className="text-xl text-accent-dark" aria-hidden="true">&#8599;</span>
                    </Link>
                )
            })}
        </div>
    )
}
