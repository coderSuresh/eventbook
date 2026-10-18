import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import BookEventButton from "@/components/events/book-event-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventById } from "@/services/events.service";

export const instant = false;

export default async function BookEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEventById(id).catch(() => null);

    if (!event) notFound();

    const eventDate = new Date(event.date);

    return (
        <div className="flex min-h-full flex-col bg-background">
            <Header />
            <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 lg:px-8 lg:py-24">
                <Link className="text-sm font-semibold text-muted no-underline hover:text-foreground" href={`/events/${event.id}`}>
                    <span aria-hidden="true">&#8592;</span> Back to event
                </Link>
                <section className="mt-16 border-t border-line pt-8">
                    <p className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">Confirm your place</p>
                    <h1 className="m-0 text-5xl font-semibold leading-none tracking-[-0.07em] text-foreground">{event.title}</h1>
                    <div className="mt-10 grid gap-6 border-y border-line py-6 sm:grid-cols-3">
                        <p className="m-0 text-sm text-muted"><strong className="block text-xs uppercase tracking-[0.14em] text-foreground">Date</strong>{eventDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                        <p className="m-0 text-sm text-muted"><strong className="block text-xs uppercase tracking-[0.14em] text-foreground">Time</strong>{eventDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
                        <p className="m-0 text-sm text-muted"><strong className="block text-xs uppercase tracking-[0.14em] text-foreground">Venue</strong>{event.venue}</p>
                    </div>
                    <BookEventButton eventId={event.id} />
                </section>
            </main>
            <Footer />
        </div>
    );
}