import Header from "@/components/common/header"
import Footer from "@/components/common/footer"
import UpcomingEvents from "@/components/events/upcoming-events"
import Link from "next/link"
import { getUpcomingEvents, searchEvents, type PaginatedEvents } from "@/services/events.service"

export const instant = false

async function loadUpcomingEvents(page: number, query: string) {
  try {
    return query ? await searchEvents(query, page, 10) : await getUpcomingEvents(page, 10)
  } catch {
    return {
      data: [],
      pagination: {
        page,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string; query?: string }> }) {
  const params = await searchParams
  const requestedPage = Number(params.page)
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const query = params.query?.trim() ?? ""
  const { data: events, pagination }: PaginatedEvents = await loadUpcomingEvents(page, query)

  return (
    <div className="flex min-h-full flex-col">
      <Header />

      <main id="top" className="flex-1">
        <section className="mx-auto grid min-h-136 w-full max-w-6xl gap-12 px-6 pb-24 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pb-32 lg:pt-24">
          <div>

            <p className="mb-5 text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">
              Find your next favourite thing
            </p>

            <h1 className="m-0 max-w-2xl text-5xl font-semibold leading-[0.94] tracking-[-0.075em] text-foreground sm:text-7xl lg:text-[6.7rem]">
              Find something worth.
            </h1>

            <p className="my-8 max-w-md text-[1.05rem] leading-[1.6] text-muted">
              Discover thoughtful gatherings, local talent, and the people who
              make your city feel like home.
            </p>

            <Link className="inline-flex items-center gap-4 rounded-full bg-accent px-5 py-3.5 text-[0.85rem] font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-accent-dark" href="#events">
              Explore events
            </Link>
          </div>

          <div className="hero-art relative min-h-72 overflow-hidden rounded-2xl bg-panel sm:min-h-88" aria-hidden="true">

            <div className="absolute bottom-[12%] right-[12%] z-10 w-[min(72%,18rem)] bg-background p-6 shadow-[1rem_1rem_0_var(--foreground)]">
              <span className="mb-6 block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-accent-dark">This week</span>
              <strong className="block text-3xl leading-none tracking-[-0.06em]">Good things<br />are happening.</strong>
              <span className="my-6 block w-8 border-t-2 border-accent" />
              <span className="text-[0.7rem] text-muted">Curated for curious people</span>
            </div>

          </div>
        </section>

        <section id="events" className="mx-auto w-full max-w-6xl px-6 pb-24 lg:px-8 lg:pb-32">
          <div className="flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-accent-dark">Mark your calendar</p>
              <h2 className="m-0 text-3xl leading-none tracking-[-0.06em] sm:text-[2.6rem]">Latest upcoming events</h2>
              {query && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted" role="status" aria-live="polite">
                  <span>Showing results for</span>
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent/25 bg-accent-soft/45 px-3 py-1 font-semibold text-accent-dark">
                    <span className="truncate">&quot;{query}&quot;</span>
                  </span>
                  <Link
                    href="/#events"
                    className="rounded-full px-2 py-1 font-semibold text-accent-dark underline decoration-accent/40 underline-offset-4 transition hover:bg-accent-soft hover:decoration-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                  >
                    Clear search
                  </Link>
                </div>
              )}
            </div>
            <div className="flex w-full max-w-sm items-center gap-2">
              <form action="#events" method="get" className="flex min-w-0 flex-1 items-center gap-2">
                <label htmlFor="event-search" className="sr-only">Search events by title</label>
                <input
                  id="event-search"
                  name="query"
                  type="search"
                  defaultValue={query}
                  required
                  placeholder="Search by title"
                  className="min-w-0 flex-1 rounded-full border border-line bg-white/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
                <button type="submit" className="rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">Search</button>
              </form>
            </div>
          </div>

          <UpcomingEvents events={events} />
          {pagination.totalPages > 1 && <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Event pages">
            {pagination.hasPreviousPage ? <Link className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-foreground no-underline transition hover:border-accent hover:text-accent-dark" href={`/?${query ? `query=${encodeURIComponent(query)}&` : ""}page=${pagination.page - 1}#events`}>Previous</Link> : <span />}
            <p className="text-xs text-muted">Page {pagination.page} of {pagination.totalPages}</p>
            {pagination.hasNextPage ? <Link className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-foreground no-underline transition hover:border-accent hover:text-accent-dark" href={`/?${query ? `query=${encodeURIComponent(query)}&` : ""}page=${pagination.page + 1}#events`}>Next</Link> : <span />}
          </nav>}
        </section>
      </main>

      <Footer />
    </div>
  )
}
