"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { CalendarBlank, Eye, NewspaperClipping } from "@phosphor-icons/react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface NewsCardProps {
    post: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        featuredImage: string | null;
        category: {
            name: string;
            slug: string;
        };
        publishedAt: string | null;
        viewCount: number;
        isFeatured: boolean;
    };
    variant?: "default" | "featured";
    locale?: "vi" | "en";
}

export function NewsCard({ post, variant = "default", locale = "vi" }: NewsCardProps) {
    const isFeatured = variant === "featured";
    const isEn = locale === "en";
    const newsBasePath = isEn ? "/en/news" : "/tin-tuc";
    const cardLink = `${newsBasePath}/${post.category.slug}/${post.slug}`;

    return (
        <Link href={cardLink} className="block h-full">
            <article
                className={cn(
                    "interactive-card group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(234,243,255,0.84))] shadow-[var(--shadow-xs)]",
                    isFeatured && "shadow-[var(--shadow-sm)]"
                )}
            >
                <div className={`relative overflow-hidden ${isFeatured ? "aspect-[16/11]" : "aspect-[16/10]"}`}>
                    {post.featuredImage ? (
                        <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center border border-white/5 bg-[linear-gradient(160deg,rgba(23,88,216,0.12),rgba(234,243,255,0.35))]">
                            <NewspaperClipping className="h-12 w-12 text-[rgba(23,88,216,0.32)]" weight="duotone" />
                        </div>
                    )}

                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                        <Badge variant="default" size="sm">
                            {post.category.name}
                        </Badge>
                        {post.isFeatured && (
                            <Badge variant="accent" size="sm">
                                {isEn ? "Featured" : "Nổi bật"}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className={`flex flex-1 flex-col ${isFeatured ? "p-7 md:p-8" : "p-6"}`}>
                    <h3 className={`mb-3 font-heading text-[var(--ink)] ${isFeatured ? "text-[2rem]" : "text-[1.55rem]"}`}>
                        {post.title}
                    </h3>

                    {post.excerpt && (
                        <p className={`mb-5 flex-1 text-[var(--ink-soft)] ${isFeatured ? "text-[15px] leading-8" : "text-sm leading-7"}`}>
                            {post.excerpt}
                        </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-[rgba(26,72,164,0.1)] pt-3 text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                        {post.publishedAt && (
                            <span className="flex items-center gap-1.5">
                                <CalendarBlank className="h-3.5 w-3.5" weight="bold" />
                                {formatDistanceToNow(new Date(post.publishedAt), {
                                    addSuffix: true,
                                    locale: isEn ? enUS : vi,
                                })}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5" weight="bold" />
                            {post.viewCount.toLocaleString(isEn ? "en-US" : "vi-VN")} {isEn ? "views" : "lượt xem"}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default NewsCard;
