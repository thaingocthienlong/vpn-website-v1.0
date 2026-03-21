import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/services - List all services
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const services = await prisma.service.findMany({
        orderBy: { sortOrder: "asc" },
    });

    return jsonSuccess(services);
}

/**
 * POST /api/admin/services - Create service
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { title, title_en, slug, excerpt, excerpt_en, thumbnailUrl, sortOrder = 0, isActive = true } = body;

        if (!title) return jsonError("Title is required", 422);
        if (!slug) return jsonError("Slug is required", 422);

        // Check if slug exists
        const existing = await prisma.service.findUnique({ where: { slug } });
        if (existing) return jsonError("Slug already exists", 409);

        const service = await prisma.service.create({
            data: {
                title,
                title_en: title_en || null,
                slug,
                excerpt: excerpt || null,
                excerpt_en: excerpt_en || null,
                thumbnailUrl: thumbnailUrl || null,
                sortOrder,
                isActive,
            },
        });

        return jsonSuccess(service, 201);
    } catch (error) {
        console.error("Error creating service:", error);
        return jsonError("Failed to create service", 500);
    }
}
