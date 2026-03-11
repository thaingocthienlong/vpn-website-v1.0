"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { Search, ArrowRight, Star, GraduationCap, BookOpen, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

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
    viewCount?: number;
}

// Course type labels & colors
const typeConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ADMISSION: {
        label: "Tuyển sinh",
        color: "bg-emerald-600",
        icon: <FileText className="w-3 h-3" />,
    },
    SHORT_COURSE: {
        label: "Bồi dưỡng",
        color: "bg-blue-600",
        icon: <BookOpen className="w-3 h-3" />,
    },
    STUDY_ABROAD: {
        label: "Du học",
        color: "bg-purple-600",
        icon: <GraduationCap className="w-3 h-3" />,
    },
};

// Type filter tabs
const typeFilters = [
    { value: null, label: "Tất cả" },
    { value: "SHORT_COURSE", label: "Bồi dưỡng" },
    { value: "ADMISSION", label: "Tuyển sinh" },
];

export default function TrainingListingPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const coursesPerPage = 12;

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/api/courses?page=${page}&limit=${coursesPerPage}`;
            if (selectedType) {
                url += `&type=${selectedType}`;
            }
            if (searchQuery.trim()) {
                url += `&search=${encodeURIComponent(searchQuery.trim())}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setCourses(data.data);
                setTotal(data.meta.total);
                setTotalPages(Math.ceil(data.meta.total / coursesPerPage));
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    }, [page, selectedType, searchQuery]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Reset page when filter/search changes
    const handleTypeChange = (type: string | null) => {
        setSelectedType(type);
        setPage(1);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setPage(1);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="relative py-16 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-4">
                                Chương trình{" "}
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Đào tạo
                                </span>
                            </h1>
                            <p className="text-lg text-slate-800 mb-8">
                                Nâng cao năng lực với các khóa đào tạo chất lượng cao
                            </p>

                            {/* Search */}
                            <div className="max-w-xl mx-auto">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-800" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm khóa học..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters & Courses */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {/* Type Filters */}
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <div className="flex flex-wrap gap-2">
                                {typeFilters.map((filter) => (
                                    <button
                                        key={filter.value ?? "all"}
                                        onClick={() => handleTypeChange(filter.value)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${selectedType === filter.value
                                            ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                            : "bg-white text-white border border-slate-200 hover:bg-white"
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Results count */}
                        <p className="text-slate-800 mb-6">
                            Hiển thị <strong className="text-slate-200">{courses.length}</strong> / {total} khóa học
                        </p>

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                                        <div className="aspect-video bg-white" />
                                        <div className="p-5 space-y-3">
                                            <div className="h-3 bg-white rounded w-20" />
                                            <div className="h-4 bg-white rounded w-full" />
                                            <div className="h-4 bg-white rounded w-3/4" />
                                            <div className="h-3 bg-white rounded w-full" />
                                            <div className="h-3 bg-white rounded w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-16">
                                <GraduationCap className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                    Không tìm thấy khóa học
                                </h3>
                                <p className="text-slate-800">
                                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                                </p>
                            </div>
                        ) : (
                            /* Courses Grid */
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {courses.map((course) => {
                                    const type = typeConfig[course.type] || typeConfig.SHORT_COURSE;
                                    return (
                                        <Link
                                            key={course.id}
                                            href={`/dao-tao/${course.slug}`}
                                            className="group block h-full cursor-pointer"
                                        >
                                            <div className="bg-white shadow-sm rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-200 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all h-full flex flex-col cursor-pointer">
                                                {/* Image */}
                                                <div className="relative aspect-video bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center overflow-hidden">
                                                    {course.featuredImage ? (
                                                        <Image
                                                            src={course.featuredImage}
                                                            alt={course.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                        />
                                                    ) : (
                                                        <GraduationCap className="w-12 h-12 text-blue-400/30" />
                                                    )}
                                                    {/* Type Badge */}
                                                    <div className="absolute top-3 left-3 flex gap-2">
                                                        <span className={`px-2 py-1 rounded-full ${type.color} text-slate-800 text-xs font-medium flex items-center gap-1`}>
                                                            {type.icon}
                                                            {type.label}
                                                        </span>
                                                        {course.isFeatured && (
                                                            <span className="px-2 py-1 rounded-full bg-amber-500 text-slate-800 text-xs font-medium flex items-center gap-1">
                                                                <Star className="w-3 h-3" />
                                                                Nổi bật
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-5 flex-1 flex flex-col">
                                                    {course.category && (
                                                        <span className="text-xs text-blue-400 font-medium mb-2">
                                                            {course.category.name}
                                                        </span>
                                                    )}
                                                    <h3 className="text-base font-semibold text-slate-800 mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                                        {course.title}
                                                    </h3>
                                                    <p className="text-slate-600 text-sm line-clamp-2 flex-1">
                                                        {course.excerpt}
                                                    </p>
                                                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                                                        <span className="text-blue-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                                            Xem chi tiết
                                                            <ArrowRight className="w-4 h-4" />
                                                        </span>
                                                        {course.isRegistrationOpen && (
                                                            <span className="text-xs text-emerald-400 font-medium">
                                                                Đang tuyển sinh
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && !loading && (
                            <div className="flex justify-center mt-10">
                                <div className="flex gap-2">
                                    {page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page - 1)}
                                        >
                                            Trước
                                        </Button>
                                    )}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <Button
                                            key={p}
                                            variant={p === page ? "primary" : "ghost"}
                                            size="sm"
                                            onClick={() => setPage(p)}
                                        >
                                            {p}
                                        </Button>
                                    ))}
                                    {page < totalPages && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                        >
                                            Sau
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="glass-panel p-12 rounded-2xl border border-slate-200 text-center">
                            <h2 className="text-2xl font-heading font-bold text-slate-800 mb-4">
                                Bạn cần tư vấn khóa học?
                            </h2>
                            <p className="text-slate-800 mb-8 max-w-2xl mx-auto">
                                Liên hệ với chúng tôi để được tư vấn khóa học phù hợp nhất với nhu cầu của bạn
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/dao-tao/dang-ky">
                                    <Button variant="primary" size="lg">
                                        Đăng ký khóa học
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/lien-he">
                                    <Button variant="outline" size="lg" className="border-slate-200 text-slate-800 hover:bg-white">
                                        Liên hệ tư vấn
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
