import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isApiAdminRoute = createRouteMatcher(["/api/admin(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

const clerkAuth = clerkMiddleware(async (auth) => {
    await auth.protect();
});

export default async function proxy(req: NextRequest, event: NextFetchEvent) {
    const { pathname } = req.nextUrl;

    if (isAdminRoute(req) || isApiAdminRoute(req)) {
        return clerkAuth(req, event);
    }

    if (isApiRoute(req)) {
        return NextResponse.next();
    }

    if (pathname.startsWith("/en") || pathname === "/en") {
        return intlMiddleware(req);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
