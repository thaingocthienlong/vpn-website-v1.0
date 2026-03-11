"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/layout";
import { NewsCardSkeleton, NewsSidebarSkeleton } from "@/components/skeletons";
import { NewsList, NewsSidebar, NewsPagination } from "@/components/news";

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

export default function NewsListingPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [popularPosts, setPopularPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const postsPerPage = 12;

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch posts
                const postsRes = await fetch(`/api/posts?page=${page}&limit=${postsPerPage}`);
                const postsData = await postsRes.json();
                if (postsData.success) {
                    setPosts(postsData.data);
                    setTotalPages(Math.ceil(postsData.meta.total / postsPerPage));
                }

                // Fetch categories
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
    }, [page]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="relative py-16 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-4">
                                Tin tức &{" "}
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Sự kiện
                                </span>
                            </h1>
                            <p className="text-lg text-slate-600">
                                Cập nhật những hoạt động và tin tức mới nhất từ Viện Phương Nam
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="py-12">
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
                                    <NewsList
                                        posts={posts}
                                        showFeatured={true}
                                    />

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-8">
                                            <NewsPagination
                                                currentPage={page}
                                                totalPages={totalPages}
                                                basePath="/tin-tuc"
                                                onPageChange={setPage}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar - 1 column */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-28">
                                        <NewsSidebar
                                            categories={categories}
                                            recentPosts={recentPosts}
                                            popularPosts={popularPosts}
                                        />
                                    </div>
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
