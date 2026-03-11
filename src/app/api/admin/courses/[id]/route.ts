import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/courses/[id] - Get course with sections for editing
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            author: { select: { id: true, name: true } },
        },
    });

    if (!course) return jsonError("Course not found", 404);

    // Get content sections
    const sections = await prisma.contentSection.findMany({
        where: { entityType: "COURSE", entityId: id },
        orderBy: { sortOrder: "asc" },
    });

    return jsonSuccess({ ...course, sections });
}

/**
 * PUT /api/admin/courses/[id] - Update course and its sections
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    try {
        const body = await request.json();
        const {
            title, title_en, slug, excerpt, excerpt_en, categoryId, type,
            featuredImageId, featuredImageId_en,
            isFeatured, isPublished, isRegistrationOpen,
            metaTitle, metaTitle_en, metaDescription, metaDescription_en, sections,
        } = body;

        const existing = await prisma.course.findUnique({ where: { id } });
        if (!existing) return jsonError("Course not found", 404);

        if (slug && slug !== existing.slug) {
            const slugExists = await prisma.course.findUnique({ where: { slug } });
            if (slugExists) return jsonError("Slug already exists", 409);
        }

        let publishedAt = existing.publishedAt;
        if (isPublished && !existing.isPublished) publishedAt = new Date();

        const course = await prisma.course.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(title_en !== undefined && { title_en: title_en || null }),
                ...(slug !== undefined && { slug }),
                ...(excerpt !== undefined && { excerpt }),
                ...(excerpt_en !== undefined && { excerpt_en: excerpt_en || null }),
                ...(categoryId !== undefined && { categoryId: categoryId || null }),
                ...(type !== undefined && { type }),
                ...(featuredImageId !== undefined && { featuredImageId: featuredImageId || null }),
                ...(featuredImageId_en !== undefined && { featuredImageId_en: featuredImageId_en || null }),
                ...(isFeatured !== undefined && { isFeatured }),
                ...(isPublished !== undefined && { isPublished }),
                publishedAt,
                ...(isRegistrationOpen !== undefined && { isRegistrationOpen }),
                ...(metaTitle !== undefined && { metaTitle: metaTitle || null }),
                ...(metaTitle_en !== undefined && { metaTitle_en: metaTitle_en || null }),
                ...(metaDescription !== undefined && { metaDescription: metaDescription || null }),
                ...(metaDescription_en !== undefined && { metaDescription_en: metaDescription_en || null }),
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        // Update sections if provided
        if (sections && Array.isArray(sections)) {
            // Delete existing sections
            await prisma.contentSection.deleteMany({
                where: { entityType: "COURSE", entityId: id },
            });

            // Create new sections
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                await prisma.contentSection.create({
                    data: {
                        entityType: "COURSE",
                        entityId: id,
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

        return jsonSuccess(course);
    } catch (error) {
        console.error("Error updating course:", error);
        return jsonError("Failed to update course", 500);
    }
}

/**
 * DELETE /api/admin/courses/[id] - Delete course
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    try {
        const existing = await prisma.course.findUnique({ where: { id } });
        if (!existing) return jsonError("Course not found", 404);

        // Delete related records
        await prisma.contentSection.deleteMany({
            where: { entityType: "COURSE", entityId: id },
        });
        await prisma.coursePartner.deleteMany({ where: { courseId: id } });
        await prisma.course.delete({ where: { id } });

        return jsonSuccess({ message: "Course deleted" });
    } catch (error) {
        console.error("Error deleting course:", error);
        return jsonError("Failed to delete course", 500);
    }
}
