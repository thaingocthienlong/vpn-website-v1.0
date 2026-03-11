import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, ensureUserExists, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/posts - List all posts with search, filter, pagination
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";

    const where: Record<string, unknown> = {};

    if (search) {
        where.title = { contains: search };
    }
    if (status && status !== "all") {
        where.isPublished = status === "published";
    }
    if (categoryId) {
        where.categoryId = categoryId;
    }

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                author: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.post.count({ where }),
    ]);

    return jsonSuccess({
        posts,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

/**
 * POST /api/admin/posts - Create new post
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const {
            title,
            title_en,
            slug,
            excerpt,
            excerpt_en,
            content,
            content_en,
            categoryId,
            featuredImage: featuredImageId,
            isFeatured = false,
            isPublished = false,
            metaTitle,
            metaTitle_en,
            metaDescription,
            metaDescription_en,
        } = body;

        // Validation
        if (!title || !slug) {
            return jsonError("Title and slug are required", 422);
        }
        if (!categoryId) {
            return jsonError("Category is required", 422);
        }

        // Check slug uniqueness
        const existingPost = await prisma.post.findUnique({ where: { slug } });
        if (existingPost) {
            return jsonError("Slug already exists", 409);
        }

        // Ensure the Clerk user exists in local DB
        const localUserId = await ensureUserExists(authResult.userId);

        // Handle featuredImage: could be a Media ID (UUID) or a URL string
        let resolvedImageId: string | null = null;
        if (featuredImageId) {
            // Check if it looks like a URL (starts with http or /)
            if (featuredImageId.startsWith("http") || featuredImageId.startsWith("/")) {
                // Create a Media record from the URL
                const media = await prisma.media.create({
                    data: {
                        filename: featuredImageId.split("/").pop() || "image",
                        url: featuredImageId,
                        mimeType: "image/webp",
                        size: 0,
                        uploadedById: localUserId,
                    },
                });
                resolvedImageId = media.id;
            } else {
                // Assume it's already a valid Media UUID
                resolvedImageId = featuredImageId;
            }
        }

        const post = await prisma.post.create({
            data: {
                title,
                title_en: title_en || null,
                slug,
                excerpt: excerpt || "",
                excerpt_en: excerpt_en || null,
                content: content || "",
                content_en: content_en || null,
                categoryId,
                featuredImageId: resolvedImageId,
                isFeatured,
                isPublished,
                publishedAt: isPublished ? new Date() : null,
                metaTitle: metaTitle || null,
                metaTitle_en: metaTitle_en || null,
                metaDescription: metaDescription || null,
                metaDescription_en: metaDescription_en || null,
                authorId: localUserId,
                viewCount: 0,
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        return jsonSuccess(post, 201);
    } catch (error) {
        console.error("Error creating post:", error);
        return jsonError("Failed to create post", 500);
    }
}
