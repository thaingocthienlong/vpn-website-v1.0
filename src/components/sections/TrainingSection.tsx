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
    const displayCourses = courses.slice(0, 6);
    const viewAllHref = isEn ? "/en/training" : "/dao-tao";

    if (displayCourses.length === 0) {
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

    const fallbackGradients = [
        "bg-[linear-gradient(145deg,rgba(77,111,147,0.3)_0%,rgba(16,36,56,0.16)_48%,rgba(242,245,247,0.95)_100%)]",
        "bg-[linear-gradient(145deg,rgba(16,36,56,0.18)_0%,rgba(77,111,147,0.24)_45%,rgba(231,239,246,0.95)_100%)]",
        "bg-[linear-gradient(145deg,rgba(77,111,147,0.24)_0%,rgba(16,36,56,0.12)_48%,rgba(248,251,253,0.96)_100%)]",
        "bg-[linear-gradient(145deg,rgba(16,36,56,0.16)_0%,rgba(77,111,147,0.18)_46%,rgba(248,251,253,0.96)_100%)]",
        "bg-[linear-gradient(145deg,rgba(77,111,147,0.18)_0%,rgba(16,36,56,0.14)_44%,rgba(248,251,253,0.96)_100%)]",
        "bg-[linear-gradient(145deg,rgba(16,36,56,0.14)_0%,rgba(77,111,147,0.22)_42%,rgba(248,251,253,0.98)_100%)]",
    ] as const;

    const layoutClasses = [
        "md:col-start-1 md:row-start-1 md:col-span-2 md:row-span-2",
        "md:col-start-3 md:row-start-1 md:col-span-1 md:row-span-1",
        "md:col-start-3 md:row-start-2 md:col-span-1 md:row-span-1",
        "md:col-start-1 md:row-start-3 md:col-span-1 md:row-span-1",
        "md:col-start-2 md:row-start-3 md:col-span-1 md:row-span-1",
        "md:col-start-3 md:row-start-3 md:col-span-1 md:row-span-1",
    ] as const;

    return (
        <SectionWrapper padding="lg" appearanceTargetId="homepage.section.training.surface">
            <MotionSection>
                <SectionHeader
                    badge={isEn ? "Programs" : "Chương trình"}
                    title={title || (isEn ? "Programs and structured learning paths" : "Chương trình đào tạo và các lộ trình năng lực")}
                    subtitle={subtitle || (isEn
                        ? "A lead banner cluster with supporting placements, arranged to fit the native programme banner format without aggressive cropping."
                        : "Một cụm banner dẫn hướng đi cùng các vị trí bổ trợ, được sắp để giữ đúng định dạng banner gốc của từng chương trình mà không cắt ảnh gắt.")}
                    className="[&_h2]:max-w-none [&_h2]:whitespace-nowrap [&_h2]:text-[clamp(1.75rem,5.6vw,2.9rem)] [&_h2]:leading-[0.96] [&_h2]:tracking-[-0.05em]"
                    appearanceTargetId="homepage.section.training.header"
                />
            </MotionSection>

            <MotionGroup
                className="grid grid-cols-1 grid-rows-none gap-3 md:grid-cols-3 md:gap-2 md:[grid-template-rows:repeat(3,clamp(8.25rem,13vw,11.75rem))]"
                stagger={0.08}
            >
                {displayCourses.map((course, index) => (
                    <MotionItem
                        key={course.id}
                        className={[
                            "col-span-1",
                            "aspect-[23/10]",
                            "md:aspect-auto",
                            layoutClasses[index] ?? "",
                        ].join(" ")}
                    >
                        <Link href={`${viewAllHref}/${course.slug}`} className="group block h-full">
                            <motion.article
                                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                transition={publicMotionTokens.hoverSpring}
                                className="relative isolate flex h-full overflow-hidden rounded-[1.55rem] border border-[rgba(16,40,70,0.12)] bg-[rgba(248,251,253,0.66)]"
                            >
                                <div className="absolute inset-0">
                                    <div className={`absolute inset-0 ${fallbackGradients[index] ?? fallbackGradients[fallbackGradients.length - 1]}`} />
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,24,40,0.12)_0%,rgba(11,24,40,0.04)_30%,rgba(11,24,40,0.4)_100%)] transition duration-300 group-hover:bg-[linear-gradient(180deg,rgba(11,24,40,0.18)_0%,rgba(11,24,40,0.08)_28%,rgba(11,24,40,0.62)_100%)] group-focus-visible:bg-[linear-gradient(180deg,rgba(11,24,40,0.18)_0%,rgba(11,24,40,0.08)_28%,rgba(11,24,40,0.62)_100%)]" />
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_34%)] opacity-70" />
                                </div>

                                {course.featuredImage ? (
                                    <Image
                                        src={course.featuredImage}
                                        alt={course.title}
                                        fill
                                        className="object-cover object-center [transform:scale(1.04)] transition duration-500 ease-out group-hover:[transform:scale(1.07)] group-hover:blur-[0.8px] group-focus-visible:[transform:scale(1.07)] group-focus-visible:blur-[0.8px]"
                                    />
                                ) : null}

                                <div className="relative flex h-full w-full flex-col justify-between p-4 sm:p-5 md:p-4 lg:p-5">
                                    <div className="pointer-events-none flex flex-wrap items-start gap-2 opacity-0 translate-y-1 transition duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:pointer-events-auto group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                                        <span className="inline-flex rounded-full border border-[rgba(255,255,255,0.22)] bg-[rgba(15,29,45,0.24)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
                                            {typeLabels[course.type]}
                                        </span>
                                        {course.category?.name ? (
                                            <span className="inline-flex rounded-full border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.14)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[rgba(255,255,255,0.86)] backdrop-blur-md">
                                                {course.category.name}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="max-w-[28rem]">
                                        <div className="pointer-events-none opacity-0 transition duration-300 translate-y-2 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:pointer-events-auto group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                                            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,255,255,0.9)]">
                                                <span>{isEn ? "Open program" : "Mở chương trình"}</span>
                                                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        </Link>
                    </MotionItem>
                ))}
            </MotionGroup>

            <MotionSection className="mt-6 sm:mt-7" delay={0.08}>
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
        </SectionWrapper>
    );
}

export default TrainingSection;
