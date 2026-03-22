"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, NewspaperClipping, WarningCircle } from "@phosphor-icons/react";
import { NewsCardSkeleton, NewsSidebarSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { PublicStatePanel } from "@/components/route-shell";
import { NewsList } from "./NewsList";
import { NewsPagination } from "./NewsPagination";
import { NewsSidebar } from "./NewsSidebar";
import { NewsPageShell } from "./NewsPageShell";

interface NewsPost {
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

interface NewsCategory {
    id: string;
    name: string;
    slug: string;
    postCount: number;
}

interface NewsCategoryPageClientProps {
    locale: "vi" | "en";
    basePath: string;
    homeHref: string;
    homeLabel: string;
    newsLabel: string;
    categorySlug: string;
    categoryNotFoundTitle: string;
    backToNewsLabel: string;
    categoryDescriptionPrefix: string;
    emptyTitle: string;
    emptyDescription?: string;
    errorTitle: string;
    errorDescription?: string;
}

function createCategoryPageUrl(basePath: string, categorySlug: string, page: number) {
    const categoryPath = `${basePath}/${categorySlug}`;

    return page <= 1 ? categoryPath : `${categoryPath}?page=${page}`;
}

export function NewsCategoryPageClient({
    locale,
    basePath,
    homeHref,
    homeLabel,
    newsLabel,
    categorySlug,
    categoryNotFoundTitle,
    backToNewsLabel,
    categoryDescriptionPrefix,
    emptyTitle,
    emptyDescription,
    errorTitle,
    errorDescription,
}: NewsCategoryPageClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialPage = Number(searchParams.get("page") || "1");
    const [posts, setPosts] = useState<NewsPost[]>([]);
    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [recentPosts, setRecentPosts] = useState<NewsPost[]>([]);
    const [popularPosts, setPopularPosts] = useState<NewsPost[]>([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [page, setPage] = useState(Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 9;

    useEffect(() => {
        const nextPage = Number(searchParams.get("page") || "1");

        setPage(Number.isFinite(nextPage) && nextPage > 0 ? nextPage : 1);
    }, [searchParams]);

    useEffect(() => {
        let ignore = false;

        async function fetchData() {
            setLoading(true);
            setHasError(false);

            try {
                const postsParams = new URLSearchParams({
                    category: categorySlug,
                    page: String(page),
                    limit: String(postsPerPage),
                });
                const categoriesParams = new URLSearchParams({ type: "POST" });
                const recentParams = new URLSearchParams({ limit: "5", sort: "newest" });
                const popularParams = new URLSearchParams({ limit: "5", sort: "popular" });

                if (locale === "en") {
                    postsParams.set("locale", "en");
                    categoriesParams.set("locale", "en");
                    recentParams.set("locale", "en");
                    popularParams.set("locale", "en");
                }

                const [postsRes, categoriesRes, recentRes, popularRes] = await Promise.all([
                    fetch(`/api/posts?${postsParams.toString()}`),
                    fetch(`/api/categories?${categoriesParams.toString()}`),
                    fetch(`/api/posts?${recentParams.toString()}`),
                    fetch(`/api/posts?${popularParams.toString()}`),
                ]);

                if (!postsRes.ok || !categoriesRes.ok || !recentRes.ok || !popularRes.ok) {
                    throw new Error("Failed to fetch category page data");
                }

                const [postsData, categoriesData, recentData, popularData] = await Promise.all([
                    postsRes.json(),
                    categoriesRes.json(),
                    recentRes.json(),
                    popularRes.json(),
                ]);

                const resolvedCategories = (categoriesData.data || []).map((category: NewsCategory) => ({
                    ...category,
                    postCount: category.postCount ?? 0,
                }));
                const matchedCategory = resolvedCategories.find((category: NewsCategory) => category.slug === categorySlug);

                if (!ignore) {
                    setPosts(postsData.data || []);
                    setTotalPages(
                        postsData.meta?.totalPages ||
                        Math.max(1, Math.ceil((postsData.meta?.total || 0) / postsPerPage))
                    );
                    setCategories(resolvedCategories);
                    setCategoryName(matchedCategory?.name || "");
                    setRecentPosts(recentData.data || []);
                    setPopularPosts(popularData.data || []);
                }
            } catch (error) {
                if (!ignore) {
                    console.error("Error fetching category page data:", error);
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
    }, [categorySlug, locale, page]);

    if (!loading && !categoryName) {
        return (
            <NewsPageShell
                main={(
                    <PublicStatePanel
                        icon={MagnifyingGlass}
                        title={categoryNotFoundTitle}
                        action={(
                            <Button asChild>
                                <Link href={basePath}>{backToNewsLabel}</Link>
                            </Button>
                        )}
                    />
                )}
            />
        );
    }

    const main = loading ? (
        <NewsCardSkeleton count={postsPerPage} />
    ) : hasError ? (
        <PublicStatePanel
            icon={WarningCircle}
            title={errorTitle}
            description={errorDescription}
        />
    ) : posts.length === 0 ? (
        <PublicStatePanel
            icon={NewspaperClipping}
            title={emptyTitle}
            description={emptyDescription}
        />
    ) : (
        <div className="space-y-8">
            <NewsList posts={posts} showFeatured={false} locale={locale} />
            {totalPages > 1 && (
                <NewsPagination
                    currentPage={page}
                    totalPages={totalPages}
                    basePath={`${basePath}/${categorySlug}`}
                    locale={locale}
                    onPageChange={(nextPage) => {
                        setPage(nextPage);
                        router.replace(createCategoryPageUrl(basePath, categorySlug, nextPage), { scroll: false });
                    }}
                />
            )}
        </div>
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
            breadcrumbs={[
                { label: homeLabel, href: homeHref },
                { label: newsLabel, href: basePath },
                { label: categoryName || categorySlug },
            ]}
            badge={newsLabel}
            title={categoryName || categorySlug}
            description={`${categoryDescriptionPrefix} ${categoryName || categorySlug}`}
            main={main}
            aside={aside}
        />
    );
}

export default NewsCategoryPageClient;
