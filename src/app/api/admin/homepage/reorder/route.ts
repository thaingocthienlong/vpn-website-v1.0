import { NextRequest } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * PUT /api/admin/homepage/reorder - Update sort orders of multiple sections
 * Expects: { items: { id: string, sortOrder: number }[] }
 */
export async function PUT(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { items } = body;

        if (!Array.isArray(items)) {
            return jsonError("Expected 'items' array in request body", 400);
        }

        // Perform updates in a transaction to ensure all or nothing
        await prisma.$transaction(
            items.map((item: { id: string; sortOrder: number }) =>
                prisma.homepageSection.update({
                    where: { id: item.id },
                    data: { sortOrder: item.sortOrder },
                })
            )
        );

        revalidateTag("homepage_sections");
        revalidatePath("/", "layout");

        return jsonSuccess({ message: "Sort order updated successfully" });
    } catch (error) {
        console.error("Error updating homepage section sort orders:", error);
        return jsonError("Failed to update sort orders", 500);
    }
}
