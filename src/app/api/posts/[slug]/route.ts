import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { normalizePreviewText } from "@/lib/preview-text";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/posts/[slug]
 * Get single post by slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);

        const post = await prisma.post.findFirst({
            where: {
                slug,
                isPublished: true,
            },
            include: {
                category: {
                    select: { name: true, name_en: true, slug: true },
                },
                author: {
                    select: { name: true, avatar: true },
                },
                featuredImage: {
                    select: { url: true, alt: true },
                },
                tags: {
                    include: {
                        tag: { select: { name: true, slug: true } },
                    },
                },
            },
        });

        if (!post) {
            return errors.notFound("Bài viết");
        }

        // Update view count (fire and forget)
        prisma.post.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } },
        }).catch(() => { });

        // Get related posts from same category
        const relatedPosts = await prisma.post.findMany({
            where: {
                isPublished: true,
                categoryId: post.categoryId,
                id: { not: post.id },
            },
            take: 4,
            orderBy: { publishedAt: "desc" },
            select: {
                id: true,
                title: true,
                title_en: true,
                slug: true,
                excerpt: true,
                excerpt_en: true,
                publishedAt: true,
                featuredImage: {
                    select: { url: true },
                },
            },
        });

        // Transform post based on locale
        const transformedPost = {
            id: post.id,
            title: normalizePreviewText(locale === "en" && post.title_en ? post.title_en : post.title) || post.title,
            slug: post.slug,
            content: locale === "en" && post.content_en ? post.content_en : post.content,
            excerpt: normalizePreviewText(locale === "en" && post.excerpt_en ? post.excerpt_en : post.excerpt),
            featuredImage: post.featuredImage ? { url: post.featuredImage.url, alt: post.featuredImage.alt } : null,
            category: {
                name: normalizePreviewText(
                    locale === "en" && post.category.name_en
                        ? post.category.name_en
                        : post.category.name
                ) || post.category.name,
                slug: post.category.slug,
            },
            tags: post.tags.map((pt) => ({
                name: pt.tag.name,
                slug: pt.tag.slug,
            })),
            author: {
                name: post.author.name,
                avatar: post.author.avatar,
            },
            publishedAt: post.publishedAt,
            viewCount: post.viewCount + 1,
            type: post.type,
            sourceUrl: post.sourceUrl,
            seo: {
                metaTitle: normalizePreviewText(post.metaTitle) || normalizePreviewText(post.title) || post.title,
                metaDescription: normalizePreviewText(post.metaDescription) || normalizePreviewText(post.excerpt),
            },
            relatedPosts: relatedPosts.map((rp) => ({
                id: rp.id,
                title: normalizePreviewText(locale === "en" && rp.title_en ? rp.title_en : rp.title) || rp.title,
                slug: rp.slug,
                excerpt: normalizePreviewText(locale === "en" && rp.excerpt_en ? rp.excerpt_en : rp.excerpt),
                featuredImage: rp.featuredImage?.url || null,
                publishedAt: rp.publishedAt,
            })),
        };

        return successResponse(transformedPost);
    } catch (error) {
        console.error("Error fetching post:", error);
        return errors.serverError("Không thể tải bài viết");
    }
}
