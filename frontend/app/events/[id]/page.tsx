import Footer from "@/components/common/footer"
import EventDetails from "@/components/events/event-details"
import Header from "@/components/common/header"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getEventById, getUpcomingEvents } from "@/services/events.service"
import { Metadata } from "next"
import { cache } from "react"

export const instant = false

const loadEvent = cache(async (id: string) => {
  try {
    return await getEventById(id)
  } catch {
    return null
  }
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const event = await loadEvent(id)

  if (!event) {
    return {
      title: "Event not found",
      description: "The event you are looking for does not exist.",
    }
  }

  return {
    title: event.title,
    description: event.description,

    openGraph: {
      title: event.title,
      description: event.description,
    }
  }
}

export async function generateStaticParams() {
  const { data: events } = await getUpcomingEvents(1, 100)
  return events.map(event => ({ id: event.id }))
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await loadEvent(id)

  if (!event) notFound()

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16 lg:px-8 lg:py-24">
        <Link className="text-sm font-semibold text-muted no-underline transition hover:text-foreground" href="/#events">
          <span aria-hidden="true">&#8592;</span> Back to events
        </Link>
        <EventDetails event={event} />
      </main>
      <Footer />
    </div>
  )
}