import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, ensureUserExists, jsonSuccess, jsonError } from "@/lib/admin-auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/posts/[id] - Get single post for editing
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            author: { select: { id: true, name: true } },
            featuredImage: { select: { id: true, url: true, alt: true } },
            featuredImage_en: { select: { id: true, url: true, alt: true } },
            tags: {
                include: { tag: { select: { id: true, name: true } } },
            },
        },
    });

    if (!post) {
        return jsonError("Post not found", 404);
    }

    return jsonSuccess(post);
}

/**
 * PUT /api/admin/posts/[id] - Update post
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

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
            featuredImage_en: featuredImageIdEn,
            isFeatured,
            isPublished,
            metaTitle,
            metaTitle_en,
            metaDescription,
            metaDescription_en,
        } = body;

        // Check post exists
        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            return jsonError("Post not found", 404);
        }

        // Check slug uniqueness (if changed)
        if (slug && slug !== existing.slug) {
            const slugExists = await prisma.post.findUnique({ where: { slug } });
            if (slugExists) {
                return jsonError("Slug already exists", 409);
            }
        }

        // Set publishedAt when first published
        let publishedAt = existing.publishedAt;
        if (isPublished && !existing.isPublished) {
            publishedAt = new Date();
        }

        // Helper to resolve image: could be Media ID (UUID) or URL string
        const resolveImage = async (imageVal: string | null | undefined): Promise<string | null | undefined> => {
            if (imageVal === undefined) return undefined;
            if (!imageVal) return null;
            if (imageVal.startsWith("http") || imageVal.startsWith("/")) {
                const userId = await ensureUserExists(authResult.userId);
                const media = await prisma.media.create({
                    data: {
                        filename: imageVal.split("/").pop() || "image",
                        url: imageVal,
                        mimeType: "image/webp",
                        size: 0,
                        uploadedById: userId,
                    },
                });
                return media.id;
            }
            return imageVal;
        };

        const resolvedImageId = await resolveImage(featuredImageId);
        const resolvedImageIdEn = await resolveImage(featuredImageIdEn);

        const post = await prisma.post.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(title_en !== undefined && { title_en: title_en || null }),
                ...(slug !== undefined && { slug }),
                ...(excerpt !== undefined && { excerpt }),
                ...(excerpt_en !== undefined && { excerpt_en: excerpt_en || null }),
                ...(content !== undefined && { content }),
                ...(content_en !== undefined && { content_en: content_en || null }),
                ...(categoryId !== undefined && { categoryId: categoryId || null }),
                ...(resolvedImageId !== undefined && { featuredImageId: resolvedImageId }),
                ...(resolvedImageIdEn !== undefined && { featuredImageId_en: resolvedImageIdEn }),
                ...(isFeatured !== undefined && { isFeatured }),
                ...(isPublished !== undefined && { isPublished }),
                publishedAt,
                ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
                ...(metaTitle_en !== undefined && { metaTitle_en: metaTitle_en || null }),
                ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
                ...(metaDescription_en !== undefined && { metaDescription_en: metaDescription_en || null }),
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        return jsonSuccess(post);
    } catch (error) {
        console.error("Error updating post:", error);
        return jsonError("Failed to update post", 500);
    }
}

/**
 * DELETE /api/admin/posts/[id] - Delete post
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    try {
        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            return jsonError("Post not found", 404);
        }

        // Delete related PostTag records first
        await prisma.postTag.deleteMany({ where: { postId: id } });

        // Delete the post
        await prisma.post.delete({ where: { id } });

        return jsonSuccess({ message: "Post deleted" });
    } catch (error) {
        console.error("Error deleting post:", error);
        return jsonError("Failed to delete post", 500);
    }
}
