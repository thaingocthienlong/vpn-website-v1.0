import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/config";
import { optimizeCloudinaryUrl, ImageSizes } from "@/lib/cloudinary";
import { unstable_cache } from "next/cache";

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
 * Service to fetch specific courses by their IDs, preserving order
 */
export async function getCoursesByIds(ids: string[], locale: Locale = 'vi', bypassPublishStatus: boolean = false) {
    if (!ids || ids.length === 0) return [];
    try {
        const courses = await prisma.course.findMany({
            where: {
                id: { in: ids },
                ...(bypassPublishStatus ? {} : { isPublished: true }),
            },
            include: {
                category: {
                    select: { name: true, name_en: true, slug: true },
                },
                featuredImage: {
                    select: { url: true, alt: true },
                },
            },
        });

        // Ensure we return the courses in the order of the ids array
        const sortedCourses = ids.map(id => courses.find(c => c.id === id)).filter((c): c is NonNullable<typeof c> => Boolean(c));

        return sortedCourses.map((course) => ({
            id: course.id,
            title: locale === "en" && course.title_en ? course.title_en : course.title,
            slug: course.slug,
            excerpt: locale === "en" && course.excerpt_en ? course.excerpt_en : course.excerpt,
            featuredImage: optimizeCloudinaryUrl(course.featuredImage?.url || null, ImageSizes.CARD_THUMBNAIL),
            type: course.type as CourseType,
            isFeatured: course.isFeatured,
            isPublished: course.isPublished,
            isRegistrationOpen: course.isRegistrationOpen,
            category: course.category ? {
                name: locale === "en" && course.category.name_en
                    ? course.category.name_en
                    : course.category.name,
                slug: course.category.slug,
            } : null,
        }));
    } catch (error) {
        console.error("Error fetching courses by ids via service:", error);
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

/**
 * Service to fetch homepage layout sections directly from the database for SSR
 * Utilizes unstable_cache to memoize the result.
 */
export async function getHomepageSections(locale: Locale = 'vi') {
    const fetchSections = unstable_cache(
        async () => {
            try {
                const sections = await prisma.homepageSection.findMany({
                    where: {
                        locale: 'vi', // ALWAYS read from 'vi' to sync structured layout
                        isEnabled: true,
                    },
                    orderBy: { sortOrder: "asc" },
                });

                return sections.map((sec) => {
                    let configObj = {};
                    try {
                        if (sec.config && sec.config.trim() !== "") {
                            configObj = JSON.parse(sec.config);
                        }
                    } catch (error) {
                        console.error(`Invalid JSON config for section ${sec.sectionKey}`, error);
                    }
                    
                    const title = locale === 'en' ? (sec.title_en || sec.title) : sec.title;
                    const subtitle = locale === 'en' ? (sec.subtitle_en || sec.subtitle) : sec.subtitle;

                    return {
                        id: sec.id,
                        sectionKey: sec.sectionKey,
                        title,
                        subtitle,
                        ...configObj,
                    };
                });
            } catch (error) {
                console.error("Error fetching homepage sections:", error);
                return [];
            }
        },
        [`homepage_sections_${locale}`],
        { revalidate: 3600, tags: ["homepage_sections", locale] }
    );

    return fetchSections();
}

/**
 * Service to fetch active services for SSR
 */
export async function getActiveServices(locale: Locale = 'vi', limit?: number) {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true },
            ...(limit ? { take: limit } : {}),
            orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
        });

        return services.map(s => ({
            id: s.id,
            title: locale === "en" && s.title_en ? s.title_en : s.title,
            slug: s.slug,
            excerpt: locale === "en" && s.excerpt_en ? s.excerpt_en : s.excerpt,
            thumbnailUrl: s.thumbnailUrl,
            isFeatured: s.isFeatured,
            sortOrder: s.sortOrder,
        }));
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
}

/**
 * Service to fetch specific services by IDs preserving order
 */
export async function getServicesByIds(ids: string[], locale: Locale = 'vi') {
    if (!ids || ids.length === 0) return [];
    try {
        const services = await prisma.service.findMany({
            where: { id: { in: ids }, isActive: true },
        });
        const sorted = ids.map(id => services.find(s => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s));
        return sorted.map(s => ({
            id: s.id,
            title: locale === "en" && s.title_en ? s.title_en : s.title,
            slug: s.slug,
            excerpt: locale === "en" && s.excerpt_en ? s.excerpt_en : s.excerpt,
            thumbnailUrl: s.thumbnailUrl,
            isFeatured: s.isFeatured,
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

/**
 * Service to fetch specific posts by IDs preserving order
 */
export async function getPostsByIds(ids: string[], locale: Locale = 'vi') {
    if (!ids || ids.length === 0) return [];
    try {
        const posts = await prisma.post.findMany({
            where: { id: { in: ids }, isPublished: true },
            include: {
                category: { select: { name: true, name_en: true, slug: true } },
                author: { select: { name: true } },
                featuredImage: { select: { url: true, alt: true } },
            }
        });
        const sorted = ids.map(id => posts.find(p => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
        return sorted.map((post) => ({
            id: post.id,
            title: locale === "en" && post.title_en ? post.title_en : post.title,
            slug: post.slug,
            excerpt: locale === "en" && post.excerpt_en ? post.excerpt_en : post.excerpt,
            featuredImage: optimizeCloudinaryUrl(post.featuredImage?.url || null, ImageSizes.POST_THUMBNAIL),
            category: {
                name: locale === "en" && post.category.name_en ? post.category.name_en : post.category.name,
                slug: post.category.slug,
            },
            author: { name: post.author.name },
            publishedAt: post.publishedAt,
            viewCount: post.viewCount,
            isFeatured: post.isFeatured,
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
}

/**
 * Service to fetch active reviews for SSR
 */
export async function getActiveReviews(locale: Locale = 'vi', limit?: number) {
    try {
        const reviews = await prisma.review.findMany({
            where: { isActive: true },
            ...(limit ? { take: limit } : {}),
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
            include: { avatar: { select: { url: true, alt: true } } },
        });

        return reviews.map(r => ({
            id: r.id,
            name: r.name,
            role: r.role,
            company: r.company,
            content: locale === "en" && r.content_en ? r.content_en : r.content,
            rating: r.rating,
            avatar: optimizeCloudinaryUrl(r.avatar?.url || null, ImageSizes.AVATAR),
        }));
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}

/**
 * Service to fetch specific reviews by IDs preserving order
 */
export async function getReviewsByIds(ids: string[], locale: Locale = 'vi') {
    if (!ids || ids.length === 0) return [];
    try {
        const reviews = await prisma.review.findMany({
            where: { id: { in: ids }, isActive: true },
            include: { avatar: { select: { url: true, alt: true } } },
        });
        const sorted = ids.map(id => reviews.find(r => r.id === id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
        return sorted.map(r => ({
            id: r.id,
            name: r.name,
            role: r.role,
            company: r.company,
            content: locale === "en" && r.content_en ? r.content_en : r.content,
            rating: r.rating,
            avatar: optimizeCloudinaryUrl(r.avatar?.url || null, ImageSizes.AVATAR),
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * Service to fetch active videos for SSR
 */
export async function getActiveVideos(limit?: number) {
    try {
        const videos = await prisma.video.findMany({
            where: { isActive: true },
            ...(limit ? { take: limit } : {}),
            orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        });

        return videos.map(v => ({
            id: v.id,
            title: v.title,
            thumbnailUrl: v.thumbnailUrl,
            videoUrl: v.videoUrl,
            isFeatured: v.isFeatured,
        }));
    } catch (error) {
        console.error("Error fetching videos:", error);
        return [];
    }
}

/**
 * Service to fetch specific videos by IDs preserving order
 */
export async function getVideosByIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];
    try {
        const videos = await prisma.video.findMany({
            where: { id: { in: ids }, isActive: true },
        });
        const sorted = ids.map(id => videos.find(v => v.id === id)).filter((v): v is NonNullable<typeof v> => Boolean(v));
        return sorted.map(v => ({
            id: v.id,
            title: v.title,
            thumbnailUrl: v.thumbnailUrl,
            videoUrl: v.videoUrl,
            isFeatured: v.isFeatured,
        }));
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * Service to fetch all required data for a list of homepage sections.
 */
export async function fetchDataForSections(sections: Record<string, unknown>[], locale: Locale = 'vi') {
    const data: Record<string, unknown> = {};

    for (const sec of sections) {
        if (sec.sectionKey === 'services' && sec.serviceIds && sec.serviceIds.length > 0) {
            data[sec.id] = await getServicesByIds(sec.serviceIds, locale);
        } else if (sec.sectionKey === 'reviews' && sec.reviewIds && sec.reviewIds.length > 0) {
            data[sec.id] = await getReviewsByIds(sec.reviewIds, locale);
        } else if (sec.sectionKey === 'news' && sec.postIds && sec.postIds.length > 0) {
            data[sec.id] = await getPostsByIds(sec.postIds, locale);
        } else if (sec.sectionKey === 'training' && sec.courseIds && sec.courseIds.length > 0) {
            data[sec.id] = await getCoursesByIds(sec.courseIds, locale);
        } else if (sec.sectionKey === 'videos') {
            if (sec.videoIds && sec.videoIds.length > 0) {
                data[sec.id] = await getVideosByIds(sec.videoIds);
            } else {
                data[sec.id] = await getActiveVideos();
            }
        }
    }
    return data;
}


/**
 * Fetch gallery images from Media table (migrated from module_images.json).
 * Returns Cloudinary URLs tagged with resourceType="gallery".
 */
export async function getGalleryImages(limit?: number): Promise<string[]> {
    try {
        const images = await prisma.media.findMany({
            where: { resourceType: 'gallery' },
            select: { url: true, secureUrl: true },
            ...(limit ? { take: limit } : {}),
            orderBy: { createdAt: 'asc' },
        });

        return images.map(img => img.secureUrl || img.url);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        return [];
    }
}
