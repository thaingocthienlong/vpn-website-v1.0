"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui";
import { SectionHeader } from "./SectionHeader";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

interface Course {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    type: "ADMISSION" | "SHORT_COURSE" | "STUDY_ABROAD";
    category?: {
        name: string;
        slug: string;
    } | null;
}

interface TrainingSectionProps {
    courses?: Course[];
    title?: string;
    subtitle?: string;
}

export function TrainingSection({
    courses = [],
    title,
    subtitle,
}: TrainingSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();
    const displayCourses = courses.slice(0, 3);
    const [leadCourse, ...supportCourses] = displayCourses;
    const viewAllHref = isEn ? "/en/training" : "/dao-tao";

    if (!leadCourse) {
        return null;
    }

    const typeLabels = isEn
        ? {
              ADMISSION: "Admissions",
              SHORT_COURSE: "Short Course",
              STUDY_ABROAD: "Study Abroad",
          }
        : {
              ADMISSION: "Tuyển sinh",
              SHORT_COURSE: "Khóa ngắn hạn",
              STUDY_ABROAD: "Du học",
          };

    return (
        <SectionWrapper padding="lg">
            <MotionSection>
                <SectionHeader
                    badge={isEn ? "Programs" : "Chương trình"}
                    title={title || (isEn ? "Programs and structured learning paths" : "Chương trình đào tạo và các lộ trình năng lực")}
                    subtitle={subtitle || (isEn
                        ? "A lead programme dossier followed by a short institutional shelf of quieter supporting routes."
                        : "Một hồ sơ chương trình dẫn hướng, sau đó là danh mục gợi ý ngắn để người xem định vị nhanh các lộ trình còn lại.")}
                />
            </MotionSection>

            <MotionGroup className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.72fr)] xl:items-start" stagger={0.1}>
                <MotionItem>
                    <Link href={`${viewAllHref}/${leadCourse.slug}`} className="group block">
                        <motion.article
                            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                            transition={publicMotionTokens.hoverSpring}
                            className="grid gap-6 border-y border-[rgba(16,40,70,0.1)] py-6 md:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] md:items-end"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.45rem] bg-[rgba(77,111,147,0.08)]">
                                {leadCourse.featuredImage ? (
                                    <Image
                                        src={leadCourse.featuredImage}
                                        alt={leadCourse.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[linear-gradient(160deg,#dbe8f3_0%,#c7d8e8_44%,#eef4f8_100%)]" />
                                )}
                            </div>

                            <div className="space-y-5">
                                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-strong)]">
                                    <span>{typeLabels[leadCourse.type]}</span>
                                    {leadCourse.category?.name ? (
                                        <>
                                            <span className="h-px w-5 bg-[rgba(16,40,70,0.16)]" />
                                            <span>{leadCourse.category.name}</span>
                                        </>
                                    ) : null}
                                </div>
                                <h3 className="max-w-[14ch] font-heading text-[2.2rem] text-[var(--ink)] md:text-[3rem]">
                                    {leadCourse.title}
                                </h3>
                                <p className="max-w-[36rem] text-sm leading-[1.9rem] text-[var(--ink-soft)] md:text-[0.98rem]">
                                    {leadCourse.excerpt || (
                                        isEn
                                            ? "A structured programme path presented as the homepage's primary learning narrative."
                                            : "Một lộ trình đào tạo có cấu trúc, được giữ ở vai trò dẫn hướng chính của trang chủ."
                                    )}
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]">
                                    <span>{isEn ? "Open programme dossier" : "Mở hồ sơ chương trình"}</span>
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" />
                                </span>
                            </div>
                        </motion.article>
                    </Link>
                </MotionItem>

                <MotionItem>
                    <motion.aside
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="border-t border-[rgba(16,40,70,0.12)] pt-5"
                    >
                        <div className="space-y-3">
                            <p className="editorial-caption text-[var(--ink-muted)]">
                                {isEn ? "Supporting routes" : "Lộ trình hỗ trợ"}
                            </p>
                            <h3 className="max-w-[12ch] font-heading text-[1.9rem] text-[var(--ink)] md:text-[2.35rem]">
                                {isEn ? "Two quieter routes before the full catalogue." : "Hai lộ trình ngắn trước khi mở toàn bộ danh mục."}
                            </h3>
                        </div>

                        <div className="mt-6 divide-y divide-[rgba(16,40,70,0.1)] border-y border-[rgba(16,40,70,0.1)]">
                            {supportCourses.map((course) => (
                                <Link
                                    key={course.id}
                                    href={`${viewAllHref}/${course.slug}`}
                                    className="group block py-5"
                                >
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">
                                        {typeLabels[course.type]}
                                    </p>
                                    <h3 className="max-w-[15ch] font-heading text-[1.5rem] text-[var(--ink)]">
                                        {course.title}
                                    </h3>
                                    {course.excerpt ? (
                                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--ink-soft)]">
                                            {course.excerpt}
                                        </p>
                                    ) : null}
                                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                                        <span>{isEn ? "Open" : "Mở"}</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" />
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <MotionSection className="mt-6" delay={0.08}>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                motion="magnetic"
                                className="rounded-[1.02rem] border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.2)] text-[var(--ink)] hover:border-[rgba(16,36,56,0.08)] hover:bg-[rgba(248,251,253,0.44)] hover:text-[var(--ink)]"
                            >
                                <Link href={viewAllHref} className="inline-flex items-center">
                                    <span>{isEn ? "View all programs" : "Xem tất cả chương trình"}</span>
                                    <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                                </Link>
                            </Button>
                        </MotionSection>
                    </motion.aside>
                </MotionItem>
            </MotionGroup>
        </SectionWrapper>
    );
}

export default TrainingSection;
