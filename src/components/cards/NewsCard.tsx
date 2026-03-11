"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui";
import { Calendar, Eye } from "lucide-react";

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
}: NewsCardProps) {
    const isEn = locale === "en";
    const href = isEn ? `/en/news/${slug}` : `/tin-tuc/${slug}`;

    const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString(isEn ? "en-US" : "vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
        : null;

    return (
        <Link href={href} className="group block h-full cursor-pointer">
            <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full overflow-hidden flex flex-col border border-slate-100">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                    {featuredImage ? (
                        <Image
                            src={featuredImage}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <span className="text-slate-600 text-sm">
                                {isEn ? "No image" : "No image"}
                            </span>
                        </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                        <Badge variant="primary" size="sm">
                            {category.name}
                        </Badge>
                    </div>

                    {/* Featured badge */}
                    {isFeatured && (
                        <div className="absolute top-3 right-3">
                            <Badge variant="accent" size="sm">
                                {isEn ? "Featured" : "Nổi bật"}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-heading font-semibold text-lg text-slate-900 line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {title}
                    </h3>

                    {excerpt && (
                        <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                            {excerpt}
                        </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-auto pt-3 border-t border-slate-100">
                        {formattedDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formattedDate}
                            </span>
                        )}
                        {viewCount !== undefined && (
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {viewCount.toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default NewsCard;
