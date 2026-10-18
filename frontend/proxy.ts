import { NextRequest, NextResponse } from "next/server";

const refreshTokenCookie = "eventbook_refresh_token";

export function proxy(request: NextRequest) {
    const hasRefreshSession = request.cookies.has(refreshTokenCookie);

    if (!hasRefreshSession) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/events/:id/book",
};