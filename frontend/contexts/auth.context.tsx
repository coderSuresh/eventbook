
"use client"

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"
import {
    AUTH_CHANGE_EVENT,
    clearAuthToken,
    getAuthToken,
} from "@/lib/auth-token"
import { restoreSession } from "@/services/auth.service"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
    status: AuthStatus
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>("loading")

    useEffect(() => {
        let active = true

        const syncAuthState = () => {
            if (!active) return

            setStatus(
                getAuthToken() ? "authenticated" : "unauthenticated"
            )
        }

        window.addEventListener(AUTH_CHANGE_EVENT, syncAuthState)

        restoreSession()
            .then(() => {
                if (active) setStatus("authenticated")
            })
            .catch(() => {
                clearAuthToken()
                if (active) setStatus("unauthenticated")
            })

        return () => {
            active = false
            window.removeEventListener(AUTH_CHANGE_EVENT, syncAuthState)
        }
    }, [])

    return (
        <AuthContext.Provider value={{ status }
        }>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }

    return context
}
