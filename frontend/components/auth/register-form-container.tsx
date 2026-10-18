"use client";

import { useState } from "react";
import RegisterForm from "@/components/auth/register-form";
import { getAuthErrorMessage, register, type RegisterCredentials } from "@/services/auth.service";

export default function RegisterFormContainer() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(credentials: RegisterCredentials) {
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            const response = await register(credentials);
            setSuccess(response.message || "Account created. Check your email to verify it.");
        } catch (submissionError) {
            setError(getAuthErrorMessage(submissionError));
        } finally {
            setIsSubmitting(false);
        }
    }

    return <RegisterForm error={error} success={success} isSubmitting={isSubmitting} onSubmit={handleSubmit} />;
}
