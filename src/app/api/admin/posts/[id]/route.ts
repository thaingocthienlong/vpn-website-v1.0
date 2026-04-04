import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ensureUserExists, requireAdmin } from "@/lib/admin-auth";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody } from "@/lib/validators";
import { adminPostEditorSchema } from "@/lib/admin/schemas";
import { revalidatePostPaths } from "@/lib/admin/revalidation";

type RouteParams = { params: Promise<{ id: string }> };

async function resolveImageId(
    imageValue: string | null | undefined,
    userId: string,
): Promise<string | null | undefined> {
    if (imageValue === undefined) return undefined;
    if (!imageValue) return null;
    if (!imageValue.startsWith("http") && !imageValue.startsWith("/")) {
        return imageValue;
    }

    const localUserId = await ensureUserExists(userId);
    const media = await prisma.media.create({
        data: {
            filename: imageValue.split("/").pop() || "image",
            url: imageValue,
            mimeType: "image/webp",
            size: 0,
            uploadedById: localUserId,
        },
    });

    return media.id;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
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
                include: { tag: { select: { id: true, name: true, slug: true } } },
            },
        },
    });

    if (!post) {
        return errors.notFound("Post");
    }

    return successResponse(post);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const existing = await prisma.post.findUnique({
        where: { id },
        include: {
            category: { select: { slug: true } },
        },
    });

    if (!existing) {
        return errors.notFound("Post");
    }

    const validation = await validateBody(request, adminPostEditorSchema);
    if (!validation.success) {
        return errors.validationError(validation.errors);
    }

    const {
        title,
        title_en,
        slug,
        excerpt,
        excerpt_en,
        content,
        content_en,
        categoryId,
        featuredImage,
        featuredImage_en,
        isFeatured,
        isPublished,
        metaTitle,
        metaTitle_en,
        metaDescription,
        metaDescription_en,
        tagIds,
    } = validation.data;

    if (slug !== existing.slug) {
        const slugExists = await prisma.post.findUnique({ where: { slug } });
        if (slugExists) {
            return errors.badRequest("A post with the same slug already exists.");
        }
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
        return errors.badRequest("Category not found.");
    }

    let publishedAt = existing.publishedAt;
    if (isPublished && !existing.isPublished) {
        publishedAt = new Date();
    }

    const [featuredImageId, featuredImageIdEn] = await Promise.all([
        resolveImageId(featuredImage, authResult.userId),
        resolveImageId(featuredImage_en, authResult.userId),
    ]);

    const post = await prisma.$transaction(async (tx) => {
        const updated = await tx.post.update({
            where: { id },
            data: {
                title,
                title_en: title_en || null,
                slug,
                excerpt: excerpt || "",
                excerpt_en: excerpt_en || null,
                content,
                content_en: content_en || null,
                categoryId,
                ...(featuredImageId !== undefined && { featuredImageId }),
                ...(featuredImageIdEn !== undefined && { featuredImageId_en: featuredImageIdEn }),
                isFeatured,
                isPublished,
                publishedAt,
                metaTitle: metaTitle || null,
                metaTitle_en: metaTitle_en || null,
                metaDescription: metaDescription || null,
                metaDescription_en: metaDescription_en || null,
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        await tx.postTag.deleteMany({ where: { postId: id } });
        if (tagIds.length > 0) {
            await tx.postTag.createMany({
                data: tagIds.map((tagId) => ({
                    postId: id,
                    tagId,
                })),
            });
        }

        return updated;
    });

    revalidatePostPaths(existing.slug, existing.category?.slug);
    revalidatePostPaths(post.slug, post.category?.slug);

    return successResponse(post);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const existing = await prisma.post.findUnique({
        where: { id },
        include: {
            category: { select: { slug: true } },
        },
    });

    if (!existing) {
        return errors.notFound("Post");
    }

    await prisma.$transaction([
        prisma.postTag.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
    ]);

    revalidatePostPaths(existing.slug, existing.category?.slug);

    return successResponse({ deleted: true });
}
