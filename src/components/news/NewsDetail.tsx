"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import {
    CalendarBlank,
    Copy,
    Eye,
    FacebookLogo,
    LinkedinLogo,
    ShareNetwork,
    Tag,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui";
import { NewsCard } from "./NewsCard";

interface NewsDetailProps {
    post: {
        id: string;
        title: string;
        slug: string;
        content: string;
        excerpt: string | null;
        featuredImage: { url: string; alt: string | null } | null;
        category: { id: string; name: string; slug: string };
        author: { name: string };
        tags: { name: string; slug: string }[];
        publishedAt: string | null;
        viewCount: number;
        seo: { metaTitle: string; metaDescription: string };
    };
    relatedPosts?: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        featuredImage: string | null;
        category: { name: string; slug: string };
        publishedAt: string | null;
        viewCount: number;
        isFeatured: boolean;
    }[];
    locale?: "vi" | "en";
}

export function NewsDetail({ post, relatedPosts = [], locale = "vi" }: NewsDetailProps) {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const isEn = locale === "en";
    const newsBasePath = isEn ? "/en/news" : "/tin-tuc";

    const labels = isEn ? {
        views: "views",
        author: "Author:",
        share: "Share:",
        relatedPosts: "Related Articles",
        linkCopied: "Link copied!",
    } : {
        views: "lượt xem",
        author: "Tác giả:",
        share: "Chia sẻ:",
        relatedPosts: "Bài viết liên quan",
        linkCopied: "Đã copy link!",
    };

    const handleShare = async (platform: "facebook" | "linkedin" | "copy") => {
        switch (platform) {
            case "facebook":
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
                break;
            case "linkedin":
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
                break;
            case "copy":
                await navigator.clipboard.writeText(shareUrl);
                alert(labels.linkCopied);
                break;
        }
    };

    return (
        <article className="space-y-8">
            {post.featuredImage && post.featuredImage.url && (
                <div className="relative aspect-video overflow-hidden rounded-[2.4rem] shadow-[var(--shadow-md)]">
                    <Image
                        src={post.featuredImage.url}
                        alt={post.featuredImage.alt || post.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 900px"
                    />
                </div>
            )}

            <header className="space-y-5">
                <Badge variant="default" size="md">
                    <Link href={`${newsBasePath}/${post.category.slug}`}>{post.category.name}</Link>
                </Badge>

                <h1 className="font-heading text-[2.4rem] text-[var(--ink)] md:text-[3.8rem]">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 rounded-[1.6rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.7)] px-5 py-4 text-sm text-[var(--ink-soft)]">
                    {post.publishedAt && (
                        <span className="flex items-center gap-1.5">
                            <CalendarBlank className="h-4 w-4" weight="bold" />
                            {format(new Date(post.publishedAt), "dd MMMM, yyyy", { locale: isEn ? enUS : vi })}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Eye className="h-4 w-4" weight="bold" />
                        {post.viewCount.toLocaleString(isEn ? "en-US" : "vi-VN")} {labels.views}
                    </span>
                    <span>
                        {labels.author} <strong className="text-[var(--ink)]">{post.author.name}</strong>
                    </span>
                </div>
            </header>

            <div className="content-area prose prose-lg max-w-none p-6 md:p-8" dangerouslySetInnerHTML={{ __html: post.content }} />

            {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-[rgba(26,72,164,0.12)] pt-4">
                    <Tag className="h-4 w-4 text-[var(--ink-muted)]" weight="bold" />
                    {post.tags.map((tag) => (
                        <span
                            key={tag.slug}
                            className="rounded-full border border-[rgba(26,72,164,0.12)] bg-[rgba(255,255,255,0.82)] px-3 py-1 text-sm text-[var(--ink)]"
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-4 border-t border-[rgba(26,72,164,0.12)] pt-4">
                <span className="flex items-center gap-2 text-[var(--ink)]">
                    <ShareNetwork className="h-[18px] w-[18px]" weight="bold" />
                    {labels.share}
                </span>
                <button
                    onClick={() => handleShare("facebook")}
                    className="rounded-full bg-[rgba(23,88,216,0.12)] p-2 text-[var(--accent-strong)] transition-colors hover:bg-[rgba(23,88,216,0.18)]"
                    aria-label="Share on Facebook"
                >
                    <FacebookLogo className="h-[18px] w-[18px]" weight="fill" />
                </button>
                <button
                    onClick={() => handleShare("linkedin")}
                    className="rounded-full bg-[rgba(23,88,216,0.12)] p-2 text-[var(--accent-strong)] transition-colors hover:bg-[rgba(23,88,216,0.18)]"
                    aria-label="Share on LinkedIn"
                >
                    <LinkedinLogo className="h-[18px] w-[18px]" weight="fill" />
                </button>
                <button
                    onClick={() => handleShare("copy")}
                    className="rounded-full bg-[rgba(23,88,216,0.12)] p-2 text-[var(--accent-strong)] transition-colors hover:bg-[rgba(23,88,216,0.18)]"
                    aria-label="Copy link"
                >
                    <Copy className="h-[18px] w-[18px]" weight="bold" />
                </button>
            </div>

            {relatedPosts.length > 0 && (
                <section className="border-t border-[rgba(26,72,164,0.12)] pt-8">
                    <h2 className="mb-6 text-xl font-bold text-[var(--ink)]">{labels.relatedPosts}</h2>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {relatedPosts.slice(0, 3).map((rp) => (
                            <NewsCard key={rp.id} post={rp} locale={locale} />
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}

export default NewsDetail;
