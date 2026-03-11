import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/courses - List courses with search/filter/pagination
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";

    const where: Record<string, unknown> = {};

    if (search) {
        where.title = { contains: search };
    }
    if (status === "published") where.isPublished = true;
    if (status === "draft") where.isPublished = false;
    if (type) where.type = type;

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, slug: true } },
                author: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.course.count({ where }),
    ]);

    return jsonSuccess({
        courses,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
}

/**
 * POST /api/admin/courses - Create course
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const {
            title, title_en, slug, excerpt, excerpt_en, categoryId, type = "SHORT_COURSE",
            featuredImage, isFeatured = false, isPublished = false,
            isRegistrationOpen = true, metaTitle, metaDescription,
            sections, // Array of { title, title_en, content, content_en, sectionKey }
        } = body;

        if (!title || !slug) return jsonError("Title and slug are required", 422);

        const existing = await prisma.course.findUnique({ where: { slug } });
        if (existing) return jsonError("Slug already exists", 409);

        const course = await prisma.course.create({
            data: {
                title,
                title_en: title_en || null,
                slug,
                excerpt: excerpt || "",
                excerpt_en: excerpt_en || null,
                categoryId: categoryId || null,
                type,
                featuredImageId: null,
                authorId: authResult.userId,
                isFeatured,
                isPublished,
                publishedAt: isPublished ? new Date() : null,
                isRegistrationOpen,
                viewCount: 0,
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        // Create content sections if provided
        if (sections && Array.isArray(sections)) {
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                await prisma.contentSection.create({
                    data: {
                        entityType: "COURSE",
                        entityId: course.id,
                        sectionKey: section.sectionKey || `section-${i + 1}`,
                        title: section.title || `Phần ${i + 1}`,
                        title_en: section.title_en || null,
                        content: section.content || "",
                        content_en: section.content_en || null,
                        sortOrder: i,
                    },
                });
            }
        }

        return jsonSuccess(course, 201);
    } catch (error) {
        console.error("Error creating course:", error);
        return jsonError("Failed to create course", 500);
    }
}
