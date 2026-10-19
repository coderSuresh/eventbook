const REFRESH_TOKEN_COOKIE = "eventbook_refresh_token";

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "none" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

export { REFRESH_TOKEN_COOKIE, refreshCookieOptions };
