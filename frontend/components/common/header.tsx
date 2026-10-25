"use client"

import Link from "next/link"
import { useState } from "react"
import { logout } from "@/services/auth.service"
import { useAuth } from "@/contexts/auth.context"

const Header = () => {
    const { status } = useAuth()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const isAuthenticated = status === "authenticated"

    async function handleLogout() {
        setIsLoggingOut(true)
        try {
            await logout()
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-line px-6 py-6 lg:px-8">
            <Link
                className="inline-flex items-center gap-2.5 text-[1.05rem] font-bold tracking-[-0.03em] text-foreground"
                href="/"
                aria-label="EventBook home"
            >
                <span className="grid size-7 place-items-center rounded-full bg-foreground text-sm text-background">E</span>
                <span>EventBook</span>
            </Link>
            {isAuthenticated ? (
                <div className="flex items-center gap-4">
                    <Link className="text-xs font-semibold text-foreground no-underline hover:text-accent-dark" href="/profile">
                        Profile
                    </Link>
                    <button className="text-xs font-semibold text-muted transition hover:text-accent-dark disabled:opacity-60" type="button" onClick={handleLogout} disabled={isLoggingOut}>
                        {isLoggingOut ? "Logging out..." : "Log out"}
                    </button>
                </div>
            ) : (
                <Link className="text-xs font-semibold text-foreground no-underline hover:text-accent-dark" href="/login">
                    Log in
                </Link>
            )}
        </header>
    )
}

export default Header
