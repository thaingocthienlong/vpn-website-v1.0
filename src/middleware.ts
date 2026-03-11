import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

// next-intl middleware for locale handling
const intlMiddleware = createMiddleware(routing);

// Only admin routes need Clerk authentication
const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isApiAdminRoute = createRouteMatcher(['/api/admin(.*)']);

// Routes that skip i18n
const isApiRoute = createRouteMatcher(['/api(.*)']);

// Clerk middleware — only used for admin routes
const clerkAuth = clerkMiddleware(async (auth) => {
    await auth.protect();
});

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
    const { pathname } = req.nextUrl;

    // ──────────────────────────────────────────────
    // ADMIN routes → require Clerk authentication
    // ──────────────────────────────────────────────
    if (isAdminRoute(req) || isApiAdminRoute(req)) {
        return clerkAuth(req, event);
    }

    // ──────────────────────────────────────────────
    // API routes → pass through (no auth, no i18n)
    // ──────────────────────────────────────────────
    if (isApiRoute(req)) {
        return NextResponse.next();
    }

    // ──────────────────────────────────────────────
    // PUBLIC routes → only i18n for /en, NO Clerk
    // ──────────────────────────────────────────────
    if (pathname.startsWith('/en') || pathname === '/en') {
        return intlMiddleware(req);
    }

    // Vietnamese root paths — no middleware needed
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Skip Next.js internals and all static files
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
