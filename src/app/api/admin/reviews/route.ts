import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/reviews - List all reviews
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const reviews = await prisma.review.findMany({
        orderBy: { sortOrder: "asc" },
        include: { avatar: true },
    });

    return jsonSuccess(reviews);
}

/**
 * POST /api/admin/reviews - Create review
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { name, role, company, content, content_en, avatarId, rating = 5, sortOrder = 0, isActive = true } = body;

        if (!name) return jsonError("Name is required", 422);
        if (!content) return jsonError("Content is required", 422);

        const review = await prisma.review.create({
            data: {
                name,
                role: role || null,
                company: company || null,
                content,
                content_en: content_en || null,
                avatarId: avatarId || null,
                rating,
                sortOrder,
                isActive,
            },
            include: { avatar: true },
        });

        return jsonSuccess(review, 201);
    } catch (error) {
        console.error("Error creating review:", error);
        return jsonError("Failed to create review", 500);
    }
}
