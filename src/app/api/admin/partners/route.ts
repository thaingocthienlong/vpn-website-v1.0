import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/partners - List all partners
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const partners = await prisma.partner.findMany({
        orderBy: { sortOrder: "asc" },
    });

    return jsonSuccess(partners);
}

/**
 * POST /api/admin/partners - Create partner
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { name, name_en, website, description, description_en, sortOrder = 0, isActive = true } = body;

        if (!name) return jsonError("Name is required", 422);

        const partner = await prisma.partner.create({
            data: {
                name,
                name_en: name_en || null,
                website: website || null,
                description: description || null,
                description_en: description_en || null,
                sortOrder,
                isActive,
            },
        });

        return jsonSuccess(partner, 201);
    } catch (error) {
        console.error("Error creating partner:", error);
        return jsonError("Failed to create partner", 500);
    }
}
