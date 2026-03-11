"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
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

export default function NewsArticlePage() {
    const params = useParams();
    const categorySlug = params.category as string;
    const postSlug = params.slug as string;
    const t = useTranslations("news");
    const tBreadcrumb = useTranslations("breadcrumb");

    const [post, setPost] = useState<Post | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [popularPosts, setPopularPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch post with locale
                const postRes = await fetch(`/api/posts/${postSlug}?locale=en`);
                const postData = await postRes.json();
                if (postData.success) {
                    setPost(postData.data);
                } else {
                    setError(true);
                }

                // Fetch categories
                const catRes = await fetch("/api/categories?type=POST&locale=en");
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
                const recentRes = await fetch("/api/posts?limit=5&sort=newest&locale=en");
                const recentData = await recentRes.json();
                if (recentData.success) {
                    setRecentPosts(recentData.data);
                }

                // Popular posts
                const popularRes = await fetch("/api/posts?limit=5&sort=popular&locale=en");
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
                    <section className="pt-6 pb-12 relative">
                        <div className="container mx-auto px-4 relative z-10">
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
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t("noArticles")}</h1>
                        <Link href="/en/news" className="text-blue-400 hover:text-blue-700 hover:underline">
                            ← {t("backToNews")}
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
                <section className="relative py-4 before:content-[''] before:absolute before:inset-0 before:bg-blue-900/20 border-b border-slate-200">
                    <div className="container mx-auto px-4 relative z-10">
                        <nav className="flex items-center gap-2 text-sm leading-5 text-slate-800 overflow-hidden whitespace-nowrap">
                            <Link href="/en" className="hover:text-blue-400 transition-colors shrink-0 inline-flex items-center">{tBreadcrumb("home")}</Link>
                            <ChevronRight size={14} className="text-slate-500 shrink-0" />
                            <Link href="/en/news" className="hover:text-blue-400 transition-colors shrink-0 inline-flex items-center">{t("title")}</Link>
                            <ChevronRight size={14} className="text-slate-500 shrink-0" />
                            <Link href={`/en/news/${categorySlug}`} className="hover:text-blue-400 transition-colors shrink-0 inline-flex items-center">
                                {post.category.name}
                            </Link>
                            <ChevronRight size={14} className="text-slate-500 shrink-0" />
                            <span className="text-slate-800 font-medium truncate">{post.title}</span>
                        </nav>
                    </div>
                </section>

                {/* Content */}
                <section className="pt-6 pb-12 relative">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Main Content - 3 columns */}
                            <div className="lg:col-span-3">
                                <NewsDetail post={post} locale="en" />
                            </div>

                            {/* Sidebar - 1 column */}
                            <div className="lg:col-span-1">
                                <NewsSidebar
                                    categories={categories}
                                    recentPosts={recentPosts}
                                    popularPosts={popularPosts}
                                    currentCategory={categorySlug}
                                    locale="en"
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
