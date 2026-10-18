"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "@/components/auth/login-form";
import { getAuthErrorMessage, login, type LoginCredentials } from "@/services/auth.service";

export default function LoginFormContainer() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(credentials: LoginCredentials) {
        setError("");
        setIsSubmitting(true);

        try {
            await login(credentials);
            router.push("/");
            router.refresh();
        } catch (submissionError) {
            setError(getAuthErrorMessage(submissionError));
        } finally {
            setIsSubmitting(false);
        }
    }

    return <LoginForm error={error} isSubmitting={isSubmitting} onSubmit={handleSubmit} />;
}
