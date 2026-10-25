import axios, { AxiosHeaders, type AxiosError } from "axios"
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/auth-token"

declare module "axios" {
    interface AxiosRequestConfig {
        _retry?: boolean
    }
}

type AuthResponse = {
    token: string
}

const clientConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
}

const apiClient = axios.create(clientConfig)
const refreshClient = axios.create(clientConfig)

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken()

    if (token && !isPublicAuthRequest(config.url)) {
        config.headers.set("Authorization", `Bearer ${token}`)
    }

    return config
})

function isPublicAuthRequest(url = "") {
    return ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout", "/auth/verify"]
        .some((path) => url.includes(path))
}

function isRefreshableRequest(error: AxiosError) {
    const request = error.config
    const requestUrl = request?.url ?? ""

    return error.response?.status === 401
        && Boolean(request)
        && !request?._retry
        && !isPublicAuthRequest(requestUrl)
        && typeof window !== "undefined"
}

export function refreshAccessToken() {
    refreshPromise ??= refreshClient
        .post<AuthResponse>("/auth/refresh")
        .then(({ data }) => {
            setAuthToken(data.token)
            return data.token
        })
        .finally(() => {
            refreshPromise = null
        })

    return refreshPromise
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (!isRefreshableRequest(error)) {
            return Promise.reject(error)
        }

        const originalRequest = error.config
        if (!originalRequest) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            const token = await refreshAccessToken()
            originalRequest.headers = AxiosHeaders.from(originalRequest.headers)
            originalRequest.headers.set("Authorization", `Bearer ${token}`)
            return apiClient(originalRequest)
        } catch (refreshError) {
            clearAuthToken()
            return Promise.reject(refreshError)
        }
    },
)

export default apiClient
