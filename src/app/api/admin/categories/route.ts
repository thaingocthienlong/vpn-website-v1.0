import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/categories - List categories (for select dropdowns)
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || "";

    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const categories = await prisma.category.findMany({
        where,
        orderBy: { sortOrder: "asc" },
    });

    return jsonSuccess(categories);
}

/**
 * POST /api/admin/categories - Create category
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { name, name_en, slug, type = "POST", description, sortOrder = 0 } = body;

        if (!name || !slug) return jsonError("Name and slug are required", 422);

        const existing = await prisma.category.findUnique({ where: { slug } });
        if (existing) return jsonError("Slug already exists", 409);

        const category = await prisma.category.create({
            data: { name, name_en: name_en || null, slug, type, description: description || null, sortOrder },
        });

        return jsonSuccess(category, 201);
    } catch (error) {
        console.error("Error creating category:", error);
        return jsonError("Failed to create category", 500);
    }
}
