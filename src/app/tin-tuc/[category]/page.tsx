"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { NewsList, NewsSidebar, NewsPagination } from "@/components/news";
import { NewsCardSkeleton, NewsSidebarSkeleton } from "@/components/skeletons";
import { ChevronRight } from "lucide-react";

// News categories
const categoryMap: Record<string, string> = {
    "su-kien": "Sự kiện",
    "tin-tuc": "Tin tức",
    "dao-tao": "Đào tạo",
    "du-an": "Dự án",
    "hop-tac": "Hợp tác",
};

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    category: { name: string; slug: string };
    publishedAt: string | null;
    viewCount: number;
    isFeatured: boolean;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    postCount: number;
}

export default function NewsCategoryPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const categoryName = categoryMap[categorySlug];

    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [popularPosts, setPopularPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 9;

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch posts by category
                const postsRes = await fetch(`/api/posts?category=${categorySlug}&page=${page}&limit=${postsPerPage}`);
                const postsData = await postsRes.json();
                if (postsData.success) {
                    setPosts(postsData.data);
                    setTotalPages(Math.ceil(postsData.meta.total / postsPerPage));
                }

                // Fetch all categories
                const catRes = await fetch("/api/categories?type=POST");
                const catData = await catRes.json();
                if (catData.success) {
                    setCategories(catData.data.map((c: { id: string; name: string; slug: string; postCount: number }) => ({
                        id: c.id,
                        name: c.name,
                        slug: c.slug,
                        postCount: c.postCount ?? 0
                    })));
                }

                // Recent posts (latest 5)
                const recentRes = await fetch("/api/posts?limit=5&sort=newest");
                const recentData = await recentRes.json();
                if (recentData.success) {
                    setRecentPosts(recentData.data);
                }

                // Popular posts (by views)
                const popularRes = await fetch("/api/posts?limit=5&sort=popular");
                const popularData = await popularRes.json();
                if (popularData.success) {
                    setPopularPosts(popularData.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [categorySlug, page]);

    // 404 cho category không hợp lệ
    if (!categoryName) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-24 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy danh mục</h1>
                        <Link href="/tin-tuc" className="text-blue-600 hover:underline">
                            ← Quay lại Tin tức
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="relative py-16 bg-gradient-to-br from-blue-50 via-white to-cyan-50 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />

                    <div className="container mx-auto px-4 relative z-10">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-6 justify-center">
                            <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
                            <ChevronRight size={14} />
                            <Link href="/tin-tuc" className="hover:text-blue-600">Tin tức</Link>
                            <ChevronRight size={14} />
                            <span className="text-slate-700 font-medium">{categoryName}</span>
                        </nav>

                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-4">
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                    {categoryName}
                                </span>
                            </h1>
                            <p className="text-lg text-slate-600">
                                Tổng hợp các bài viết thuộc danh mục {categoryName}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12 bg-slate-50/50">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-3">
                                    <NewsCardSkeleton count={postsPerPage} />
                                </div>
                                <div className="lg:col-span-1">
                                    <NewsSidebarSkeleton />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                {/* Main Content - 3 columns */}
                                <div className="lg:col-span-3">
                                    <NewsList posts={posts} showFeatured={false} />

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-8">
                                            <NewsPagination
                                                currentPage={page}
                                                totalPages={totalPages}
                                                basePath={`/tin-tuc/${categorySlug}`}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar - 1 column */}
                                <div className="lg:col-span-1">
                                    <NewsSidebar
                                        categories={categories}
                                        recentPosts={recentPosts}
                                        popularPosts={popularPosts}
                                        currentCategory={categorySlug}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
