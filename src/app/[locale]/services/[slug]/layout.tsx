import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://vienphuongnam.com";

interface MetadataParams {
    params: Promise<{ locale: string; slug: string }>;
}

/**
 * Generate metadata for service detail pages
 * Includes OG tags, Twitter cards, canonical URLs
 */
export async function generateMetadata({ params }: MetadataParams): Promise<Metadata> {
    const { locale, slug } = await params;
    const isEn = locale === "en";

    try {
        const service = await prisma.page.findFirst({
            where: { slug, isPublished: true, template: "service" },
            select: {
                title: true,
                title_en: true,
                content: true,
                content_en: true,
                metaTitle: true,
                metaDescription: true,
                featuredImage: { select: { url: true } },
            },
        });

        if (!service) {
            return { title: isEn ? "Service Not Found" : "Không tìm thấy dịch vụ" };
        }

        const title = isEn && service.title_en ? service.title_en : service.title;
        const description = service.metaDescription
            || (isEn && service.content_en ? service.content_en : service.content || "")
                .replace(/<[^>]*>/g, "")
                .substring(0, 160);
        const metaTitle = service.metaTitle || `${title} | Viện Phương Nam`;
        const imageUrl = service.featuredImage?.url || `${BASE_URL}/images/og-default.jpg`;
        const pageUrl = isEn ? `${BASE_URL}/en/services/${slug}` : `${BASE_URL}/dich-vu/${slug}`;

        return {
            title: metaTitle,
            description,
            openGraph: {
                title: metaTitle,
                description,
                url: pageUrl,
                siteName: "Viện Phương Nam",
                images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
                locale: isEn ? "en_US" : "vi_VN",
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title: metaTitle,
                description,
                images: [imageUrl],
            },
            alternates: {
                canonical: pageUrl,
                languages: {
                    vi: `${BASE_URL}/dich-vu/${slug}`,
                    en: `${BASE_URL}/en/services/${slug}`,
                },
            },
        };
    } catch {
        return { title: isEn ? "Services" : "Dịch vụ" };
    }
}

export default function ServiceSlugLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
