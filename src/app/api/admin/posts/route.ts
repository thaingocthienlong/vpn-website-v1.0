import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ensureUserExists, requireAdmin } from "@/lib/admin-auth";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody } from "@/lib/validators";
import { adminPostEditorSchema } from "@/lib/admin/schemas";
import { revalidatePostPaths } from "@/lib/admin/revalidation";

async function resolveImageId(imageValue: string | null | undefined, userId: string): Promise<string | null> {
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

export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoryId = searchParams.get("categoryId") || "";

    const where: Record<string, unknown> = {};
    if (search) where.title = { contains: search };
    if (status && status !== "all") where.isPublished = status === "published";
    if (categoryId) where.categoryId = categoryId;

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                author: { select: { id: true, name: true, avatar: true } },
                tags: {
                    include: {
                        tag: { select: { id: true, name: true, slug: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.post.count({ where }),
    ]);

    return successResponse({
        posts,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

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

    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
        return errors.badRequest("A post with the same slug already exists.");
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
        return errors.badRequest("Category not found.");
    }

    const localUserId = await ensureUserExists(authResult.userId);
    const [featuredImageId, featuredImageIdEn] = await Promise.all([
        resolveImageId(featuredImage, authResult.userId),
        resolveImageId(featuredImage_en, authResult.userId),
    ]);

    const post = await prisma.$transaction(async (tx) => {
        const created = await tx.post.create({
            data: {
                title,
                title_en: title_en || null,
                slug,
                excerpt: excerpt || "",
                excerpt_en: excerpt_en || null,
                content,
                content_en: content_en || null,
                categoryId,
                featuredImageId,
                featuredImageId_en: featuredImageIdEn,
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

        if (tagIds.length > 0) {
            await tx.postTag.createMany({
                data: tagIds.map((tagId) => ({
                    postId: created.id,
                    tagId,
                })),
            });
        }

        return created;
    });

    revalidatePostPaths(post.slug, post.category?.slug);

    return successResponse(post, undefined, 201);
}
