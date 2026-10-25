"use client"

import { useId } from "react"

type PasswordFieldProps = {
    autoComplete: "current-password" | "new-password"
}

export default function PasswordField({ autoComplete }: PasswordFieldProps) {
    const inputId = useId()

    return (
        <div>
            <label className="block text-sm font-semibold text-foreground" htmlFor={inputId}>
                Password
            </label>
            <input className="mt-2 w-full rounded-lg border border-line bg-background px-4 py-3 font-normal outline-none transition placeholder:text-muted focus:border-accent" id={inputId} name="password" type="password" autoComplete={autoComplete} minLength={8} required />
        </div>
    )
}
