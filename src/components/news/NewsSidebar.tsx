"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CaretRight,
    Clock,
    Eye,
    Folder,
    MagnifyingGlass,
    TrendUp,
} from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";

interface Category {
    id: string;
    name: string;
    slug: string;
    postCount: number;
}

interface Post {
    id: string;
    title: string;
    slug: string;
    category: { slug: string };
    publishedAt: string | null;
    viewCount: number;
}

interface NewsSidebarProps {
    categories: Category[];
    recentPosts?: Post[];
    popularPosts?: Post[];
    currentCategory?: string;
    onSearch?: (query: string) => void;
    locale?: "vi" | "en";
}

export function NewsSidebar({
    categories,
    recentPosts = [],
    popularPosts = [],
    currentCategory,
    onSearch,
    locale = "vi",
}: NewsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const isEn = locale === "en";
    const newsBasePath = isEn ? "/en/news" : "/tin-tuc";

    const labels = isEn ? {
        search: "Search",
        searchPlaceholder: "Enter keyword...",
        searchAriaLabel: "Search",
        categories: "Categories",
        allPosts: "All articles",
        recentPosts: "Recent Posts",
        mostViewed: "Most Viewed",
        views: "views",
    } : {
        search: "Tìm kiếm",
        searchPlaceholder: "Nhập từ khóa...",
        searchAriaLabel: "Tìm kiếm",
        categories: "Danh mục",
        allPosts: "Tất cả bài viết",
        recentPosts: "Bài viết mới",
        mostViewed: "Xem nhiều nhất",
        views: "lượt xem",
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            if (onSearch) {
                onSearch(searchQuery);
            } else {
                router.push(`${newsBasePath}?q=${encodeURIComponent(searchQuery.trim())}`);
            }
        }
    };

    const totalPosts = categories.reduce((sum, c) => sum + c.postCount, 0);

    return (
        <aside className="space-y-6">
            <div className="public-panel rounded-[2rem] p-5">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--ink)]">
                    <MagnifyingGlass className="h-[18px] w-[18px] text-[var(--accent-strong)]" weight="bold" />
                    {labels.search}
                </h3>
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={labels.searchPlaceholder}
                            className="public-input-surface w-full rounded-[1.25rem] px-4 py-3 pr-12 text-[var(--ink)] transition-all placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[rgba(23,88,216,0.18)]"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[0.95rem] bg-[var(--accent)] p-2 text-white transition-colors hover:bg-[var(--accent-strong)]"
                            aria-label={labels.searchAriaLabel}
                        >
                            <MagnifyingGlass className="h-4 w-4" weight="bold" />
                        </button>
                    </div>
                </form>
            </div>

            <div className="public-panel rounded-[2rem] p-5">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--ink)]">
                    <Folder className="h-[18px] w-[18px] text-[var(--accent-strong)]" weight="duotone" />
                    {labels.categories}
                </h3>
                <ul className="space-y-1">
                    <li>
                        <Link
                            href={newsBasePath}
                            className={`flex items-center justify-between rounded-[1.1rem] px-3 py-2.5 transition-all ${
                                !currentCategory
                                    ? "bg-[var(--accent)] text-white"
                                    : "text-[var(--ink)] hover:bg-[rgba(23,88,216,0.06)]"
                            }`}
                        >
                            <span className="flex items-center gap-2 font-medium">
                                <CaretRight className={`h-4 w-4 ${!currentCategory ? "text-white" : "text-[var(--ink-muted)]"}`} weight="bold" />
                                {labels.allPosts}
                            </span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${!currentCategory ? "border border-white/12 bg-white/14 text-white" : "border border-[rgba(26,72,164,0.08)] bg-white text-[var(--ink)]"}`}>
                                {totalPosts}
                            </span>
                        </Link>
                    </li>

                    {categories.map((cat) => {
                        const isActive = currentCategory === cat.slug;

                        return (
                            <li key={cat.id}>
                                <Link
                                    href={`${newsBasePath}/${cat.slug}`}
                                    className={`flex items-center justify-between rounded-[1.1rem] px-3 py-2.5 transition-all ${
                                        isActive
                                            ? "bg-[var(--accent)] text-white"
                                            : "text-[var(--ink)] hover:bg-[rgba(23,88,216,0.06)]"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <CaretRight className={`h-4 w-4 ${isActive ? "text-white" : "text-[var(--ink-muted)]"}`} weight="bold" />
                                        {cat.name}
                                    </span>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${isActive ? "border border-white/12 bg-white/14 text-white" : "border border-[rgba(26,72,164,0.08)] bg-white text-[var(--ink)]"}`}>
                                        {cat.postCount}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {recentPosts.length > 0 && (
                <div className="public-panel rounded-[2rem] p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--ink)]">
                        <Clock className="h-[18px] w-[18px] text-[var(--accent-strong)]" weight="duotone" />
                        {labels.recentPosts}
                    </h3>
                    <ul className="space-y-3">
                        {recentPosts.slice(0, 5).map((post) => (
                            <li key={post.id}>
                                <Link href={`${newsBasePath}/${post.category.slug}/${post.slug}`} className="group block">
                                    <span className="line-clamp-2 text-sm text-[var(--ink)] transition-colors group-hover:text-[var(--accent-strong)]">
                                        {post.title}
                                    </span>
                                    {post.publishedAt && (
                                        <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                                            {formatDistanceToNow(new Date(post.publishedAt), {
                                                addSuffix: true,
                                                locale: isEn ? enUS : vi,
                                            })}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {popularPosts.length > 0 && (
                <div className="public-panel rounded-[2rem] p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--ink)]">
                        <TrendUp className="h-[18px] w-[18px] text-[var(--accent-strong)]" weight="duotone" />
                        {labels.mostViewed}
                    </h3>
                    <ul className="space-y-3">
                        {popularPosts.slice(0, 5).map((post, index) => (
                            <li key={post.id}>
                                <Link href={`${newsBasePath}/${post.category.slug}/${post.slug}`} className="group flex gap-3">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(23,88,216,0.12)] text-xs font-bold text-[var(--accent-strong)]">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <span className="block line-clamp-2 text-sm text-[var(--ink)] transition-colors group-hover:text-[var(--accent-strong)]">
                                            {post.title}
                                        </span>
                                        <span className="mt-1 flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                                            <Eye className="h-3.5 w-3.5" weight="bold" />
                                            {post.viewCount.toLocaleString(isEn ? "en-US" : "vi-VN")} {labels.views}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
    );
}

export default NewsSidebar;
