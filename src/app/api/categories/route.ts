import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { normalizePlainText } from "@/lib/preview-text";

function isMissingSqliteTableError(error: unknown) {
    return error instanceof Error && error.message.includes("SQLITE_ERROR: no such table");
}

/**
 * GET /api/categories
 * List categories with optional type filter and post count
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);
        const type = searchParams.get("type"); // POST, COURSE, ADMISSION

        // Build where clause
        const where: Record<string, unknown> = {
            isActive: true,
        };

        if (type) {
            where.type = type;
        }

        // Get categories with post count
        const categories = await prisma.category.findMany({
            where,
            orderBy: { sortOrder: "asc" },
            include: {
                _count: {
                    select: {
                        posts: {
                            where: { isPublished: true },
                        },
                    },
                },
            },
        });

        // Transform categories based on locale
        const transformedCategories = categories.map((cat) => ({
            id: cat.id,
            name: normalizePlainText(locale === "en" && cat.name_en ? cat.name_en : cat.name) || cat.name,
            slug: cat.slug,
            type: cat.type,
            postCount: cat._count.posts,
        }));

        return successResponse(transformedCategories);
    } catch (error) {
        if (isMissingSqliteTableError(error)) {
            return successResponse([]);
        }
        console.error("Error fetching categories:", error);
        return errors.serverError("Không thể tải danh mục");
    }
}
