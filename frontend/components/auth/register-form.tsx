"use client";

import type { FormEvent } from "react";
import PasswordField from "@/components/auth/password-field";
import type { RegisterCredentials } from "@/services/auth.service";

type RegisterFormProps = {
    error: string;
    success: string;
    isSubmitting: boolean;
    onSubmit: (credentials: RegisterCredentials) => Promise<void>;
};

export default function RegisterForm({ error, success, isSubmitting, onSubmit }: RegisterFormProps) {
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        await onSubmit({
            name: String(formData.get("name")),
            email: String(formData.get("email")),
            password: String(formData.get("password")),
        });
    }

    return (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-foreground">
                Name
                <input className="mt-2 w-full rounded-lg border border-line bg-background px-4 py-3 font-normal outline-none transition placeholder:text-muted focus:border-accent" name="name" type="text" autoComplete="name" required />
            </label>
            <label className="block text-sm font-semibold text-foreground">
                Email
                <input className="mt-2 w-full rounded-lg border border-line bg-background px-4 py-3 font-normal outline-none transition placeholder:text-muted focus:border-accent" name="email" type="email" autoComplete="email" required />
            </label>
            <PasswordField autoComplete="new-password" />
            {error && <p className="text-sm text-accent-dark" role="alert">{error}</p>}
            {success && <p className="text-sm text-foreground" role="status">{success}</p>}
            <button className="w-full rounded-full bg-accent px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : "Create account"}
            </button>
        </form>
    );
}
