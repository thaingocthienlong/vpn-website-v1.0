"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, CalendarBlank, Eye, NewspaperClipping } from "@phosphor-icons/react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface NewsCardProps {
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
    locale?: "vi" | "en";
    variant?: "feature" | "default" | "compact";
    className?: string;
}

export function NewsCard({
    title,
    slug,
    excerpt,
    featuredImage,
    category,
    publishedAt,
    viewCount,
    isFeatured,
    locale = "vi",
    variant = "default",
    className,
}: NewsCardProps) {
    const isEn = locale === "en";
    const href = isEn ? `/en/news/${category.slug}/${slug}` : `/tin-tuc/${category.slug}/${slug}`;
    const isFeature = variant === "feature";
    const isCompact = variant === "compact";

    const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString(isEn ? "en-US" : "vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        : null;

    return (
        <Link href={href} className="group block h-full cursor-pointer">
            <article
                className={cn(
                    "interactive-card flex h-full flex-col overflow-hidden rounded-[2rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(234,243,255,0.84))] shadow-[var(--shadow-xs)]",
                    className
                )}
            >
                {!isCompact && (
                    <div className={cn("relative overflow-hidden", isFeature ? "aspect-[16/11]" : "aspect-[16/10]")}>
                        {featuredImage ? (
                            <Image
                                src={featuredImage}
                                alt={title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,rgba(23,88,216,0.12),rgba(234,243,255,0.35))]">
                                <NewspaperClipping className="h-12 w-12 text-[rgba(23,88,216,0.32)]" weight="duotone" />
                            </div>
                        )}

                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <Badge variant="default" size="sm">
                                {category.name}
                            </Badge>
                            {isFeatured && (
                                <Badge variant="accent" size="sm">
                                    {isEn ? "Featured" : "Nổi bật"}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <div className={cn("flex flex-1 flex-col", isCompact ? "p-5" : isFeature ? "p-7 md:p-8" : "p-6")}>
                    {isCompact && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Badge variant="default" size="sm">
                                {category.name}
                            </Badge>
                            {isFeatured && (
                                <Badge variant="accent" size="sm">
                                    {isEn ? "Featured" : "Nổi bật"}
                                </Badge>
                            )}
                        </div>
                    )}

                    <h3 className={cn("font-heading text-[var(--ink)]", isFeature ? "mb-4 text-[2.1rem]" : isCompact ? "mb-3 text-[1.35rem]" : "mb-4 text-[1.65rem]")}>
                        {title}
                    </h3>

                    {excerpt && (
                        <p className={cn("text-[var(--ink-soft)]", isFeature ? "mb-6 text-[15px] leading-8" : "mb-5 text-sm leading-7", isCompact && "line-clamp-2")}>
                            {excerpt}
                        </p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-[rgba(26,72,164,0.1)] pt-4 text-xs uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                        {formattedDate && (
                            <span className="flex items-center gap-1.5">
                                <CalendarBlank className="h-3.5 w-3.5" weight="bold" />
                                {formattedDate}
                            </span>
                        )}
                        {viewCount !== undefined && (
                            <span className="flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5" weight="bold" />
                                {viewCount.toLocaleString()}
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-[var(--accent-strong)]">
                            <ArrowUpRight className="h-3.5 w-3.5" weight="bold" />
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default NewsCard;
