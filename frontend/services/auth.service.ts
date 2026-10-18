import axios from "axios";
import apiClient from "@/lib/axios";
import { clearAuthToken, setAuthToken } from "@/lib/auth-token";

export type LoginCredentials = {
    email: string;
    password: string;
};

export type RegisterCredentials = {
    name: string;
    email: string;
    password: string;
};

type LoginResponse = {
    token: string;
};

type MessageResponse = {
    message: string;
};

type BackendError = {
    message?: string;
    errors?: Array<{ message: string }>;
};

export async function login(credentials: LoginCredentials) {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials);
    setAuthToken(response.data.token);

    return response.data;
}

export async function logout() {
    try {
        await apiClient.post("/auth/logout");
    } finally {
        clearAuthToken();
    }
}

export async function register(credentials: RegisterCredentials) {
    const response = await apiClient.post<MessageResponse>("/auth/register", credentials);

    return response.data;
}

export function getAuthErrorMessage(error: unknown) {
    if (axios.isAxiosError<BackendError>(error)) {
        const responseData = error.response?.data;
        const validationMessage = responseData?.errors?.map(({ message }) => message).join(" ");

        return responseData?.message ?? validationMessage ?? error.message;
    }

    return error instanceof Error ? error.message : String(error);
}