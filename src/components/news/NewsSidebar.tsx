"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Eye, Clock, FolderOpen, TrendingUp } from "lucide-react";
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
    locale = "vi"
}: NewsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const isEn = locale === "en";
    const newsBasePath = isEn ? "/en/news" : "/tin-tuc";

    // Labels
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
            {/* Search Widget */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Search size={18} className="text-blue-400" />
                    {labels.search}
                </h3>
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={labels.searchPlaceholder}
                            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-slate-800 placeholder:text-slate-800"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500 text-slate-800 hover:bg-blue-600 transition-colors cursor-pointer"
                            aria-label={labels.searchAriaLabel}
                        >
                            <Search size={16} />
                        </button>
                    </div>
                </form>
            </div>

            {/* Categories Widget */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FolderOpen size={18} className="text-blue-400" />
                    {labels.categories}
                </h3>
                <ul className="space-y-1">
                    {/* All categories link */}
                    <li>
                        <Link
                            href={newsBasePath}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${!currentCategory
                                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-800 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                : "hover:bg-white text-slate-800"
                                }`}
                        >
                            <span className="flex items-center gap-2 font-medium">
                                <ChevronRight size={14} className={!currentCategory ? "text-slate-800" : "text-slate-800"} />
                                {labels.allPosts}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${!currentCategory
                                ? "bg-white text-slate-800 border border-slate-200"
                                : "bg-white text-slate-800 border border-white/5"
                                }`}>
                                {totalPosts}
                            </span>
                        </Link>
                    </li>

                    {/* Category links */}
                    {categories.map((cat) => {
                        const isActive = currentCategory === cat.slug;
                        return (
                            <li key={cat.id}>
                                <Link
                                    href={`${newsBasePath}/${cat.slug}`}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${isActive
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-800 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                        : "hover:bg-white text-slate-800"
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <ChevronRight size={14} className={isActive ? "text-slate-800" : "text-slate-800"} />
                                        {cat.name}
                                    </span>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isActive
                                        ? "bg-white text-slate-800 border border-slate-200"
                                        : "bg-white text-slate-800 border border-white/5"
                                        }`}>
                                        {cat.postCount}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Recent Posts Widget */}
            {recentPosts.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-400" />
                        {labels.recentPosts}
                    </h3>
                    <ul className="space-y-3">
                        {recentPosts.slice(0, 5).map((post) => (
                            <li key={post.id}>
                                <Link
                                    href={`${newsBasePath}/${post.category.slug}/${post.slug}`}
                                    className="group block cursor-pointer"
                                >
                                    <span className="text-sm text-slate-800 group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {post.title}
                                    </span>
                                    {post.publishedAt && (
                                        <span className="text-xs text-slate-800 mt-1 block">
                                            {formatDistanceToNow(new Date(post.publishedAt), {
                                                addSuffix: true,
                                                locale: isEn ? enUS : vi
                                            })}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Popular Posts Widget */}
            {popularPosts.length > 0 && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-400" />
                        {labels.mostViewed}
                    </h3>
                    <ul className="space-y-3">
                        {popularPosts.slice(0, 5).map((post, index) => (
                            <li key={post.id}>
                                <Link
                                    href={`${newsBasePath}/${post.category.slug}/${post.slug}`}
                                    className="group flex gap-3 cursor-pointer"
                                >
                                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-slate-800 text-xs font-bold shadow-sm">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm text-slate-800 group-hover:text-blue-400 transition-colors line-clamp-2 block">
                                            {post.title}
                                        </span>
                                        <span className="text-xs text-slate-800 flex items-center gap-1 mt-1">
                                            <Eye size={12} />
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
