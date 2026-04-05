"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FunnelSimple, GraduationCap } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
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

                const response = await fetch(`/api/courses?${params}`);
                if (response.ok) {
                    const data = await response.json();
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

    const controls = (
        <section className="public-panel rounded-[1.8rem] p-4">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                <FunnelSimple className="h-4 w-4" weight="bold" />
                {t("types.all")}
            </div>
            <div className="flex flex-wrap gap-2">
                {courseTypes.map((type) => (
                    <button
                        key={type.value}
                        type="button"
                        onClick={() => setSelectedType(type.value)}
                        className={`rounded-[1rem] px-4 py-2.5 text-sm font-medium transition-colors ${
                            selectedType === type.value
                                ? "bg-[var(--accent)] text-[var(--paper)]"
                                : "bg-[rgba(255,255,255,0.72)] text-[var(--ink)] hover:bg-white"
                        }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>
        </section>
    );

    const main = loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="public-panel h-[300px] animate-pulse rounded-[1.9rem]" />
            ))}
        </div>
    ) : courses.length === 0 ? (
        <PublicStatePanel icon={GraduationCap} title={tCommon("noResults")} />
    ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
                <Link
                    key={course.id}
                    href={`/en/training/${course.slug}`}
                    className="public-panel interactive-card group overflow-hidden rounded-[2rem]"
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
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            {course.category && (
                                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                    {course.category.name}
                                </span>
                            )}
                            {course.isRegistrationOpen && (
                                <span className="rounded-full border border-[rgba(47,122,95,0.18)] bg-[rgba(47,122,95,0.12)] px-3 py-1 text-[var(--success)]">
                                    {tCommon("open")}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl leading-tight text-[var(--ink)]">{course.title}</h2>
                        {course.excerpt && (
                            <p className="line-clamp-3 text-sm leading-7 text-[var(--ink-soft)]">
                                {course.excerpt}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <PublicPageShell
            title={t("title")}
            description={t("description")}
            controls={controls}
            main={main}
            asideSticky={false}
            heroAppearanceTargetId="page.hero.training-listing"
        />
    );
}
