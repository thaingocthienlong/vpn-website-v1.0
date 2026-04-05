import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { normalizePlainText, normalizePreviewText } from "@/lib/preview-text";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/courses/[slug]
 * Get single course by slug with dynamic sections (TOC)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);

        const course = await prisma.course.findFirst({
            where: {
                slug,
                isPublished: true,
            },
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
                partners: {
                    include: {
                        partner: {
                            select: { id: true, name: true, name_en: true, logo: true, website: true },
                        },
                    },
                },
            },
        });

        if (!course) {
            return errors.notFound("Khóa học");
        }

        // Get dynamic content sections for this course
        const sections = await prisma.contentSection.findMany({
            where: {
                entityType: "COURSE",
                entityId: course.id,
                isActive: true,
            },
            orderBy: { sortOrder: "asc" },
        });

        // Build Table of Contents
        const toc = sections.map((section) => ({
            key: section.sectionKey,
            title: normalizePlainText(locale === "en" && section.title_en ? section.title_en : section.title) || section.title,
        }));

        // Transform sections based on locale
        const transformedSections = sections.map((section) => ({
            id: section.id,
            key: section.sectionKey,
            title: normalizePlainText(locale === "en" && section.title_en ? section.title_en : section.title) || section.title,
            content: locale === "en" && section.content_en ? section.content_en : section.content,
        }));

        // Transform course based on locale
        const transformedCourse = {
            id: course.id,
            title: normalizePlainText(locale === "en" && course.title_en ? course.title_en : course.title) || course.title,
            slug: course.slug,
            excerpt: normalizePreviewText(locale === "en" && course.excerpt_en ? course.excerpt_en : course.excerpt),
            featuredImage: course.featuredImage?.url || null,
            type: course.type,
            isFeatured: course.isFeatured,
            isRegistrationOpen: course.isRegistrationOpen,
            category: course.category ? {
                name: normalizePlainText(
                    locale === "en" && course.category.name_en
                        ? course.category.name_en
                        : course.category.name
                ) || course.category.name,
                slug: course.category.slug,
            } : null,
            author: { name: course.author.name },
            partners: course.partners.map((cp) => ({
                id: cp.partner.id,
                name: normalizePlainText(
                    locale === "en" && cp.partner.name_en
                        ? cp.partner.name_en
                        : cp.partner.name
                ) || cp.partner.name,
                logo: cp.partner.logo,
                website: cp.partner.website,
            })),
            toc,
            sections: transformedSections,
            seo: {
                metaTitle: normalizePlainText(course.metaTitle) || normalizePlainText(course.title) || course.title,
                metaDescription: normalizePreviewText(course.metaDescription) || normalizePreviewText(course.excerpt),
            },
        };

        return successResponse(transformedCourse);
    } catch (error) {
        console.error("Error fetching course:", error);
        return errors.serverError("Không thể tải khóa học");
    }
}
