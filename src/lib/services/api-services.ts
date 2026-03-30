import { prisma } from "@/lib/prisma";
import type { Locale } from "@/i18n/config";
import { optimizeCloudinaryUrl, ImageSizes } from "@/lib/cloudinary";
import { reportServerException } from "@/lib/monitoring/report-server-exception";
import { unstable_cache } from "next/cache";
import { getServiceSummaries } from "@/lib/services/site-content";

type CourseType = "ADMISSION" | "SHORT_COURSE" | "STUDY_ABROAD";
type HomepageSectionConfig = Record<string, unknown>;

export interface HomepageSectionView {
    id: string;
    sectionKey: string;
    title?: string | null;
    subtitle?: string | null;
    hasEnglishTitle?: boolean;
    hasEnglishSubtitle?: boolean;
    isEnabled: boolean;
    sortOrder: number;
    config: HomepageSectionConfig;
}

function isMissingSqliteTableError(error: unknown) {
    return error instanceof Error && error.message.includes("SQLITE_ERROR: no such table");
}

async function hasSqliteTable(tableName: string) {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
            tableName
        );
        return rows.length > 0;
    } catch {
        return false;
    }
}

function normalizeLocale(locale: Locale = "vi"): "vi" | "en" {
    return locale === "en" ? "en" : "vi";
}

function parseConfig(config: string | null): HomepageSectionConfig {
    if (!config) return {};
    try {
        return JSON.parse(config) as HomepageSectionConfig;
    } catch {
        return {};
    }
}

function hasLocalizedText(...values: Array<string | null | undefined>) {
    return values.some((value) => typeof value === "string" && value.trim().length > 0);
}

/**
 * Service to fetch featured posts directly from the database for SSR
 * Retrieves localized data based on the provided locale
 */
export async function getFeaturedPosts(locale: Locale = 'vi', limit: number = 4) {
    try {
        if (!(await hasSqliteTable("posts"))) {
            return [];
        }

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
            hasEnglishContent: hasLocalizedText(post.title_en, post.excerpt_en),
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
        if (!isMissingSqliteTableError(error)) {
            reportServerException(
                { area: "api-services.getFeaturedPosts", message: "Error fetching featured posts via service." },
                error
            );
        }
        return [];
    }
}

/**
 * Service to fetch featured courses directly from the database for SSR
 */
export async function getFeaturedCourses(locale: Locale = 'vi', limit: number = 9) {
    try {
        if (!(await hasSqliteTable("courses"))) {
            return [];
        }

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
            hasEnglishContent: hasLocalizedText(course.title_en, course.excerpt_en),
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
        if (!isMissingSqliteTableError(error)) {
            reportServerException(
                { area: "api-services.getFeaturedCourses", message: "Error fetching featured courses via service." },
                error
            );
        }
        return [];
    }
}

/**
 * Service to fetch active partners directly from the database for SSR
 */
export async function getActivePartners(locale: Locale = 'vi') {
    try {
        if (!(await hasSqliteTable("partners"))) {
            return [];
        }

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
        if (!isMissingSqliteTableError(error)) {
            reportServerException(
                { area: "api-services.getActivePartners", message: "Error fetching partners via service." },
                error
            );
        }
        return [];
    }
}

export async function getActiveReviews(locale: Locale = "vi", limit = 6) {
    try {
        if (!(await hasSqliteTable("reviews"))) {
            return [];
        }

        const resolvedLocale = normalizeLocale(locale);
        const reviews = await prisma.review.findMany({
            where: {
                isActive: true,
            },
            take: limit,
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            include: {
                avatar: {
                    select: { url: true },
                },
            },
        });

        return reviews.map((review) => ({
            id: review.id,
            name: review.name,
            role: resolvedLocale === "en" ? review.role_en || review.role : review.role,
            company: resolvedLocale === "en" ? review.company_en || review.company : review.company,
            content: resolvedLocale === "en" ? review.content_en || review.content : review.content,
            hasEnglishContent: hasLocalizedText(review.content_en, review.role_en, review.company_en),
            avatar: review.avatar?.url || null,
            rating: review.rating,
        }));
    } catch (error) {
        if (!isMissingSqliteTableError(error)) {
            reportServerException(
                { area: "api-services.getActiveReviews", message: "Error fetching active reviews via service." },
                error
            );
        }
        return [];
    }
}

export async function getReviewsByIds(ids: string[], locale: Locale = "vi") {
    if (ids.length === 0) return [];

    try {
        const resolvedLocale = normalizeLocale(locale);
        const reviews = await prisma.review.findMany({
            where: {
                id: { in: ids },
                isActive: true,
            },
            include: {
                avatar: {
                    select: { url: true },
                },
            },
        });

        return reviews.map((review) => ({
            id: review.id,
            name: review.name,
            role: resolvedLocale === "en" ? review.role_en || review.role : review.role,
            company: resolvedLocale === "en" ? review.company_en || review.company : review.company,
            content: resolvedLocale === "en" ? review.content_en || review.content : review.content,
            avatar: review.avatar?.url || null,
            rating: review.rating,
        }));
    } catch (error) {
        reportServerException(
            { area: "api-services.getReviewsByIds", message: "Error fetching reviews by ids." },
            error
        );
        return [];
    }
}

export async function getActiveServices(locale: Locale = "vi", limit = 6) {
    try {
        const services = await getServiceSummaries(locale);
        return services.slice(0, limit);
    } catch (error) {
        reportServerException(
            { area: "api-services.getActiveServices", message: "Error fetching active services via service." },
            error
        );
        return [];
    }
}

export async function getServicesByIds(ids: string[], locale: Locale = "vi") {
    if (ids.length === 0) return [];

    try {
        const services = await getServiceSummaries(locale);
        const serviceMap = new Map(services.map((service) => [service.id, service]));
        return ids
            .map((id) => serviceMap.get(id))
            .filter((service): service is NonNullable<typeof service> => Boolean(service));
    } catch (error) {
        reportServerException(
            { area: "api-services.getServicesByIds", message: "Error fetching services by ids." },
            error
        );
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
        reportServerException(
            { area: "api-services.getCourseBySlug", message: "Error fetching course by slug via service.", extra: { slug } },
            error
        );
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
        reportServerException(
            {
                area: "api-services.getRelatedCourses",
                message: "Error fetching related courses via service.",
                extra: { type, excludeSlug },
            },
            error
        );
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
                const resolvedLocale = normalizeLocale(locale);
                const localeKey = resolvedLocale === "en" ? "EN" : "VI";
                const rows = await prisma.homepageSection.findMany({
                    where: {
                        locale: { in: [localeKey, "VI"] },
                        isEnabled: true,
                    },
                    orderBy: { sortOrder: "asc" },
                });

                const merged = new Map<string, typeof rows[number]>();
                for (const row of rows) {
                    const existing = merged.get(row.sectionKey);
                    if (!existing || row.locale === localeKey) {
                        merged.set(row.sectionKey, row);
                    }
                }

                return Array.from(merged.values())
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map<HomepageSectionView>((section) => ({
                        id: section.id,
                        sectionKey: section.sectionKey,
                        title: resolvedLocale === "en" ? section.title_en || section.title : section.title,
                        subtitle: resolvedLocale === "en" ? section.subtitle_en || section.subtitle : section.subtitle,
                        hasEnglishTitle: hasLocalizedText(section.title_en),
                        hasEnglishSubtitle: hasLocalizedText(section.subtitle_en),
                        isEnabled: section.isEnabled,
                        sortOrder: section.sortOrder,
                        config: parseConfig(section.config),
                    }));
            } catch (error) {
                reportServerException(
                    { area: "api-services.getHomepageSections", message: "Error fetching homepage sections.", extra: { locale } },
                    error
                );
                return [];
            }
        },
        [`homepage_sections_${locale}`],
        { revalidate: 3600, tags: ["homepage_sections", locale] }
    );

    return fetchSections();
}

export async function fetchDataForSections(locale: Locale = "vi", sections: HomepageSectionView[] = []) {
    const keys = new Set(sections.map((section) => section.sectionKey));
    const [posts, courses, partners, reviews, services] = await Promise.all([
        keys.has("news") ? getFeaturedPosts(locale, 4) : Promise.resolve([]),
        keys.has("training") || keys.has("hero") ? getFeaturedCourses(locale, 9) : Promise.resolve([]),
        keys.has("partners") ? getActivePartners(locale) : Promise.resolve([]),
        keys.has("reviews") ? getActiveReviews(locale, 6) : Promise.resolve([]),
        keys.has("services") ? getActiveServices(locale, 6) : Promise.resolve([]),
    ]);

    return {
        posts,
        courses,
        partners,
        reviews,
        services,
    };
}

