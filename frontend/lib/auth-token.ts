let accessToken: string | null = null;

export function getAuthToken() {
    return accessToken;
}

export function setAuthToken(token: string) {
    accessToken = token;
}

export function clearAuthToken() {
    accessToken = null;
}