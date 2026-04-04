"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, WarningCircle } from "@phosphor-icons/react";
import { NewsDetailSkeleton, NewsSidebarSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { PublicStatePanel } from "@/components/route-shell";
import { NewsDetail } from "./NewsDetail";
import { NewsSidebar } from "./NewsSidebar";
import { NewsPageShell } from "./NewsPageShell";

interface NewsPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featuredImage: { url: string; alt: string | null } | null;
    category: {
        id: string;
        name: string;
        slug: string;
    };
    author: { name: string };
    tags: { name: string; slug: string }[];
    publishedAt: string | null;
    viewCount: number;
    seo: { metaTitle: string; metaDescription: string };
    relatedPosts?: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        featuredImage: string | null;
        publishedAt: string | null;
        category?: {
            name: string;
            slug: string;
        };
        viewCount?: number;
        isFeatured?: boolean;
    }[];
}

interface NewsCategory {
    id: string;
    name: string;
    slug: string;
    postCount: number;
}

interface NewsArticlePageClientProps {
    locale: "vi" | "en";
    basePath: string;
    homeHref: string;
    homeLabel: string;
    newsLabel: string;
    categorySlug: string;
    postSlug: string;
    notFoundTitle: string;
    backToNewsLabel: string;
    errorTitle: string;
    errorDescription?: string;
}

export function NewsArticlePageClient({
    locale,
    basePath,
    homeHref,
    homeLabel,
    newsLabel,
    categorySlug,
    postSlug,
    notFoundTitle,
    backToNewsLabel,
    errorTitle,
    errorDescription,
}: NewsArticlePageClientProps) {
    const [post, setPost] = useState<NewsPost | null>(null);
    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [recentPosts, setRecentPosts] = useState<NewsPost[]>([]);
    const [popularPosts, setPopularPosts] = useState<NewsPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let ignore = false;

        async function fetchData() {
            setLoading(true);
            setHasError(false);

            try {
                const postUrl = locale === "en"
                    ? `/api/posts/${postSlug}?locale=en`
                    : `/api/posts/${postSlug}`;
                const categoriesParams = new URLSearchParams({ type: "POST" });
                const recentParams = new URLSearchParams({ limit: "5", sort: "newest" });
                const popularParams = new URLSearchParams({ limit: "5", sort: "popular" });

                if (locale === "en") {
                    categoriesParams.set("locale", "en");
                    recentParams.set("locale", "en");
                    popularParams.set("locale", "en");
                }

                const [postRes, categoriesRes, recentRes, popularRes] = await Promise.all([
                    fetch(postUrl),
                    fetch(`/api/categories?${categoriesParams.toString()}`),
                    fetch(`/api/posts?${recentParams.toString()}`),
                    fetch(`/api/posts?${popularParams.toString()}`),
                ]);

                if (!postRes.ok || !categoriesRes.ok || !recentRes.ok || !popularRes.ok) {
                    throw new Error("Failed to fetch article page data");
                }

                const [postData, categoriesData, recentData, popularData] = await Promise.all([
                    postRes.json(),
                    categoriesRes.json(),
                    recentRes.json(),
                    popularRes.json(),
                ]);

                if (!ignore) {
                    setPost(postData.success ? postData.data : null);
                    setCategories(
                        (categoriesData.data || []).map((category: NewsCategory) => ({
                            ...category,
                            postCount: category.postCount ?? 0,
                        }))
                    );
                    setRecentPosts(recentData.data || []);
                    setPopularPosts(popularData.data || []);
                }
            } catch (error) {
                if (!ignore) {
                    console.error("Error fetching article page data:", error);
                    setHasError(true);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            ignore = true;
        };
    }, [locale, postSlug]);

    const relatedPosts = useMemo(() => {
        if (!post?.relatedPosts?.length) {
            return [];
        }

        return post.relatedPosts.map((relatedPost) => ({
            id: relatedPost.id,
            title: relatedPost.title,
            slug: relatedPost.slug,
            excerpt: relatedPost.excerpt,
            featuredImage: relatedPost.featuredImage,
            publishedAt: relatedPost.publishedAt,
            viewCount: relatedPost.viewCount ?? 0,
            isFeatured: relatedPost.isFeatured ?? false,
            category: relatedPost.category ?? {
                name: post.category.name,
                slug: post.category.slug,
            },
        }));
    }, [post]);

    const main = loading ? (
        <NewsDetailSkeleton />
    ) : hasError ? (
        <PublicStatePanel
            icon={WarningCircle}
            title={errorTitle}
            description={errorDescription}
            density="compact"
            className="mx-auto max-w-2xl"
        />
    ) : !post ? (
        <PublicStatePanel
            icon={MagnifyingGlass}
            title={notFoundTitle}
            density="compact"
            className="mx-auto max-w-2xl"
            action={(
                <Button asChild>
                    <Link href={basePath}>{backToNewsLabel}</Link>
                </Button>
            )}
        />
    ) : (
        <NewsDetail post={post} relatedPosts={relatedPosts} locale={locale} />
    );

    const aside = loading ? (
        <NewsSidebarSkeleton />
    ) : (
        <NewsSidebar
            categories={categories}
            recentPosts={recentPosts}
            popularPosts={popularPosts}
            currentCategory={categorySlug}
            locale={locale}
        />
    );

    return (
        <NewsPageShell
            breadcrumbs={post ? [
                { label: homeLabel, href: homeHref },
                { label: newsLabel, href: basePath },
                { label: post.category.name, href: `${basePath}/${post.category.slug}` },
                { label: post.title },
            ] : []}
            main={main}
            aside={aside}
        />
    );
}

export default NewsArticlePageClient;
