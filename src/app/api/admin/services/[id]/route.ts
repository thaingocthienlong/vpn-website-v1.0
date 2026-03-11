import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/services/[id] - Get single service
 */
export async function GET(_request: NextRequest, { params }: Params) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const service = await prisma.page.findFirst({
        where: { id, template: "service" },
        include: {
            featuredImage: { select: { id: true, url: true, alt: true } },
        },
    });

    if (!service) return jsonError("Service not found", 404);
    return jsonSuccess(service);
}

/**
 * PUT /api/admin/services/[id] - Update service
 */
export async function PUT(request: NextRequest, { params }: Params) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    try {
        const body = await request.json();
        const {
            title, title_en, slug, content, content_en, isPublished, sortOrder,
            metaTitle, metaDescription,
        } = body;

        const service = await prisma.page.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(title_en !== undefined && { title_en: title_en || null }),
                ...(slug !== undefined && { slug }),
                ...(content !== undefined && { content }),
                ...(content_en !== undefined && { content_en: content_en || null }),
                ...(isPublished !== undefined && { isPublished }),
                ...(sortOrder !== undefined && { sortOrder }),
                ...(metaTitle !== undefined && { metaTitle }),
                ...(metaDescription !== undefined && { metaDescription }),
            },
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
export async function DELETE(_request: NextRequest, { params }: Params) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    try {
        await prisma.page.delete({ where: { id } });
        return jsonSuccess({ deleted: true });
    } catch (error) {
        console.error("Error deleting service:", error);
        return jsonError("Failed to delete service", 500);
    }
}
