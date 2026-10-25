"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { getAuthErrorMessage, verifyEmail } from "@/services/auth.service"

type VerifyEmailContainerProps = {
    token?: string
}

export default function VerifyEmailContainer({ token }: VerifyEmailContainerProps) {
    const [error, setError] = useState(token ? "" : "This verification link is missing its token.")
    const [message, setMessage] = useState("")
    const [isVerifying, setIsVerifying] = useState(Boolean(token))
    const verificationRef = useRef<ReturnType<typeof verifyEmail> | null>(null)

    useEffect(() => {
        if (!token) {
            return
        }

        const verification = verificationRef.current ?? (verificationRef.current = verifyEmail(token))

        let isCurrent = true

        verification
            .then((response) => {
                if (isCurrent) {
                    setMessage(response.message || "Your email has been verified.")
                }
            })
            .catch((verificationError: unknown) => {
                if (isCurrent) {
                    setError(getAuthErrorMessage(verificationError))
                }
            })
            .finally(() => {
                if (isCurrent) {
                    setIsVerifying(false)
                }
            })

        return () => {
            isCurrent = false
        }
    }, [token])

    if (isVerifying) {
        return <p className="mt-8 text-sm text-muted" role="status">Verifying your email...</p>
    }

    return (
        <div className="mt-8 space-y-5">
            {message && <p className="text-sm text-foreground" role="status">{message}</p>}
            {error && <p className="text-sm text-accent-dark" role="alert">{error}</p>}
            <Link className="inline-flex rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-dark" href="/login">
                Continue to login
            </Link>
        </div>
    )
}
