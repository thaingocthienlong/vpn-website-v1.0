import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/services/[id] - Get service
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const service = await prisma.service.findUnique({
            where: { id: params.id },
        });

        if (!service) return jsonError("Service not found", 404);

        return jsonSuccess(service);
    } catch (error) {
        console.error("Error fetching service:", error);
        return jsonError("Failed to fetch service", 500);
    }
}

/**
 * PUT /api/admin/services/[id] - Update service
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { title, title_en, slug, excerpt, excerpt_en, iconName, sortOrder, isActive } = body;

        // Check if slug exists on another record
        if (slug) {
            const existing = await prisma.service.findFirst({
                where: { slug, id: { not: params.id } },
            });
            if (existing) return jsonError("Slug already exists", 409);
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (title_en !== undefined) updateData.title_en = title_en || null;
        if (slug !== undefined) updateData.slug = slug;
        if (excerpt !== undefined) updateData.excerpt = excerpt || null;
        if (excerpt_en !== undefined) updateData.excerpt_en = excerpt_en || null;
        if (iconName !== undefined) updateData.iconName = iconName || null;
        if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
        if (isActive !== undefined) updateData.isActive = isActive;

        const service = await prisma.service.update({
            where: { id: params.id },
            data: updateData,
        });

        return jsonSuccess(service);
    } catch (error) {
        console.error("Error updating service:", error);
        return jsonError("Failed to update service", 500);
    }
}

/**
 * DELETE /api/admin/services/[id] - Delete service
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        await prisma.service.delete({
            where: { id: params.id },
        });

        return jsonSuccess({ success: true });
    } catch (error) {
        console.error("Error deleting service:", error);
        return jsonError("Failed to delete service", 500);
    }
}
