let accessToken: string | null = null

export const AUTH_CHANGE_EVENT = "eventbook:auth-change"

export function getAuthToken() {
    return accessToken
}

export function setAuthToken(token: string) {
    accessToken = token
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
    }
}

export function clearAuthToken() {
    accessToken = null
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
    }
}