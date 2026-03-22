"use client";

import { NewspaperClipping } from "@phosphor-icons/react";
import { NewsCard } from "./NewsCard";

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
            <div className="public-panel flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.3rem] bg-[rgba(23,88,216,0.08)]">
                    <NewspaperClipping className="h-8 w-8 text-[var(--accent-strong)]" weight="duotone" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[var(--ink)]">
                    {isEn ? "No articles yet" : "Chưa có bài viết nào"}
                </h3>
                <p className="text-[var(--ink-soft)]">
                    {isEn ? "There are no articles in this category yet." : "Hiện tại chưa có bài viết trong danh mục này."}
                </p>
            </div>
        );
    }

    const leadFeatured = featured[0];
    const otherFeatured = featured.slice(1);

    return (
        <div className="space-y-10">
            {featured.length > 0 && (
                <section>
                    <h2 className="mb-6 text-xl font-bold text-[var(--ink)]">
                        {isEn ? "Featured Posts" : "Bài viết nổi bật"}
                    </h2>
                    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                        {leadFeatured && <NewsCard post={leadFeatured} variant="featured" locale={locale} />}
                        <div className="grid gap-5">
                            {otherFeatured.map((post) => (
                                <NewsCard key={post.id} post={post} locale={locale} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {regular.length > 0 && (
                <section>
                    {featured.length > 0 && (
                        <h2 className="mb-6 text-xl font-bold text-[var(--ink)]">
                            {isEn ? "Latest Posts" : "Bài viết mới nhất"}
                        </h2>
                    )}
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
