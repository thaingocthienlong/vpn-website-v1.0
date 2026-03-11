"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header, Footer } from "@/components/layout";
import { NewsSidebar, NewsDetail } from "@/components/news";
import { NewsDetailSkeleton, NewsSidebarSkeleton } from "@/components/skeletons";
import { ChevronRight } from "lucide-react";

interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featuredImage: { url: string; alt: string | null } | null;
    category: { id: string; name: string; slug: string };
    author: { name: string };
    tags: { name: string; slug: string }[];
    publishedAt: string | null;
    viewCount: number;
    seo: { metaTitle: string; metaDescription: string };
    relatedPosts: {
        id: string;
        title: string;
        slug: string;
        excerpt: string | null;
        featuredImage: string | null;
        publishedAt: string | null;
    }[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
    postCount: number;
}

export default function NewsDetailPage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const postSlug = params.slug as string;

    const [post, setPost] = useState<Post | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [popularPosts, setPopularPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch post
                const postRes = await fetch(`/api/posts/${postSlug}`);
                const postData = await postRes.json();
                if (postData.success) {
                    setPost(postData.data);
                } else {
                    setError(true);
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

                // Recent posts
                const recentRes = await fetch("/api/posts?limit=5&sort=newest");
                const recentData = await recentRes.json();
                if (recentData.success) {
                    setRecentPosts(recentData.data);
                }

                // Popular posts
                const popularRes = await fetch("/api/posts?limit=5&sort=popular");
                const popularData = await popularRes.json();
                if (popularData.success) {
                    setPopularPosts(popularData.data);
                }
            } catch (err) {
                console.error("Error fetching post:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [postSlug]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-24">
                    <section className="pt-6 pb-12 bg-slate-50/50">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                <div className="lg:col-span-3">
                                    <NewsDetailSkeleton />
                                </div>
                                <div className="lg:col-span-1">
                                    <NewsSidebarSkeleton />
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-24 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy bài viết</h1>
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
                {/* Hero Breadcrumb */}
                <section className="relative py-4 bg-gradient-to-r from-blue-50/80 via-white to-cyan-50/80 border-b border-slate-100">
                    <div className="container mx-auto px-4 relative z-10">
                        <nav className="flex items-center gap-2 text-sm leading-5 text-slate-500 overflow-hidden whitespace-nowrap">
                            <Link href="/" className="hover:text-blue-600 transition-colors shrink-0 inline-flex items-center">Trang chủ</Link>
                            <ChevronRight size={14} className="text-slate-800 shrink-0" />
                            <Link href="/tin-tuc" className="hover:text-blue-600 transition-colors shrink-0 inline-flex items-center">Tin tức</Link>
                            <ChevronRight size={14} className="text-slate-800 shrink-0" />
                            <Link href={`/tin-tuc/${categorySlug}`} className="hover:text-blue-600 transition-colors shrink-0 inline-flex items-center">
                                {post.category.name}
                            </Link>
                            <ChevronRight size={14} className="text-slate-800 shrink-0" />
                            <span className="text-slate-700 font-medium truncate">{post.title}</span>
                        </nav>
                    </div>
                </section>

                {/* Content */}
                <section className="pt-6 pb-12 bg-slate-50/50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Main Content - 3 columns */}
                            <div className="lg:col-span-3">
                                <NewsDetail post={post} />
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
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
