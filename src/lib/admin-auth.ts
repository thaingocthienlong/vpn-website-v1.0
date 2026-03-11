import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Verify admin authentication for API routes.
 * Returns userId if authenticated, or a 401 response if not.
 */
export async function requireAdmin(): Promise<
    { userId: string } | { error: NextResponse }
> {
    const { userId } = await auth();

    if (!userId) {
        return {
            error: NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            ),
        };
    }

    return { userId };
}

/**
 * Ensure the Clerk user exists in the local User table.
 * Creates or updates the user record so FK constraints are satisfied.
 * Returns the local user ID (same as Clerk userId).
 */
export async function ensureUserExists(clerkUserId: string): Promise<string> {
    const existing = await prisma.user.findUnique({ where: { id: clerkUserId } });
    if (existing) return existing.id;

    // Fetch user info from Clerk
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkUserId}@clerk.local`;
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "Admin";

    const user = await prisma.user.create({
        data: {
            id: clerkUserId,
            email,
            name,
            password: "clerk-managed",
            role: "SUPER_ADMIN",
            isActive: true,
        },
    });

    return user.id;
}

/**
 * Standard JSON success response
 */
export function jsonSuccess(data: unknown, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

/**
 * Standard JSON error response
 */
export function jsonError(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status });
}
