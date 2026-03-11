import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    successResponse,
    errors,
    getPaginationParams,
    getLocale,
    buildPaginationMeta,
} from "@/lib/api-response";

/**
 * GET /api/courses
 * List published courses with pagination
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, skip } = getPaginationParams(searchParams);
        const locale = getLocale(searchParams);
        const category = searchParams.get("category");
        const featured = searchParams.get("featured") === "true";
        const type = searchParams.get("type"); // ADMISSION, SHORT_COURSE, STUDY_ABROAD
        const search = searchParams.get("search");

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

        if (type) {
            where.type = type;
        }

        if (search) {
            where.title = { contains: search };
        }

        // Get courses with count
        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { isFeatured: "desc" },
                    { sortOrder: "asc" },
                    { createdAt: "desc" },
                ],
                include: {
                    category: {
                        select: { name: true, name_en: true, slug: true },
                    },
                    featuredImage: {
                        select: { url: true, alt: true },
                    },
                },
            }),
            prisma.course.count({ where }),
        ]);

        // Transform courses based on locale
        const transformedCourses = courses.map((course) => ({
            id: course.id,
            title: locale === "en" && course.title_en ? course.title_en : course.title,
            slug: course.slug,
            excerpt: locale === "en" && course.excerpt_en ? course.excerpt_en : course.excerpt,
            featuredImage: course.featuredImage?.url || null,
            type: course.type,
            isFeatured: course.isFeatured,
            isRegistrationOpen: course.isRegistrationOpen,
            category: course.category ? {
                name: locale === "en" && course.category.name_en
                    ? course.category.name_en
                    : course.category.name,
                slug: course.category.slug,
            } : null,
        }));

        return successResponse(
            transformedCourses,
            buildPaginationMeta(page, limit, total)
        );
    } catch (error) {
        console.error("Error fetching courses:", error);
        return errors.serverError("Không thể tải danh sách khóa học");
    }
}
