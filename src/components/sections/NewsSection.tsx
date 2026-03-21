"use client";

import { SectionWrapper, type SectionWrapperProps } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { NewsCard } from "@/components/cards";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    category: {
        name: string;
        slug: string;
    };
    publishedAt?: Date | string | null;
    viewCount?: number;
    isFeatured?: boolean;
}

interface NewsSectionProps {
    posts?: Post[];
    title?: string;
    background?: SectionWrapperProps["background"];
    textColor?: SectionWrapperProps["textColor"];
    backdropBlur?: SectionWrapperProps["backdropBlur"];
}

export function NewsSection({
    posts = [],
    title,
    background,
    textColor,
    backdropBlur,
}: NewsSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedTitle = title || (isEn ? "News & Events" : "Tin Tức & Sự Kiện");

    // Show max 4 posts
    const displayPosts = posts.slice(0, 4);

    return (
        <SectionWrapper background={background || "frosted-white"} textColor={textColor} backdropBlur={backdropBlur}>
            <ScrollReveal>
                <SectionHeader
                    title={resolvedTitle}
                    centered
                />
            </ScrollReveal>

            {displayPosts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {displayPosts.map((post, index) => (
                            <ScrollReveal
                                key={post.id}
                                delay={index + 1}
                            >
                                <NewsCard
                                    id={post.id}
                                    title={post.title}
                                    slug={post.slug}
                                    excerpt={post.excerpt}
                                    featuredImage={post.featuredImage}
                                    category={post.category}
                                    publishedAt={post.publishedAt}
                                    viewCount={post.viewCount}
                                    isFeatured={post.isFeatured}
                                    locale={locale}
                                />
                            </ScrollReveal>
                        ))}
                    </div>

                    <div className="text-center">
                        <Button asChild variant="outline" size="lg">
                            <Link href={isEn ? "/en/news" : "/tin-tuc"} className="inline-flex items-center">
                                <span>{isEn ? "View all news" : "Xem tất cả tin tức"}</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                        <Newspaper className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-slate-700 mb-2">
                        {isEn ? "New articles coming soon" : "Sắp ra mắt tin tức mới"}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        {isEn
                            ? "We're updating the latest information. Please check back later!"
                            : "Chúng tôi đang cập nhật những thông tin mới nhất. Vui lòng quay lại sau!"}
                    </p>
                    <Button asChild variant="outline" size="md">
                        <Link href={isEn ? "/en/contact" : "/lien-he"}>
                            {isEn ? "Contact us" : "Liên hệ với chúng tôi"}
                        </Link>
                    </Button>
                </div>
            )}
        </SectionWrapper>
    );
}

export default NewsSection;
