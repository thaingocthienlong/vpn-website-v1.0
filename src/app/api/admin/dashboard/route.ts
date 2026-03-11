import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/dashboard - Dashboard stats
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const [
            totalPosts,
            totalCourses,
            totalRegistrations,
            pendingContacts,
            totalStaff,
            totalPartners,
            recentRegistrations,
            recentContacts,
        ] = await Promise.all([
            prisma.post.count(),
            prisma.course.count(),
            prisma.registration.count(),
            prisma.contactForm.count({ where: { status: "NEW" } }),
            prisma.staff.count({ where: { isActive: true } }),
            prisma.partner.count({ where: { isActive: true } }),
            prisma.registration.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    course: { select: { title: true, slug: true } },
                },
            }),
            prisma.contactForm.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        return jsonSuccess({
            stats: {
                totalPosts,
                totalCourses,
                totalRegistrations,
                pendingContacts,
                totalStaff,
                totalPartners,
            },
            recentRegistrations,
            recentContacts,
        });
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return jsonError("Failed to fetch dashboard stats", 500);
    }
}
