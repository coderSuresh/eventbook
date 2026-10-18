import Header from "@/components/common/header";
import Link from "next/link";

export default function Home() {
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
          <div className="flex items-end justify-between gap-6 border-t border-line pt-6">

            <div>
              <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-accent-dark">Mark your calendar</p>
              <h2 className="m-0 text-3xl leading-none tracking-[-0.06em] sm:text-[2.6rem]">Latest upcoming events</h2>
            </div>

            <Link
              className="hidden text-xs font-semibold text-foreground no-underline hover:text-accent-dark sm:inline"
              href="#events"
            >
              View all
            </Link>
          </div>

          <div className="mt-10">

            <article className="grid grid-cols-[4rem_1fr_auto] items-center gap-6 border-b border-line py-5 max-sm:grid-cols-[3.25rem_1fr_auto] max-sm:gap-3">
              <div className="flex size-16 flex-col items-center justify-center border border-line bg-accent-soft max-sm:size-13"><span className="text-[0.62rem] font-bold tracking-[0.12em] text-accent-dark">OCT</span><strong className="text-2xl tracking-[-0.06em]">24</strong></div>
              <div><p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-accent-dark">Workshop</p><h3 className="m-0 mb-1 text-[1.1rem] tracking-[-0.035em] max-sm:text-[0.95rem]">Make space for making</h3><p className="m-0 text-xs text-muted">Studio North <span className="px-1.5 text-accent">/</span> 6:30 PM</p></div>
              <span className="text-xl text-accent-dark" aria-hidden="true">&#8599;</span>
            </article>

          </div>
        </section>
      </main>


    </div>
  );
}
