import Footer from "@/components/common/footer"
import EventDetails from "@/components/events/event-details"
import Header from "@/components/common/header"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getEventById } from "@/services/events.service"

export const instant = false

async function loadEvent(id: string) {
  try {
    return await getEventById(id)
  } catch {
    return null
  }
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
          <span aria-hidden="true">&#8592</span> Back to events
        </Link>
        <EventDetails event={event} />
      </main>
      <Footer />
    </div>
  )
}