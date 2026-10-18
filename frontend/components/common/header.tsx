import Link from "next/link"

const Header = () => {
    return (
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-line px-6 py-6 lg:px-8">
            <Link
                className="inline-flex items-center gap-2.5 text-[1.05rem] font-bold tracking-[-0.03em] text-foreground"
                href="#top"
                aria-label="EventBook home"
            >
                <span className="grid size-7 place-items-center rounded-full bg-foreground text-sm text-background">E</span>
                <span>EventBook</span>
            </Link>
            <Link
                className="hidden text-xs font-semibold text-foreground no-underline hover:text-accent-dark sm:inline"
                href="#events"
            >
                Upcoming events
            </Link>
        </header>
    )
}

export default Header
