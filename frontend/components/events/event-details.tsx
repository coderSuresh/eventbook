import type { Event } from "@/services/events.service";
import Link from "next/link";

type EventDetailsProps = {
    event: Event;
};

export default function EventDetails({ event }: EventDetailsProps) {
    const eventDate = new Date(event.date);

    return (
        <div className="mt-16 border-t border-line pt-8">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">Event details</p>
            <h1 className="m-0 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-[-0.07em] text-foreground sm:text-7xl">{event.title}</h1>
            <div className="mt-12 grid gap-8 border-y border-line py-8 sm:grid-cols-3">
                <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">Date</p><p className="m-0 text-lg font-semibold text-foreground">{eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p></div>
                <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">Time</p><p className="m-0 text-lg font-semibold text-foreground">{eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p></div>
                <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">Venue</p><p className="m-0 text-lg font-semibold text-foreground">{event.venue}</p></div>
            </div>
            <div className="mt-12 max-w-2xl">
                <h2 className="mb-4 text-2xl font-semibold tracking-[-0.04em] text-foreground">About this event</h2>
                <p className="m-0 text-base leading-8 text-muted">{event.description}</p>
            </div>
            {
                event.isUpcoming && event.remainingSeats !== 0 ?
                    <Link
                        className="mt-12 inline-flex rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white no-underline transition hover:bg-accent-dark"
                        href={`/events/${event.id}/book`}
                    >
                        Book this event
                    </Link>
                    :
                    <p className="mt-12 text-sm font-semibold text-muted">This event is no longer available for booking.</p>
            }
        </div>
    );
}
