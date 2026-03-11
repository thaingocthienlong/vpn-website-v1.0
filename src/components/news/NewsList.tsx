"use client";

import { NewsCard } from "./NewsCard";
import { Inbox } from "lucide-react";

interface Post {
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
}

interface NewsListProps {
    posts: Post[];
    showFeatured?: boolean;
    locale?: "vi" | "en";
}

export function NewsList({ posts, showFeatured = true, locale = "vi" }: NewsListProps) {
    const isEn = locale === "en";
    const featured = showFeatured ? posts.filter((p) => p.isFeatured) : [];
    const regular = showFeatured ? posts.filter((p) => !p.isFeatured) : posts;

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <Inbox size={32} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    {isEn ? "No articles yet" : "Chưa có bài viết nào"}
                </h3>
                <p className="text-slate-600">
                    {isEn ? "There are no articles in this category yet." : "Hiện tại chưa có bài viết trong danh mục này."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Featured Posts */}
            {featured.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-slate-800 mb-6">
                        {isEn ? "Featured Posts" : "Bài viết nổi bật"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {featured.map((post) => (
                            <NewsCard key={post.id} post={post} variant="featured" locale={locale} />
                        ))}
                    </div>
                </section>
            )}

            {/* Regular Posts Grid */}
            {regular.length > 0 && (
                <section>
                    {featured.length > 0 && (
                        <h2 className="text-xl font-bold text-slate-800 mb-6">
                            {isEn ? "Latest Posts" : "Bài viết mới nhất"}
                        </h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regular.map((post) => (
                            <NewsCard key={post.id} post={post} locale={locale} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default NewsList;
