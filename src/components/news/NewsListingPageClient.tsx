"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Article,
    FolderOpen,
    NewspaperClipping,
    WarningCircle,
} from "@phosphor-icons/react";
import { NewsCardSkeleton, NewsSidebarSkeleton } from "@/components/skeletons";
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

interface NewsListingPageClientProps {
    locale: "vi" | "en";
    basePath: string;
    title: string;
    description: string;
    allLabel: string;
    categoriesLabel: string;
    latestLabel: string;
    emptyTitle: string;
    emptyDescription?: string;
    errorTitle: string;
    errorDescription?: string;
    filterMode?: "links" | "state";
    postsPerPage?: number;
    showFeatured?: boolean;
    showHeroPanel?: boolean;
    gridColumns?: 2 | 3;
    listLayout?: "grid" | "rows";
}

function createPageUrl(basePath: string, page: number) {
    return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function NewsListingPageClient({
    locale,
    basePath,
    title,
    description,
    allLabel,
    categoriesLabel,
    latestLabel,
    emptyTitle,
    emptyDescription,
    errorTitle,
    errorDescription,
    filterMode = "links",
    postsPerPage: postsPerPageProp,
    showFeatured: showFeaturedProp,
    showHeroPanel = true,
    gridColumns = 3,
    listLayout = "grid",
}: NewsListingPageClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialPage = Number(searchParams.get("page") || "1");
    const [posts, setPosts] = useState<NewsPost[]>([]);
    const [categories, setCategories] = useState<NewsCategory[]>([]);
    const [recentPosts, setRecentPosts] = useState<NewsPost[]>([]);
    const [popularPosts, setPopularPosts] = useState<NewsPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [page, setPage] = useState(Number.isFinite(initialPage) && initialPage > 0 ? initialPage : 1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = postsPerPageProp ?? (filterMode === "state" ? 9 : 12);
    const showFeatured = showFeaturedProp ?? filterMode !== "state";

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
                    page: String(page),
                    limit: String(postsPerPage),
                });

                if (locale === "en") {
                    postsParams.set("locale", "en");
                }

                if (filterMode === "state" && selectedCategory) {
                    postsParams.set("category", selectedCategory);
                }

                const categoriesParams = new URLSearchParams({ type: "POST" });
                const recentParams = new URLSearchParams({ limit: "5", sort: "newest" });
                const popularParams = new URLSearchParams({ limit: "5", sort: "popular" });

                if (locale === "en") {
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
                    throw new Error("Failed to fetch news data");
                }

                const [postsData, categoriesData, recentData, popularData] = await Promise.all([
                    postsRes.json(),
                    categoriesRes.json(),
                    recentRes.json(),
                    popularRes.json(),
                ]);

                if (!ignore) {
                    setPosts(postsData.data || []);
                    setTotalPages(
                        postsData.meta?.totalPages ||
                        Math.max(1, Math.ceil((postsData.meta?.total || 0) / postsPerPage))
                    );
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
                    console.error("Error fetching news:", error);
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
    }, [filterMode, locale, page, postsPerPage, selectedCategory]);

    const heroPanel = useMemo(() => {
        if (!showHeroPanel) {
            return undefined;
        }

        const panelData = [
            {
                key: categoriesLabel,
                icon: FolderOpen,
                label: categoriesLabel,
                value: String(categories.length),
            },
            {
                key: latestLabel,
                icon: Article,
                label: latestLabel,
                value: String(posts.length),
            },
        ];

        return panelData.map((item) => {
            const Icon = item.icon;

            return (
                <div key={item.key} className="public-panel-muted rounded-[1.9rem] p-5">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.12)] text-[var(--accent-strong)]">
                        <Icon className="h-5 w-5" weight="duotone" />
                    </div>
                    <p className="text-sm font-semibold tracking-[0.14em] text-[var(--ink-muted)] uppercase">
                        {item.label}
                    </p>
                    <p className="mt-3 font-heading text-[2.5rem] text-[var(--ink)]">{item.value}</p>
                </div>
            );
        });
    }, [categories.length, categoriesLabel, latestLabel, posts.length, showHeroPanel]);

    const controls = (
        <section className="public-panel rounded-[2rem] p-3">
            <div className="flex flex-wrap gap-2">
                {filterMode === "state" ? (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedCategory(null);
                                setPage(1);
                                router.replace(basePath, { scroll: false });
                            }}
                            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                                !selectedCategory
                                    ? "bg-[var(--accent)] text-white"
                                    : "bg-white text-[var(--ink)]"
                            }`}
                        >
                            {allLabel}
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => {
                                    setSelectedCategory(category.slug);
                                    setPage(1);
                                    router.replace(basePath, { scroll: false });
                                }}
                                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                                    selectedCategory === category.slug
                                        ? "bg-[var(--accent)] text-white"
                                        : "bg-white text-[var(--ink)]"
                                }`}
                            >
                                {category.name} ({category.postCount})
                            </button>
                        ))}
                    </>
                ) : (
                    <>
                        <Link
                            href={basePath}
                            className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors"
                        >
                            {allLabel}
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`${basePath}/${category.slug}`}
                                className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[rgba(23,88,216,0.08)]"
                            >
                                {category.name} ({category.postCount})
                            </Link>
                        ))}
                    </>
                )}
            </div>
        </section>
    );

    const main = loading ? (
        <NewsCardSkeleton count={postsPerPage} columns={gridColumns} layout={listLayout} />
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
            <NewsList
                posts={posts}
                showFeatured={showFeatured}
                locale={locale}
                columns={gridColumns}
                layout={listLayout}
            />
            {totalPages > 1 && (
                <NewsPagination
                    currentPage={page}
                    totalPages={totalPages}
                    basePath={basePath}
                    locale={locale}
                    onPageChange={(nextPage) => {
                        setPage(nextPage);
                        router.replace(createPageUrl(basePath, nextPage), { scroll: false });
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
            currentCategory={filterMode === "state" ? selectedCategory ?? undefined : undefined}
            locale={locale}
        />
    );

    return (
        <NewsPageShell
            title={title}
            description={description}
            secondaryPanel={heroPanel}
            controls={controls}
            main={main}
            aside={aside}
        />
    );
}

export default NewsListingPageClient;
