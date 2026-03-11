"use client";

import { Header, Footer } from "@/components/layout";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface Course {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    type: string;
    isFeatured: boolean;
    isRegistrationOpen: boolean;
    category: { name: string; slug: string } | null;
}

export default function TrainingPage() {
    const t = useTranslations("training");
    const tCommon = useTranslations("common");
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState("");

    const courseTypes = [
        { value: "", label: t("types.all") },
        { value: "ADMISSION", label: t("types.ADMISSION") },
        { value: "SHORT_COURSE", label: t("types.SHORT_COURSE") },
        { value: "STUDY_ABROAD", label: t("types.STUDY_ABROAD") },
    ];

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true);
            try {
                const params = new URLSearchParams({ locale: "en", limit: "20" });
                if (selectedType) params.set("type", selectedType);

                const res = await fetch(`/api/courses?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourses(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, [selectedType]);

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

                {/* Type Filter */}
                <section className="py-6 border-b border-slate-200 glass-panel relative z-10">
                    <div className="container mx-auto px-4">
                        <div className="flex gap-3 flex-wrap">
                            {courseTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedType(type.value)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedType === type.value ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.5)] border border-blue-500" : "bg-white text-white hover:bg-white hover:text-white border border-slate-200"}`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Courses Grid */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white rounded-xl h-72 border border-white/5" />
                                ))}
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-20 text-slate-800">
                                {tCommon("noResults")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map((course) => (
                                    <Link key={course.id} href={`/en/training/${course.slug}`}
                                        className="group bg-white shadow-sm rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 border border-slate-200 hover:border-slate-200">
                                        <div className="relative aspect-video bg-white overflow-hidden">
                                            {course.featuredImage ? (
                                                <Image src={course.featuredImage} alt={course.title} fill sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                                    {tCommon("noImage")}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                {course.category && (
                                                    <span className="text-xs text-blue-400 font-medium">{course.category.name}</span>
                                                )}
                                                {course.isRegistrationOpen && (
                                                    <span className="text-xs bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded-full">
                                                        {tCommon("open")}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                                {course.title}
                                            </h3>
                                            {course.excerpt && (
                                                <p className="text-sm text-slate-800 mt-2 line-clamp-2">{course.excerpt}</p>
                                            )}
                                        </div>
                                    </Link>
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
