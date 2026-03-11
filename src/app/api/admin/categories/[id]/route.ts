import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/categories/[id]
 * Get single category
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const { id } = await params;
        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            return jsonError("Category not found", 404);
        }

        return jsonSuccess(category);
    } catch (error) {
        console.error("Error fetching category:", error);
        return jsonError("Failed to fetch category", 500);
    }
}

/**
 * PUT /api/admin/categories/[id]
 * Update category
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const { id } = await params;
        const body = await request.json();
        const { name, name_en, slug, type, description, sortOrder } = body;

        if (!name || !slug) {
            return jsonError("Name and slug are required", 400);
        }

        const existing = await prisma.category.findUnique({
            where: { id },
        });

        if (!existing) {
            return jsonError("Category not found", 404);
        }

        // Check if slug exists (exclude current)
        const slugExist = await prisma.category.findUnique({
            where: { slug },
        });
        if (slugExist && slugExist.id !== id) {
            return jsonError("Slug already exists", 409);
        }

        const category = await prisma.category.update({
            where: { id },
            data: {
                name,
                name_en: name_en || null,
                slug,
                type: type || existing.type,
                description: description || null,
                sortOrder: sortOrder || 0,
            },
        });

        return jsonSuccess(category);
    } catch (error) {
        console.error("Error updating category:", error);
        return jsonError("Failed to update category", 500);
    }
}

/**
 * DELETE /api/admin/categories/[id]
 * Delete category
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const { id } = await params;

        // Check for related records (posts, courses)?
        // Prisma might handle this or throw error if restricted.
        // For simplicity, we try to delete.

        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) return jsonError("Category not found", 404);

        await prisma.category.delete({ where: { id } });

        return jsonSuccess({ message: "Category deleted" });
    } catch (error) {
        console.error("Error deleting category:", error);
        return jsonError("Failed to delete category (might be in use)", 500);
    }
}
