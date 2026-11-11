import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SESSION_COOKIE_NAMES = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
] as const;

function stripSessionCookies(cookieHeader: string | null): string | undefined {
    if (!cookieHeader) return undefined;
    const filtered = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .filter(
            (part) =>
                !SESSION_COOKIE_NAMES.some((name) =>
                    part.startsWith(`${name}=`),
                ),
        );
    return filtered.length > 0 ? filtered.join("; ") : undefined;
}

export async function proxy(request: NextRequest) {
    const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
        request.cookies.has(name),
    );
    if (!hasSessionCookie) {
        return NextResponse.next();
    }
    let token = null;
    try {
        token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });
    } catch {
        token = null;
    }
    if (token) {
        return NextResponse.next();
    }
    const requestHeaders = new Headers(request.headers);
    const cookieHeader = stripSessionCookies(request.headers.get("cookie"));
    if (cookieHeader) {
        requestHeaders.set("cookie", cookieHeader);
    } else {
        requestHeaders.delete("cookie");
    }
    const response = NextResponse.next({
        request: { headers: requestHeaders },
    });
    for (const name of SESSION_COOKIE_NAMES) {
        response.cookies.delete(name);
    }
    return response;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
