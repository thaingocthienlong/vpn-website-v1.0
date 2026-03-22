"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, MagnifyingGlass, Star } from "@phosphor-icons/react";
import { Button, Input } from "@/components/ui";
import { PublicPageShell, PublicStatePanel } from "@/components/route-shell";

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

const typeConfig: Record<string, { label: string }> = {
    ADMISSION: { label: "Tuyển sinh" },
    SHORT_COURSE: { label: "Bồi dưỡng" },
    STUDY_ABROAD: { label: "Du học" },
};

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

            const response = await fetch(url);
            const data = await response.json();

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

    const controls = (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <Input
                value={searchQuery}
                onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                }}
                placeholder="Tìm kiếm khóa học..."
                leftAddon={<MagnifyingGlass className="h-5 w-5" weight="bold" />}
            />

            <div className="public-panel rounded-[1.7rem] p-3">
                <div className="flex flex-wrap gap-2">
                    {typeFilters.map((filter) => (
                        <button
                            key={filter.value ?? "all"}
                            type="button"
                            onClick={() => {
                                setSelectedType(filter.value);
                                setPage(1);
                            }}
                            className={`rounded-[1rem] px-4 py-2.5 text-sm font-medium transition-colors ${
                                selectedType === filter.value
                                    ? "bg-[var(--accent)] text-[var(--paper)]"
                                    : "bg-[rgba(255,255,255,0.72)] text-[var(--ink)] hover:bg-white"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const main = (
        <div className="space-y-8">
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
                Hiển thị <strong className="text-[var(--ink)]">{courses.length}</strong> / {total} khóa học
            </p>

            {loading ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="public-panel h-[320px] animate-pulse rounded-[1.9rem]" />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <PublicStatePanel
                    icon={GraduationCap}
                    title="Không tìm thấy khóa học"
                    description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                />
            ) : (
                <>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course, index) => {
                            const type = typeConfig[course.type] || typeConfig.SHORT_COURSE;

                            return (
                                <Link
                                    key={course.id}
                                    href={`/dao-tao/${course.slug}`}
                                    className={`public-panel interactive-card group overflow-hidden rounded-[2rem] ${
                                        index % 3 === 1 ? "xl:translate-y-6" : ""
                                    }`}
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-[rgba(23,88,216,0.08)]">
                                        {course.featuredImage ? (
                                            <Image
                                                src={course.featuredImage}
                                                alt={course.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[var(--accent-strong)]">
                                                <GraduationCap className="h-10 w-10" weight="duotone" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4 p-5 md:p-6">
                                        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                                            <span className="rounded-full border border-[rgba(23,88,216,0.18)] bg-[rgba(23,88,216,0.08)] px-3 py-1 text-[var(--accent-strong)]">
                                                {type.label}
                                            </span>
                                            {course.isFeatured && (
                                                <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(148,102,46,0.18)] bg-[rgba(148,102,46,0.12)] px-3 py-1 text-[var(--warning)]">
                                                    <Star className="h-3.5 w-3.5" weight="fill" />
                                                    Nổi bật
                                                </span>
                                            )}
                                        </div>

                                        {course.category && (
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                                {course.category.name}
                                            </p>
                                        )}

                                        <h2 className="text-2xl leading-tight text-[var(--ink)]">
                                            {course.title}
                                        </h2>

                                        {course.excerpt && (
                                            <p className="line-clamp-3 text-sm leading-7 text-[var(--ink-soft)]">
                                                {course.excerpt}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between border-t border-[rgba(26,72,164,0.1)] pt-4">
                                            <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent-strong)]">
                                                Xem chi tiết
                                                <ArrowRight className="h-4 w-4" weight="bold" />
                                            </span>
                                            {course.isRegistrationOpen && (
                                                <span className="text-xs text-[var(--success)]">Đang tuyển sinh</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {page > 1 && (
                                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)}>
                                    Trước
                                </Button>
                            )}
                            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                                <Button
                                    key={item}
                                    variant={item === page ? "primary" : "ghost"}
                                    size="sm"
                                    onClick={() => setPage(item)}
                                >
                                    {item}
                                </Button>
                            ))}
                            {page < totalPages && (
                                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)}>
                                    Sau
                                </Button>
                            )}
                        </div>
                    )}

                    <section className="public-panel public-band rounded-[2.1rem] p-6 text-center md:p-8">
                        <h2 className="text-3xl leading-[0.95] text-[var(--ink)]">Bạn cần tư vấn khóa học?</h2>
                        <p className="mx-auto mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                            Liên hệ với chúng tôi để được tư vấn khóa học phù hợp nhất với nhu cầu của bạn
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Button asChild size="lg">
                                <Link href="/dao-tao/dang-ky">
                                    Đăng ký khóa học
                                    <ArrowRight className="h-4 w-4" weight="bold" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/lien-he">Liên hệ tư vấn</Link>
                            </Button>
                        </div>
                    </section>
                </>
            )}
        </div>
    );

    return (
        <PublicPageShell
            title="Chương trình Đào tạo"
            description="Nâng cao năng lực với các khóa đào tạo chất lượng cao"
            controls={controls}
            main={main}
            asideSticky={false}
        />
    );
}
