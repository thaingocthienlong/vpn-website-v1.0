import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/services - List all service pages
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = { template: "service" };
    if (search) where.title = { contains: search };

    const services = await prisma.page.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        include: {
            featuredImage: { select: { id: true, url: true, alt: true } },
        },
    });

    return jsonSuccess(services);
}

/**
 * POST /api/admin/services - Create a new service page
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const {
            title, title_en, slug, content, content_en, isPublished = false, sortOrder = 0,
            metaTitle, metaDescription,
        } = body;

        if (!title || !slug) {
            return jsonError("Title and slug are required", 422);
        }

        const existing = await prisma.page.findUnique({ where: { slug } });
        if (existing) return jsonError("Slug already exists", 409);

        const service = await prisma.page.create({
            data: {
                title,
                title_en: title_en || null,
                slug,
                content: content || "",
                content_en: content_en || null,
                template: "service",
                isPublished,
                sortOrder,
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
                authorId: authResult.userId,
            },
        });

        return jsonSuccess(service, 201);
    } catch (error) {
        console.error("Error creating service:", error);
        return jsonError("Failed to create service", 500);
    }
}
