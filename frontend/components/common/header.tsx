"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AUTH_CHANGE_EVENT, getAuthToken } from "@/lib/auth-token"
import { logout, restoreSession } from "@/services/auth.service"

const Header = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    useEffect(() => {
        const syncAuthState = () => setIsAuthenticated(Boolean(getAuthToken()))
        const handleAuthChange = () => syncAuthState()

        syncAuthState()
        window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
        restoreSession().catch(() => {
            syncAuthState()
        })

        return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange)
    }, [])

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
