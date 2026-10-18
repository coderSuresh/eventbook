import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import Link from "next/link";
import { notFound } from "next/navigation";

type Event = {
  title: string;
  description: string;
  date: string;
  venue: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const instant = false;

async function getEvent(id: string): Promise<Event | null> {
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl}/events/${id}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function EventDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) notFound();

  const eventDate = new Date(event.date);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16 lg:px-8 lg:py-24">
        <Link className="text-sm font-semibold text-muted no-underline transition hover:text-foreground" href="/#events">
          <span aria-hidden="true">&#8592;</span> Back to events
        </Link>
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
          <button className="mt-12 inline-flex rounded-full bg-accent px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-dark" type="button">Book this event</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}