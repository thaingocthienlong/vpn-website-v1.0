import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://vienphuongnam.com";

interface MetadataParams {
    params: Promise<{ locale: string; category: string; slug: string }>;
}

/**
 * Generate metadata for news article detail pages
 * Includes OG tags, Twitter cards, canonical URLs
 */
export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
    const { locale, category, slug } = await params;
    const isEn = locale === "en";

    try {
        const post = await prisma.post.findFirst({
            where: { slug, isPublished: true },
            select: {
                title: true,
                title_en: true,
                excerpt: true,
                excerpt_en: true,
                metaTitle: true,
                metaDescription: true,
                featuredImage: { select: { url: true } },
                category: { select: { name: true, name_en: true, slug: true } },
                publishedAt: true,
                author: { select: { name: true } },
            },
        });

        if (!post) {
            return { title: isEn ? "Article Not Found" : "Không tìm thấy bài viết" };
        }

        const title = isEn && post.title_en ? post.title_en : post.title;
        const description = post.metaDescription
            || (isEn && post.excerpt_en ? post.excerpt_en : post.excerpt)
            || "";
        const metaTitle = post.metaTitle || `${title} | SISRD`;
        const imageUrl = post.featuredImage?.url
            ? `${BASE_URL}${post.featuredImage.url}`
            : `${BASE_URL}/images/og-default.jpg`;
        const pageUrl = `${BASE_URL}/${locale}/news/${category}/${slug}`;

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
                type: "article",
                ...(post.publishedAt && {
                    publishedTime: post.publishedAt.toISOString(),
                }),
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
                    vi: `${BASE_URL}/vi/news/${category}/${slug}`,
                    en: `${BASE_URL}/en/news/${category}/${slug}`,
                },
            },
        };
    } catch {
        return { title: isEn ? "News" : "Tin tức" };
    }
}

export default function NewsArticleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
