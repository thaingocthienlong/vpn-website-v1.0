"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { Eye, Calendar, Tag, Share2, Facebook, Linkedin, Copy } from "lucide-react";
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

    // Labels
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
            {/* Hero Image */}
            {
                post.featuredImage && post.featuredImage.url && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt || post.title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 800px"
                        />
                    </div>
                )
            }

            {/* Header */}
            <header className="space-y-4">
                <Link
                    href={`${newsBasePath}/${post.category.slug}`}
                    className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-500/30 rounded-full hover:bg-blue-500/30 transition-colors"
                >
                    {post.category.name}
                </Link>

                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 leading-tight drop-shadow-sm">
                    {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-800">
                    {post.publishedAt && (
                        <span className="flex items-center gap-1.5">
                            <Calendar size={16} />
                            {format(new Date(post.publishedAt), "dd MMMM, yyyy", { locale: isEn ? enUS : vi })}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Eye size={16} />
                        {post.viewCount.toLocaleString(isEn ? "en-US" : "vi-VN")} {labels.views}
                    </span>
                    <span>{labels.author} <strong className="text-slate-800">{post.author.name}</strong></span>
                </div>
            </header>

            {/* Content */}
            <div
                className="prose prose-lg max-w-none prose-invert prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-400 prose-img:rounded-xl prose-img:h-auto prose-img:max-w-full"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {
                post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200">
                        <Tag size={16} className="text-slate-500" />
                        {post.tags.map((tag) => (
                            <span
                                key={tag.slug}
                                className="px-3 py-1 text-sm text-slate-800 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors cursor-default"
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )
            }

            {/* Share Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
                <span className="flex items-center gap-2 text-slate-800">
                    <Share2 size={18} />
                    {labels.share}
                </span>
                <button
                    onClick={() => handleShare("facebook")}
                    className="p-2 rounded-full bg-[#1877f2] text-slate-800 hover:bg-[#166fe5] shadow-[0_0_10px_rgba(24,119,242,0.3)] transition-colors"
                    aria-label="Share on Facebook"
                >
                    <Facebook size={18} />
                </button>
                <button
                    onClick={() => handleShare("linkedin")}
                    className="p-2 rounded-full bg-[#0a66c2] text-slate-800 hover:bg-[#0958a7] shadow-[0_0_10px_rgba(10,102,194,0.3)] transition-colors"
                    aria-label="Share on LinkedIn"
                >
                    <Linkedin size={18} />
                </button>
                <button
                    onClick={() => handleShare("copy")}
                    className="p-2 rounded-full bg-slate-700 text-slate-800 hover:bg-slate-600 shadow-[0_0_10px_rgba(51,65,85,0.3)] transition-colors"
                    aria-label="Copy link"
                >
                    <Copy size={18} />
                </button>
            </div>

            {/* Related Posts */}
            {
                relatedPosts.length > 0 && (
                    <section className="pt-8 border-t border-slate-200">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">{labels.relatedPosts}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {relatedPosts.slice(0, 3).map((rp) => (
                                <NewsCard key={rp.id} post={rp} locale={locale} />
                            ))}
                        </div>
                    </section>
                )
            }
        </article >
    );
}

export default NewsDetail;
