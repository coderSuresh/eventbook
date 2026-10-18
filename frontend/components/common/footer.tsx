import Link from "next/link"
import { cacheLife } from 'next/cache'

async function getCurrentYear() {
    'use cache'
    cacheLife('max')
    return new Date().getFullYear()
}

const Footer = () => {
    return (
        <footer className="mx-auto flex w-full max-w-6xl flex-col gap-3 border-t border-line px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <span className="inline-flex items-center gap-2.5 font-bold tracking-[-0.03em] text-foreground">
                <span className="grid size-7 place-items-center rounded-full bg-foreground text-sm text-background">
                    E
                </span>
                <span>
                    EventBook
                </span>
            </span>
            <p className="m-0 text-sm text-muted">&copy; {getCurrentYear()} EventBook. All rights reserved.</p>
            <Link
                className="text-xs font-semibold text-foreground no-underline hover:text-accent-dark"
                href="#"
            >
               Privacy Policy
            </Link>
        </footer>
    )
}

export default Footer
