import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/partners/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) return jsonError("Partner not found", 404);

    return jsonSuccess(partner);
}

/**
 * PUT /api/admin/partners/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    try {
        const body = await request.json();
        const { name, name_en, website, description, description_en, sortOrder, isActive, logoId_en } = body;

        const existing = await prisma.partner.findUnique({ where: { id } });
        if (!existing) return jsonError("Partner not found", 404);

        const partner = await prisma.partner.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(name_en !== undefined && { name_en: name_en || null }),
                ...(website !== undefined && { website: website || null }),
                ...(description !== undefined && { description: description || null }),
                ...(description_en !== undefined && { description_en: description_en || null }),
                ...(sortOrder !== undefined && { sortOrder }),
                ...(isActive !== undefined && { isActive }),
                ...(logoId_en !== undefined && { logoId_en: logoId_en || null }),
            },
        });

        return jsonSuccess(partner);
    } catch (error) {
        console.error("Error updating partner:", error);
        return jsonError("Failed to update partner", 500);
    }
}

/**
 * DELETE /api/admin/partners/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    try {
        const existing = await prisma.partner.findUnique({ where: { id } });
        if (!existing) return jsonError("Partner not found", 404);

        await prisma.coursePartner.deleteMany({ where: { partnerId: id } });
        await prisma.partner.delete({ where: { id } });

        return jsonSuccess({ message: "Partner deleted" });
    } catch (error) {
        console.error("Error deleting partner:", error);
        return jsonError(`Failed to delete partner: ${error instanceof Error ? error.message : String(error)}`, 500);
    }
}
