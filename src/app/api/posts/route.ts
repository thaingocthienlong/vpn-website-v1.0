import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    successResponse,
    errors,
    getPaginationParams,
    getLocale,
    buildPaginationMeta,
} from "@/lib/api-response";
import { normalizePreviewText } from "@/lib/preview-text";

function isMissingSqliteTableError(error: unknown) {
    return error instanceof Error && error.message.includes("SQLITE_ERROR: no such table");
}

/**
 * GET /api/posts
 * List published posts with pagination
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, skip } = getPaginationParams(searchParams);
        const locale = getLocale(searchParams);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured") === "true";

        // Build where clause
        const where: Record<string, unknown> = {
            isPublished: true,
        };

        if (category) {
            where.category = { slug: category };
        }

        if (featured) {
            where.isFeatured = true;
        }

        // Get posts with count
        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { isFeatured: "desc" },
                    { publishedAt: "desc" },
                ],
                include: {
                    category: {
                        select: { name: true, name_en: true, slug: true },
                    },
                    author: {
                        select: { name: true },
                    },
                    featuredImage: {
                        select: { url: true, alt: true },
                    },
                },
            }),
            prisma.post.count({ where }),
        ]);

        // Transform posts based on locale
        const transformedPosts = posts.map((post) => ({
            id: post.id,
            title: normalizePreviewText(locale === "en" && post.title_en ? post.title_en : post.title) || post.title,
            slug: post.slug,
            excerpt: normalizePreviewText(locale === "en" && post.excerpt_en ? post.excerpt_en : post.excerpt),
            featuredImage: post.featuredImage?.url || null,
            category: {
                name: normalizePreviewText(
                    locale === "en" && post.category.name_en
                        ? post.category.name_en
                        : post.category.name
                ) || post.category.name,
                slug: post.category.slug,
            },
            author: { name: post.author.name },
            publishedAt: post.publishedAt,
            viewCount: post.viewCount,
            isFeatured: post.isFeatured,
        }));

        return successResponse(
            transformedPosts,
            buildPaginationMeta(page, limit, total)
        );
    } catch (error) {
        if (isMissingSqliteTableError(error)) {
            const fallbackPage = Math.max(1, parseInt(new URL(request.url).searchParams.get("page") || "1", 10));
            const fallbackLimit = Math.min(100, Math.max(1, parseInt(new URL(request.url).searchParams.get("limit") || "12", 10)));
            return successResponse([], buildPaginationMeta(fallbackPage, fallbackLimit, 0));
        }
        console.error("Error fetching posts:", error);
        return errors.serverError("Không thể tải danh sách bài viết");
    }
}
