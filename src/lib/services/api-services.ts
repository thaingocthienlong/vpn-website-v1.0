import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/config";
import { optimizeCloudinaryUrl, ImageSizes } from "@/lib/cloudinary";

type CourseType = "ADMISSION" | "SHORT_COURSE" | "STUDY_ABROAD";

/**
 * Service to fetch featured posts directly from the database for SSR
 * Retrieves localized data based on the provided locale
 */
export async function getFeaturedPosts(locale: Locale = 'vi', limit: number = 4) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                isPublished: true,
                isFeatured: true,
            },
            take: limit,
            orderBy: [
                { isFeatured: "desc" },
                { publishedAt: "desc" },
            ],
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
            },
        });

        return posts.map((post) => ({
            id: post.id,
            title: locale === "en" && post.title_en ? post.title_en : post.title,
            slug: post.slug,
            excerpt: locale === "en" && post.excerpt_en ? post.excerpt_en : post.excerpt,
            featuredImage: optimizeCloudinaryUrl(post.featuredImage?.url || null, ImageSizes.POST_THUMBNAIL),
            category: {
                name: locale === "en" && post.category.name_en
                    ? post.category.name_en
                    : post.category.name,
                slug: post.category.slug,
            },
            author: { name: post.author.name },
            publishedAt: post.publishedAt,
            viewCount: post.viewCount,
            isFeatured: post.isFeatured,
        }));
    } catch (error) {
        console.error("Error fetching featured posts via service:", error);
        return [];
    }
}

/**
 * Service to fetch featured courses directly from the database for SSR
 */
export async function getFeaturedCourses(locale: Locale = 'vi', limit: number = 9) {
    try {
        const courses = await prisma.course.findMany({
            where: {
                isPublished: true,
                isFeatured: true,
            },
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
        });

        return courses.map((course) => ({
            id: course.id,
            title: locale === "en" && course.title_en ? course.title_en : course.title,
            slug: course.slug,
            excerpt: locale === "en" && course.excerpt_en ? course.excerpt_en : course.excerpt,
            featuredImage: optimizeCloudinaryUrl(course.featuredImage?.url || null, ImageSizes.CARD_THUMBNAIL),
            type: course.type as CourseType,
            isFeatured: course.isFeatured,
            isRegistrationOpen: course.isRegistrationOpen,
            category: course.category ? {
                name: locale === "en" && course.category.name_en
                    ? course.category.name_en
                    : course.category.name,
                slug: course.category.slug,
            } : null,
        }));
    } catch (error) {
        console.error("Error fetching featured courses via service:", error);
        return [];
    }
}

/**
 * Service to fetch active partners directly from the database for SSR
 */
export async function getActivePartners(locale: Locale = 'vi') {
    try {
        const partners = await prisma.partner.findMany({
            where: {
                isActive: true,
            },
            orderBy: { sortOrder: "asc" },
            include: {
                logo: {
                    select: { url: true, alt: true },
                },
            },
        });

        return partners.map((partner) => ({
            id: partner.id,
            name: locale === "en" && partner.name_en ? partner.name_en : partner.name,
            logo: optimizeCloudinaryUrl(partner.logo?.url || null, ImageSizes.PARTNER_LOGO),
            website: partner.website,
            description: locale === "en" && partner.description_en
                ? partner.description_en
                : partner.description,
        }));
    } catch (error) {
        console.error("Error fetching partners via service:", error);
        return [];
    }
}

/**
 * Service to fetch a single course by slug with sections and TOC for SSR
 */
export async function getCourseBySlug(slug: string, locale: Locale = 'vi') {
    try {
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
                            select: { id: true, name: true, name_en: true, website: true },
                            // Note: logo field is a relation in partners table
                        },
                    },
                },
            },
        });

        if (!course) return null;

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
            title: locale === "en" && section.title_en ? section.title_en : section.title,
        }));

        // Transform sections based on locale
        const transformedSections = sections.map((section) => ({
            id: section.id,
            key: section.sectionKey,
            title: locale === "en" && section.title_en ? section.title_en : section.title,
            content: locale === "en" && section.content_en ? section.content_en : section.content,
        }));

        return {
            id: course.id,
            title: locale === "en" && course.title_en ? course.title_en : course.title,
            slug: course.slug,
            excerpt: locale === "en" && course.excerpt_en ? course.excerpt_en : course.excerpt,
            featuredImage: optimizeCloudinaryUrl(course.featuredImage?.url || null, ImageSizes.HERO),
            type: course.type as CourseType,
            isFeatured: course.isFeatured,
            isRegistrationOpen: course.isRegistrationOpen,
            category: course.category ? {
                name: locale === "en" && course.category.name_en
                    ? course.category.name_en
                    : course.category.name,
                slug: course.category.slug,
            } : null,
            author: { name: course.author.name },
            partners: course.partners.map((cp) => ({
                id: cp.partner.id,
                name: locale === "en" && cp.partner.name_en
                    ? cp.partner.name_en
                    : cp.partner.name,
                website: cp.partner.website,
            })),
            toc,
            sections: transformedSections,
            seo: {
                metaTitle: course.metaTitle || course.title,
                metaDescription: course.metaDescription || course.excerpt,
            },
        };
    } catch (error) {
        console.error("Error fetching course by slug via service:", error);
        return null;
    }
}

/**
 * Service to fetch related courses by type for SSR
 */
export async function getRelatedCourses(type: string, excludeSlug: string, locale: Locale = 'vi', limit: number = 3) {
    try {
        const courses = await prisma.course.findMany({
            where: {
                isPublished: true,
                type,
                slug: { not: excludeSlug },
            },
            take: limit,
            orderBy: [
                { isFeatured: "desc" },
                { sortOrder: "asc" },
                { createdAt: "desc" },
            ],
            include: {
                featuredImage: {
                    select: { url: true, alt: true },
                },
            },
        });

        return courses.map((course) => ({
            id: course.id,
            title: locale === "en" && course.title_en ? course.title_en : course.title,
            slug: course.slug,
            excerpt: locale === "en" && course.excerpt_en ? course.excerpt_en : course.excerpt,
            featuredImage: optimizeCloudinaryUrl(course.featuredImage?.url || null, ImageSizes.RELATED_THUMBNAIL),
            type: course.type as CourseType,
        }));
    } catch (error) {
        console.error("Error fetching related courses via service:", error);
        return [];
    }
}

