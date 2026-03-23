"use client";

import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, GraduationCap } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

interface Course {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    type: "ADMISSION" | "SHORT_COURSE" | "STUDY_ABROAD";
    duration?: string | null;
    price?: number | null;
    isRegistrationOpen?: boolean;
    isFeatured?: boolean;
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

    const resolvedTitle = title || (isEn ? "Featured Courses" : "Khóa Học Nổi Bật");
    const resolvedSubtitle = subtitle || (isEn
        ? "High-quality training programs designed to meet practical needs"
        : "Các chương trình đào tạo chất lượng cao, được thiết kế để đáp ứng nhu cầu thực tiễn");

    const displayCourses = courses.slice(0, 9);
    const [leadCourse, ...restCourses] = displayCourses;
    const topStack = restCourses.slice(0, 2);
    const lowerGrid = restCourses.slice(2, 6);
    const viewAllHref = isEn ? "/en/training" : "/dao-tao";

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
        <SectionWrapper>
            <MotionSection>
                <SectionHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
            </MotionSection>

            {displayCourses.length > 0 ? (
                <>
                    <MotionGroup className="grid gap-5 xl:grid-cols-[1.06fr_0.94fr]" stagger={0.12}>
                        {leadCourse ? (
                            <MotionItem>
                                <Link href={`${viewAllHref}/${leadCourse.slug}`} className="group block h-full">
                                    <motion.article
                                        whileHover={shouldReduceMotion ? undefined : { y: -10, rotateX: 2.5, rotateY: -2 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                        className="interactive-card public-panel public-band relative h-full overflow-hidden rounded-[2.4rem] p-5 md:p-6"
                                    >
                                        <FloatingAccent className="right-[10%] top-[8%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.14),transparent_70%)]" variant="orb" />
                                        <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.94fr)_minmax(0,1.06fr)]">
                                            <div className="relative min-h-[300px] overflow-hidden rounded-[2rem]">
                                                {leadCourse.featuredImage ? (
                                                    <Image
                                                        src={leadCourse.featuredImage}
                                                        alt={leadCourse.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(23,88,216,0.18),rgba(214,230,255,0.7))]" />
                                                )}
                                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,23,47,0.02),rgba(8,23,47,0.24))]" />
                                                <div className="absolute left-5 top-5 rounded-full border border-white/14 bg-white/84 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-strong)] backdrop-blur-sm">
                                                    {typeLabels[leadCourse.type]}
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-between gap-8">
                                                <div className="space-y-4">
                                                    <h3 className="max-w-[13ch] font-heading text-[2.15rem] text-[var(--ink)] md:text-[2.8rem]">
                                                        {leadCourse.title}
                                                    </h3>
                                                    {leadCourse.excerpt ? (
                                                        <p className="max-w-[40rem] text-sm leading-8 text-[var(--ink-soft)]">
                                                            {leadCourse.excerpt}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 border-t border-[rgba(26,72,164,0.1)] pt-4 text-sm text-[var(--ink-soft)]">
                                                    {leadCourse.category ? (
                                                        <span className="rounded-full border border-[rgba(23,88,216,0.12)] bg-[rgba(23,88,216,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                                                            {leadCourse.category.name}
                                                        </span>
                                                    ) : null}
                                                    {leadCourse.duration ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4" weight="bold" />
                                                            {leadCourse.duration}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            </MotionItem>
                        ) : null}

                        <MotionGroup className="grid gap-5" stagger={0.1}>
                            {topStack.map((course) => (
                                <MotionItem key={course.id}>
                                    <Link href={`${viewAllHref}/${course.slug}`} className="group block h-full">
                                        <motion.article
                                            whileHover={shouldReduceMotion ? undefined : { y: -8, rotateX: 2.2, rotateY: -1.8 }}
                                            transition={publicMotionTokens.hoverSpring}
                                            style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                            className="interactive-card public-panel h-full rounded-[2.2rem] p-5 md:p-6"
                                        >
                                            <div className="mb-5 flex items-center justify-between gap-4">
                                                <span className="rounded-full border border-[rgba(23,88,216,0.12)] bg-[rgba(23,88,216,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                                                    {typeLabels[course.type]}
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-[var(--accent-strong)] transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                                            </div>
                                            <h3 className="mb-4 max-w-[14ch] font-heading text-[1.9rem] text-[var(--ink)]">
                                                {course.title}
                                            </h3>
                                            {course.excerpt ? (
                                                <p className="mb-6 text-sm leading-8 text-[var(--ink-soft)]">
                                                    {course.excerpt}
                                                </p>
                                            ) : null}
                                            <div className="mt-auto flex flex-wrap items-center gap-4 text-sm text-[var(--ink-soft)]">
                                                {course.category ? <span>{course.category.name}</span> : null}
                                                {course.duration ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4" weight="bold" />
                                                        {course.duration}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </motion.article>
                                    </Link>
                                </MotionItem>
                            ))}
                        </MotionGroup>
                    </MotionGroup>

                    {lowerGrid.length > 0 ? (
                        <MotionGroup className="mt-5 grid gap-5 md:grid-cols-2" stagger={0.1}>
                            {lowerGrid.map((course) => (
                                <MotionItem key={course.id}>
                                    <Link href={`${viewAllHref}/${course.slug}`} className="group block h-full">
                                        <motion.article
                                            whileHover={shouldReduceMotion ? undefined : { y: -8, rotateX: 2, rotateY: -1.6 }}
                                            transition={publicMotionTokens.hoverSpring}
                                            style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                            className="interactive-card h-full rounded-[1.95rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(234,243,255,0.78))] p-5 shadow-[var(--shadow-xs)]"
                                        >
                                            <div className="mb-4 flex items-center justify-between gap-4">
                                                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                                                    {typeLabels[course.type]}
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-[var(--accent-strong)] transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                                            </div>
                                            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(220px,1.12fr)] lg:items-start">
                                                <h3 className="font-heading text-[1.45rem] text-[var(--ink)]">
                                                    {course.title}
                                                </h3>
                                                {course.excerpt ? (
                                                    <p className="line-clamp-3 text-sm leading-7 text-[var(--ink-soft)]">
                                                        {course.excerpt}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </motion.article>
                                    </Link>
                                </MotionItem>
                            ))}
                        </MotionGroup>
                    ) : null}

                    <MotionSection className="mt-10" delay={0.1}>
                        <Button asChild variant="outline" size="lg" motion="magnetic">
                            <Link href={isEn ? "/en/training" : "/dao-tao"} className="inline-flex items-center">
                                <span>{isEn ? "View all courses" : "Xem tất cả khóa học"}</span>
                                <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                            </Link>
                        </Button>
                    </MotionSection>
                </>
            ) : (
                <MotionGroup className="grid gap-5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]" stagger={0.14}>
                    <MotionItem>
                    <div className="public-panel public-band relative overflow-hidden rounded-[2.3rem] p-6 md:p-7">
                        <FloatingAccent className="right-[10%] top-[10%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.14),transparent_72%)]" variant="halo" />
                        <div className="flex h-full flex-col justify-between gap-6">
                            <div className="space-y-4">
                                <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-[rgba(23,88,216,0.12)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                                    <GraduationCap className="h-7 w-7" weight="duotone" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                        {resolvedTitle}
                                    </p>
                                    <p className="max-w-[34rem] text-sm leading-8 text-[var(--ink-soft)] md:text-[15px]">
                                        {resolvedSubtitle}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {Object.values(typeLabels).map((label) => (
                                    <motion.div
                                        key={label}
                                        className="rounded-full border border-[rgba(23,88,216,0.12)] bg-[rgba(23,88,216,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]"
                                        animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                        transition={shouldReduceMotion ? undefined : { duration: 4.8, ease: "easeInOut", repeat: Infinity, delay: label.length * 0.05 }}
                                    >
                                        {label}
                                    </motion.div>
                                ))}
                            </div>
                            <div>
                                <Button asChild variant="outline" size="lg" motion="magnetic">
                                    <Link href={viewAllHref} className="inline-flex items-center">
                                        <span>{isEn ? "View all courses" : "Xem tất cả khóa học"}</span>
                                        <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                    </MotionItem>

                    <MotionGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" stagger={0.08}>
                            {Object.values(typeLabels).map((label) => (
                                <MotionItem
                                    key={`${label}-shell`}
                                    className="rounded-[1.8rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(234,243,255,0.8))] p-5 shadow-[var(--shadow-xs)]"
                                >
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <span className="rounded-full border border-[rgba(23,88,216,0.12)] bg-[rgba(23,88,216,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                                            {label}
                                        </span>
                                        <ArrowRight className="h-4 w-4 text-[var(--accent-strong)]" weight="bold" />
                                    </div>
                                    <div className="space-y-3">
                                        <motion.div className="h-3 w-[82%] rounded-full bg-[rgba(23,88,216,0.12)]" animate={shouldReduceMotion ? undefined : { opacity: [0.45, 0.9, 0.45], x: [0, 6, 0] }} transition={shouldReduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
                                        <motion.div className="h-3 w-full rounded-full bg-[rgba(23,88,216,0.09)]" animate={shouldReduceMotion ? undefined : { opacity: [0.35, 0.75, 0.35], x: [0, 4, 0] }} transition={shouldReduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.18 }} />
                                        <motion.div className="h-3 w-[64%] rounded-full bg-[rgba(23,88,216,0.09)]" animate={shouldReduceMotion ? undefined : { opacity: [0.3, 0.7, 0.3], x: [0, 3, 0] }} transition={shouldReduceMotion ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.28 }} />
                                    </div>
                                    <div className="mt-6 flex gap-3">
                                        <motion.div className="h-2.5 w-20 rounded-full bg-[rgba(23,88,216,0.1)]" animate={shouldReduceMotion ? undefined : { opacity: [0.3, 0.7, 0.3] }} transition={shouldReduceMotion ? undefined : { duration: 2.1, repeat: Infinity, ease: "easeInOut" }} />
                                        <motion.div className="h-2.5 w-14 rounded-full bg-[rgba(23,88,216,0.08)]" animate={shouldReduceMotion ? undefined : { opacity: [0.25, 0.6, 0.25] }} transition={shouldReduceMotion ? undefined : { duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.12 }} />
                                    </div>
                                </MotionItem>
                            ))}
                    </MotionGroup>
                </MotionGroup>
            )}
        </SectionWrapper>
    );
}

export default TrainingSection;
