import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const refreshTokenCookie = "eventbook_refresh_token";

interface CustomJWTPayload {
    role?: string;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const hasRefreshSession = request.cookies.has(refreshTokenCookie);
    const refreshToken = request.cookies.get(refreshTokenCookie)?.value;

    const redirectToLogin = () => {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    };

    const isBookingRoute = pathname.startsWith("/events/") && pathname.endsWith("/book");
    const isAdminRoute = pathname.startsWith("/admin");
    const isProfileRoute = pathname.startsWith("/profile");

    if (!isBookingRoute && !isAdminRoute && !isProfileRoute) {
        return NextResponse.next();
    }

    if (!hasRefreshSession || !refreshToken) {
        return redirectToLogin();
    }

    try {
        const { payload } = await jwtVerify<CustomJWTPayload>(
            refreshToken,
            new TextEncoder().encode(process.env.JWT_SECRET)
        );

        if (isAdminRoute) {
            if (!payload.role || payload.role !== "ADMIN") {
                return redirectToLogin();
            }
        }

        return NextResponse.next();

    } catch {
        return redirectToLogin();
    }
}

export const config = {
    matcher: [
        '/events/:path*',
        '/admin/:path*',
        '/profile/:path*',
    ],
};
