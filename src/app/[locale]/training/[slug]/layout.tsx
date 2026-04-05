import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { normalizePlainText, normalizePreviewText } from "@/lib/preview-text";

const BASE_URL = "https://vienphuongnam.com";

interface MetadataParams {
    params: Promise<{ locale: string; slug: string }>;
}

/**
 * Generate metadata for training/course detail pages
 * Includes OG tags, Twitter cards, and Course Schema.org
 */
export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
    const { locale, slug } = await params;
    const isEn = locale === "en";

    try {
        const course = await prisma.course.findFirst({
            where: { slug, isPublished: true },
            select: {
                title: true,
                title_en: true,
                excerpt: true,
                excerpt_en: true,
                metaTitle: true,
                metaDescription: true,
                featuredImage: { select: { url: true } },
                category: { select: { name: true, name_en: true } },
            },
        });

        if (!course) {
            return { title: isEn ? "Course Not Found" : "Không tìm thấy khóa học" };
        }

        const title = normalizePlainText(isEn && course.title_en ? course.title_en : course.title) || course.title;
        const description = normalizePreviewText(course.metaDescription)
            || normalizePreviewText(isEn && course.excerpt_en ? course.excerpt_en : course.excerpt)
            || "";
        const metaTitle = normalizePlainText(course.metaTitle) || `${title} | SISRD`;
        const imageUrl = course.featuredImage?.url
            ? `${BASE_URL}${course.featuredImage.url}`
            : `${BASE_URL}/images/og-default.jpg`;
        const pageUrl = `${BASE_URL}/${locale}/training/${slug}`;

        return {
            title: metaTitle,
            description: description.substring(0, 160),
            openGraph: {
                title: metaTitle,
                description: description.substring(0, 160),
                url: pageUrl,
                siteName: "Viện Phương Nam (SISRD)",
                images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
                locale: isEn ? "en_US" : "vi_VN",
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: metaTitle,
                description: description.substring(0, 160),
                images: [imageUrl],
            },
            alternates: {
                canonical: pageUrl,
                languages: {
                    vi: `${BASE_URL}/vi/training/${slug}`,
                    en: `${BASE_URL}/en/training/${slug}`,
                },
            },
        };
    } catch {
        return { title: isEn ? "Training" : "Đào tạo" };
    }
}

export default async function TrainingSlugLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const isEn = locale === "en";

    // Fetch data for Schema.org
    const course = await prisma.course.findFirst({
        where: { slug, isPublished: true },
        select: {
            title: true,
            title_en: true,
            excerpt: true,
            excerpt_en: true,
            featuredImage: { select: { url: true } },
        },
    });

    let jsonLd = null;
    if (course) {
        const title = normalizePlainText(isEn && course.title_en ? course.title_en : course.title) || course.title;
        const description = normalizePreviewText(isEn && course.excerpt_en ? course.excerpt_en : course.excerpt) || "";
        const imageUrl = course.featuredImage?.url
            ? `${BASE_URL}${course.featuredImage.url}`
            : `${BASE_URL}/images/logo.png`;

        jsonLd = {
            "@context": "https://schema.org",
            "@type": "Course",
            name: title,
            description: description.substring(0, 300),
            provider: {
                "@type": "Organization",
                name: "Viện Phát triển nguồn lực xã hội Phương Nam",
                sameAs: "https://vienphuongnam.com",
            },
            image: imageUrl,
            offers: {
                "@type": "Offer",
                category: "Educational",
            },
        };
    }

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
        </>
    );
}

