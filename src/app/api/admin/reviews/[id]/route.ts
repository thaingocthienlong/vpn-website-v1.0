import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/reviews/[id] - Get review
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const review = await prisma.review.findUnique({
            where: { id: params.id },
            include: { avatar: true },
        });

        if (!review) return jsonError("Review not found", 404);

        return jsonSuccess(review);
    } catch (error) {
        console.error("Error fetching review:", error);
        return jsonError("Failed to fetch review", 500);
    }
}

/**
 * PUT /api/admin/reviews/[id] - Update review
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { name, role, company, content, content_en, avatarId, rating, sortOrder, isActive } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role || null;
        if (company !== undefined) updateData.company = company || null;
        if (content !== undefined) updateData.content = content;
        if (content_en !== undefined) updateData.content_en = content_en || null;
        if (avatarId !== undefined) updateData.avatarId = avatarId || null;
        if (rating !== undefined) updateData.rating = rating;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
        if (isActive !== undefined) updateData.isActive = isActive;

        const review = await prisma.review.update({
            where: { id: params.id },
            data: updateData,
            include: { avatar: true },
        });

        return jsonSuccess(review);
    } catch (error) {
        console.error("Error updating review:", error);
        return jsonError("Failed to update review", 500);
    }
}

/**
 * DELETE /api/admin/reviews/[id] - Delete review
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        await prisma.review.delete({
            where: { id: params.id },
        });

        // Prisma automatically handles deleting relations

        return jsonSuccess({ success: true });
    } catch (error) {
        console.error("Error deleting review:", error);
        return jsonError("Failed to delete review", 500);
    }
}
