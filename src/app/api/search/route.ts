import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";

/**
 * GET /api/search
 * Search across Courses, Posts, and Services
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q");
        const locale = getLocale(searchParams);

        if (!query || query.length < 2) {
            return successResponse({ courses: [], posts: [], services: [] });
        }

        const isEn = locale === "en";

        // Parallel search execution
        const [courses, posts, services] = await Promise.all([
            // Search Courses
            prisma.course.findMany({
                where: {
                    isPublished: true,
                    OR: [
                        { title: { contains: query } },
                        { title_en: { contains: query } },
                        { excerpt: { contains: query } },
                        { excerpt_en: { contains: query } },
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    title_en: true,
                    slug: true,
                    featuredImage: { select: { url: true } },
                },
                take: 5,
            }),

            // Search Posts
            prisma.post.findMany({
                where: {
                    isPublished: true,
                    OR: [
                        { title: { contains: query } },
                        { title_en: { contains: query } },
                        { excerpt: { contains: query } },
                        { excerpt_en: { contains: query } },
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    title_en: true,
                    slug: true,
                    category: { select: { slug: true } },
                    featuredImage: { select: { url: true } },
                    publishedAt: true,
                },
                orderBy: { publishedAt: "desc" },
                take: 5,
            }),

            // Search Services (Pages)
            prisma.page.findMany({
                where: {
                    isPublished: true,
                    // Filter for known service slugs or rely on page type if available
                    // For now we search all pages but in UI we can label them
                    slug: {
                        in: [
                            "nghien-cuu-khoa-hoc",
                            "chuyen-giao-cong-nghe",
                            "phat-trien-nhan-luc",
                            "hop-tac-quoc-te",
                            "tu-van-chinh-sach",
                            "ho-tro-doanh-nghiep",
                        ]
                    },
                    OR: [
                        { title: { contains: query } },
                        { title_en: { contains: query } },
                        { content: { contains: query } },
                        { content_en: { contains: query } },
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    title_en: true,
                    slug: true,
                    featuredImage: { select: { url: true } },
                },
                take: 5,
            }),
        ]);

        // Transform results
        const minResults = {
            courses: courses.map(c => ({
                id: c.id,
                title: isEn && c.title_en ? c.title_en : c.title,
                url: `/${locale}/training/${c.slug}`,
                image: c.featuredImage?.url,
                type: isEn ? "Training" : "Đào tạo"
            })),
            posts: posts.map(p => ({
                id: p.id,
                title: isEn && p.title_en ? p.title_en : p.title,
                url: `/${locale}/news/${p.category.slug}/${p.slug}`,
                image: p.featuredImage?.url,
                type: isEn ? "News" : "Tin tức"
            })),
            services: services.map(s => ({
                id: s.id,
                title: isEn && s.title_en ? s.title_en : s.title,
                url: `/${locale}/services/${s.slug}`,
                image: s.featuredImage?.url,
                type: isEn ? "Service" : "Dịch vụ"
            })),
        };

        return successResponse(minResults);
    } catch (error) {
        console.error("Search error:", error);
        return errors.serverError("Lỗi tìm kiếm");
    }
}
