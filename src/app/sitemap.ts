import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vienphuongnam.com";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes = [
        { vi: "", en: "/en" },
        { vi: "/gioi-thieu", en: "/en/about" },
        { vi: "/gioi-thieu/tam-nhin-su-menh", en: "/en/about/vision-mission" },
        { vi: "/gioi-thieu/hoi-dong-co-van", en: "/en/about/advisory-board" },
        { vi: "/gioi-thieu/doi-tac", en: "/en/about/partners" },
        { vi: "/gioi-thieu/co-cau-to-chuc", en: "/en/about/structure" },
        { vi: "/dich-vu", en: "/en/services" },
        { vi: "/dao-tao", en: "/en/training" },
        { vi: "/tin-tuc", en: "/en/news" },
        { vi: "/lien-he", en: "/en/contact" },
    ];

    const staticEntries: MetadataRoute.Sitemap = [];
    for (const route of staticRoutes) {
        staticEntries.push({
            url: `${SITE_URL}${route.vi}`,
            lastModified: new Date(),
            changeFrequency: route.vi === "" ? "daily" : "weekly",
            priority: route.vi === "" ? 1.0 : 0.8,
            alternates: {
                languages: {
                    vi: `${SITE_URL}${route.vi}`,
                    en: `${SITE_URL}${route.en}`,
                },
            },
        });
    }

    let posts: Array<{
        slug: string;
        updatedAt: Date;
        category: { slug: string } | null;
    }> = [];

    try {
        if (await hasSqliteTable("posts")) {
            posts = await prisma.post.findMany({
                where: { isPublished: true },
                select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
            });
        }
    } catch (error) {
        if (!isMissingSqliteTableError(error)) {
            console.error("Failed to load sitemap posts:", error);
        }
    }

    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${SITE_URL}/news/${post.category?.slug || "tin-tuc"}/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
        alternates: {
            languages: {
                vi: `${SITE_URL}/news/${post.category?.slug || "tin-tuc"}/${post.slug}`,
                en: `${SITE_URL}/en/news/${post.category?.slug || "tin-tuc"}/${post.slug}`,
            },
        },
    }));

    let courses: Array<{
        slug: string;
        updatedAt: Date;
    }> = [];

    try {
        if (await hasSqliteTable("courses")) {
            courses = await prisma.course.findMany({
                where: { isPublished: true },
                select: { slug: true, updatedAt: true },
            });
        }
    } catch (error) {
        if (!isMissingSqliteTableError(error)) {
            console.error("Failed to load sitemap courses:", error);
        }
    }

    const courseEntries: MetadataRoute.Sitemap = courses.map((course) => ({
        url: `${SITE_URL}/dao-tao/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
            languages: {
                vi: `${SITE_URL}/dao-tao/${course.slug}`,
                en: `${SITE_URL}/en/training/${course.slug}`,
            },
        },
    }));

    let services: Array<{
        slug: string;
        updatedAt: Date;
    }> = [];

    try {
        if (await hasSqliteTable("pages")) {
            services = await prisma.page.findMany({
                where: {
                    isPublished: true,
                    template: "service",
                },
                select: { slug: true, updatedAt: true },
            });
        }
    } catch (error) {
        if (!isMissingSqliteTableError(error)) {
            console.error("Failed to load sitemap services:", error);
        }
    }

    const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
        url: `${SITE_URL}/dich-vu/${service.slug}`,
        lastModified: service.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: {
            languages: {
                vi: `${SITE_URL}/dich-vu/${service.slug}`,
                en: `${SITE_URL}/en/services/${service.slug}`,
            },
        },
    }));

    let categories: Array<{ slug: string }> = [];

    try {
        if (await hasSqliteTable("categories")) {
            categories = await prisma.category.findMany({
                select: { slug: true },
            });
        }
    } catch (error) {
        if (!isMissingSqliteTableError(error)) {
            console.error("Failed to load sitemap categories:", error);
        }
    }

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${SITE_URL}/tin-tuc/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
        alternates: {
            languages: {
                vi: `${SITE_URL}/tin-tuc/${cat.slug}`,
                en: `${SITE_URL}/en/news/${cat.slug}`,
            },
        },
    }));

    return [
        ...staticEntries,
        ...postEntries,
        ...courseEntries,
        ...serviceEntries,
        ...categoryEntries,
    ];
}
