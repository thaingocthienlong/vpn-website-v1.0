import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/services/[slug]
 * Get single service page by slug with dynamic sections (TOC)
 * Services are stored as Pages with ContentSections of entityType=SERVICE
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);

        // Services are stored as Pages
        const service = await prisma.page.findFirst({
            where: {
                slug,
                isPublished: true,
            },
            include: {
                featuredImage: {
                    select: { url: true, alt: true, alt_en: true },
                },
                author: {
                    select: { name: true },
                },
            },
        });

        if (!service) {
            return errors.notFound("Dịch vụ");
        }

        // Get dynamic content sections for this service
        const sections = await prisma.contentSection.findMany({
            where: {
                entityType: "SERVICE",
                entityId: service.id,
                isActive: true,
            },
            orderBy: { sortOrder: "asc" },
        });

        // Build Table of Contents
        const toc = sections.map((section) => ({
            key: section.sectionKey,
            title: locale === "en" && section.title_en ? section.title_en : section.title,
        }));

        // Transform sections based on locale
        const transformedSections = sections.map((section) => ({
            id: section.id,
            key: section.sectionKey,
            title: locale === "en" && section.title_en ? section.title_en : section.title,
            content: locale === "en" && section.content_en ? section.content_en : section.content,
        }));

        // Transform service based on locale
        const transformedService = {
            id: service.id,
            title: locale === "en" && service.title_en ? service.title_en : service.title,
            slug: service.slug,
            excerpt: locale === "en" && service.content_en
                ? service.content_en.substring(0, 300)
                : service.content?.substring(0, 300) || "",
            content: locale === "en" && service.content_en ? service.content_en : service.content,
            featuredImage: service.featuredImage?.url || null,
            toc,
            sections: transformedSections,
            seo: {
                metaTitle: service.metaTitle || service.title,
                metaDescription: service.metaDescription || service.content?.substring(0, 160),
            },
        };

        return successResponse(transformedService);
    } catch (error) {
        console.error("Error fetching service:", error);
        return errors.serverError("Không thể tải dịch vụ");
    }
}
