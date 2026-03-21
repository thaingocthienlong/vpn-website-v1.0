"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { Eye, Calendar, Newspaper } from "lucide-react";

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
                className={`
                    group relative overflow-hidden rounded-2xl h-full
                    bg-white border border-slate-200 cursor-pointer
                    hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]
                    transition-all duration-300 ease-out
                    flex flex-col
                `}
            >
                {/* Image */}
                <div className={`relative overflow-hidden ${isFeatured ? "aspect-[16/9]" : "aspect-[16/10]"}`}>
                    {post.featuredImage ? (
                        <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes={isFeatured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-white/5 flex items-center justify-center">
                            <Newspaper size={48} className="text-blue-400/50" />
                        </div>
                    )}

                    {/* Featured Badge */}
                    {post.isFeatured && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-blue-600 text-slate-800 text-xs font-medium rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                            {isEn ? "Featured" : "Nổi bật"}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className={`flex-1 flex flex-col ${isFeatured ? "p-6" : "p-5"}`}>
                    {/* Category Badge */}
                    <span
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `${newsBasePath}/${post.category.slug}`;
                        }}
                        className="inline-flex items-center w-fit px-3 py-1 mb-3 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-500/30 border border-blue-500/30 transition-colors cursor-pointer"
                    >
                        {post.category.name}
                    </span>

                    {/* Title */}
                    <h3 className={`font-bold text-slate-800 mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors ${isFeatured ? "text-xl" : "text-lg"}`}>
                        {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                        <p className={`text-slate-800 line-clamp-2 mb-4 flex-1 ${isFeatured ? "text-base" : "text-sm"}`}>
                            {post.excerpt}
                        </p>
                    )}

                    {/* Meta - pushed to bottom */}
                    <div className="flex items-center gap-4 text-xs text-slate-800 mt-auto pt-3 border-t border-slate-200">
                        {post.publishedAt && (
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                {formatDistanceToNow(new Date(post.publishedAt), {
                                    addSuffix: true,
                                    locale: isEn ? enUS : vi
                                })}
                            </span>
                        )}
                        <span className="flex items-center gap-1.5">
                            <Eye size={14} />
                            {post.viewCount.toLocaleString(isEn ? "en-US" : "vi-VN")} {isEn ? "views" : "lượt xem"}
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}

export default NewsCard;
