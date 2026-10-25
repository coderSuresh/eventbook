"use client"

import type { ChangeEvent } from "react"
import PasswordField from "@/components/auth/password-field"
import type { LoginCredentials } from "@/services/auth.service"

type LoginFormProps = {
    error: string
    isSubmitting: boolean
    onSubmit: (credentials: LoginCredentials) => Promise<void>
}

export default function LoginForm({ error, isSubmitting, onSubmit }: LoginFormProps) {
    async function handleSubmit(event: ChangeEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        await onSubmit({ email: String(formData.get("email")), password: String(formData.get("password")) })
    }

    return (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-foreground">
                Email
                <input className="mt-2 w-full rounded-lg border border-line bg-background px-4 py-3 font-normal outline-none transition placeholder:text-muted focus:border-accent" name="email" type="email" autoComplete="email" required />
            </label>
            <PasswordField autoComplete="current-password" />
            {error && <p className="text-sm text-accent-dark" role="alert">{error}</p>}
            <button className="w-full rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : "Log in"}
            </button>
        </form>
    )
}
