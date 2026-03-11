import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vienphuongnam.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages (both VI and EN)
    const staticRoutes = [
        "",
        "/about",
        "/about/vision-mission",
        "/about/advisory-board",
        "/about/partners",
        "/about/structure",
        "/services",
        "/training",
        "/news",
        "/contact",
    ];

    const staticEntries: MetadataRoute.Sitemap = [];
    for (const route of staticRoutes) {
        // Vietnamese (default)
        staticEntries.push({
            url: `${SITE_URL}${route}`,
            lastModified: new Date(),
            changeFrequency: route === "" ? "daily" : "weekly",
            priority: route === "" ? 1.0 : 0.8,
            alternates: {
                languages: {
                    vi: `${SITE_URL}${route}`,
                    en: `${SITE_URL}/en${route}`,
                },
            },
        });
    }

    // Dynamic: Published posts
    const posts = await prisma.post.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
    });

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

    // Dynamic: Published courses
    const courses = await prisma.course.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
    });

    const courseEntries: MetadataRoute.Sitemap = courses.map((course) => ({
        url: `${SITE_URL}/training/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
        alternates: {
            languages: {
                vi: `${SITE_URL}/training/${course.slug}`,
                en: `${SITE_URL}/en/training/${course.slug}`,
            },
        },
    }));

    // Dynamic: Published services (stored as Pages)
    const services = await prisma.page.findMany({
        where: {
            isPublished: true,
            slug: {
                in: [
                    "nghien-cuu-khoa-hoc",
                    "chuyen-giao-cong-nghe",
                    "phat-trien-nhan-luc",
                    "hop-tac-quoc-te",
                    "tu-van-chinh-sach",
                    "ho-tro-doanh-nghiep",
                ],
            },
        },
        select: { slug: true, updatedAt: true },
    });

    const serviceEntries: MetadataRoute.Sitemap = services.map((service) => ({
        url: `${SITE_URL}/services/${service.slug}`,
        lastModified: service.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
        alternates: {
            languages: {
                vi: `${SITE_URL}/services/${service.slug}`,
                en: `${SITE_URL}/en/services/${service.slug}`,
            },
        },
    }));

    // Dynamic: News categories
    const categories = await prisma.category.findMany({
        select: { slug: true },
    });

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
        url: `${SITE_URL}/news/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
        alternates: {
            languages: {
                vi: `${SITE_URL}/news/${cat.slug}`,
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
