"use client";

import { Header, Footer } from "@/components/layout";
import { NewsCardSkeleton } from "@/components/skeletons";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

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

export default function NewsPage() {
    const t = useTranslations("news");
    const tCommon = useTranslations("common");
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const params = new URLSearchParams({ locale: "en", page: String(page), limit: "9" });
                if (selectedCategory) params.set("category", selectedCategory);

                const [postsRes, catsRes] = await Promise.all([
                    fetch(`/api/posts?${params}`),
                    fetch(`/api/categories?type=POST&locale=en`),
                ]);

                if (postsRes.ok) {
                    const data = await postsRes.json();
                    setPosts(data.data || []);
                    if (data.meta) {
                        setTotalPages(data.meta.totalPages || 1);
                    }
                }
                if (catsRes.ok) {
                    const data = await catsRes.json();
                    setCategories(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [page, selectedCategory]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="py-16 relative">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-4">
                            {t("title")}
                        </h1>
                        <p className="text-slate-800 max-w-2xl mx-auto">
                            {t("description")}
                        </p>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-6 border-b border-slate-200 glass-panel relative z-10">
                    <div className="container mx-auto px-4">
                        <div className="flex gap-3 flex-wrap">
                            <button
                                onClick={() => { setSelectedCategory(null); setPage(1); }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border border-blue-500" : "bg-white text-white hover:bg-white hover:text-white border border-slate-200"}`}
                            >
                                {tCommon("all")}
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.slug ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border border-blue-500" : "bg-white text-white hover:bg-white hover:text-white border border-slate-200"}`}
                                >
                                    {cat.name} ({cat.postCount})
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Posts Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <NewsCardSkeleton count={9} />
                        ) : posts.length === 0 ? (
                            <div className="text-center py-20 text-slate-800">
                                {t("noArticles")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map((post) => (
                                    <Link key={post.id} href={`/en/news/${post.category.slug}/${post.slug}`}
                                        className="group bg-white shadow-sm rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 border border-slate-200 hover:border-slate-200">
                                        <div className="relative aspect-video bg-white overflow-hidden">
                                            {post.featuredImage ? (
                                                <Image src={post.featuredImage} alt={post.title} fill sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                    {tCommon("noImage")}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <span className="text-xs text-blue-400 font-medium">{post.category.name}</span>
                                            <h3 className="text-lg font-semibold text-slate-800 mt-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-sm text-slate-800 mt-2 line-clamp-2">{post.excerpt}</p>
                                            )}
                                            {post.publishedAt && (
                                                <div className="text-xs text-slate-500 mt-3">
                                                    {new Date(post.publishedAt).toLocaleDateString("en-US", {
                                                        year: "numeric", month: "long", day: "numeric"
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border border-blue-500" : "bg-white text-white hover:bg-white hover:text-white border border-slate-200"}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
