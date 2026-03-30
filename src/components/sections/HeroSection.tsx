"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Play } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { Container } from "@/components/layout";
import { detectLocaleFromPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import {
    MotionGroup,
    MotionItem,
    publicMotionTokens,
} from "@/components/motion/PublicMotion";

interface Course {
    id: string;
    title: string;
    title_en?: string;
    slug: string;
    excerpt?: string | null;
    excerpt_en?: string | null;
}

interface HeroSectionProps {
    title?: string;
    subtitle?: string;
    ctaPrimary?: {
        text: string;
        href: string;
    };
    ctaSecondary?: {
        text: string;
        href: string;
    };
    featuredPrograms?: Course[];
    featuredMedia?: {
        eyebrow?: string;
        title?: string;
        description?: string;
        thumbnailUrl?: string;
        href?: string;
    };
}

export function HeroSection({
    title,
    subtitle,
    ctaPrimary,
    ctaSecondary,
    featuredPrograms = [],
    featuredMedia,
}: HeroSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();

    const copy = isEn
        ? {
              hero: {
                  title: "Vien Phuong Nam Institute",
                  subtitle: "Training, research, and institutional partnerships shaped around practical social-resource development needs.",
              },
              labels: {
                  eyebrow: "Editorial institutional profile",
                  programmeRail: "Selected programs",
                  programmeFirst: "Programs first",
                  film: "Watch institutional film",
                  visual: "Institutional view",
                  imageCaption: "A closer look at the institute's programmes, partnerships, and public-interest work.",
              },
              actions: {
                  primary: { text: "Explore programs", href: "/en/training" },
                  secondary: { text: "Contact the institute", href: "/en/contact" },
              },
          }
        : {
              hero: {
                  title: "Viện Phương Nam",
                  subtitle: "Đào tạo, nghiên cứu và kết nối nguồn lực xã hội theo một cấu trúc thực tiễn, rõ ràng và giàu chiều sâu tổ chức.",
              },
              labels: {
                  eyebrow: "Chân dung hoạt động",
                  programmeRail: "Chương trình chọn lọc",
                  programmeFirst: "Ưu tiên chương trình",
                  film: "Xem phim giới thiệu",
                  visual: "Góc nhìn tổ chức",
                  imageCaption: "Một lát cắt trực diện về chương trình, hợp tác và định hướng phát triển nguồn lực xã hội của viện.",
              },
              actions: {
                  primary: { text: "Khám phá chương trình", href: "/dao-tao" },
                  secondary: { text: "Liên hệ với viện", href: "/lien-he" },
              },
          };

    const resolvedTitle = title || copy.hero.title;
    const resolvedSubtitle = subtitle || copy.hero.subtitle;
    const primaryAction = ctaPrimary || copy.actions.primary;
    const secondaryAction = ctaSecondary || copy.actions.secondary;
    const filmHref = featuredMedia?.href;
    const railItems = featuredPrograms.slice(0, 3).map((program) => ({
        id: program.id,
        title: isEn ? (program.title_en || program.title) : program.title,
        excerpt: isEn ? (program.excerpt_en || program.excerpt || "") : (program.excerpt || ""),
        href: isEn ? `/en/training/${program.slug}` : `/dao-tao/${program.slug}`,
    }));
    const heroSecondaryButtonClass = "rounded-[1.02rem] !border-[rgba(16,36,56,0.12)] !bg-[linear-gradient(180deg,rgba(228,236,243,0.88),rgba(214,225,236,0.76))] !text-[var(--accent-strong)] shadow-[0_14px_30px_-28px_rgba(8,20,33,0.28)] hover:!bg-[linear-gradient(180deg,rgba(236,243,248,0.94),rgba(222,232,241,0.84))] hover:!text-[var(--ink)]";

    return (
        <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f7fbfd_0%,#eef4f8_58%,#e7eef4_100%)] text-[var(--ink)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(77,111,147,0.12),transparent_22%),radial-gradient(circle_at_88%_16%,rgba(255,255,255,0.62),transparent_20%),linear-gradient(90deg,rgba(16,40,70,0.04)_1px,transparent_1px),linear-gradient(rgba(16,40,70,0.04)_1px,transparent_1px)] [background-size:auto,auto,32px_32px,32px_32px] opacity-80" />
            <div className="absolute inset-x-0 top-0 h-[16rem] bg-[linear-gradient(180deg,rgba(13,27,44,0.24),transparent)]" />

            <Container className="relative">
                <MotionGroup
                    className="grid min-h-[100svh] items-end gap-9 pb-12 pt-[7.25rem] md:pb-16 md:pt-[8.8rem] xl:grid-cols-[minmax(0,0.84fr)_minmax(420px,0.96fr)] xl:gap-12"
                    stagger={0.1}
                >
                    <MotionItem preset="fade-right">
                        <div className="flex h-full flex-col justify-end">
                            <motion.div
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                transition={publicMotionTokens.sectionSpring}
                                className="space-y-7"
                            >
                                <div className="inline-flex items-center gap-3">
                                    <span className="h-px w-12 bg-[rgba(16,40,70,0.14)]" />
                                    <span className="editorial-caption text-[var(--ink-muted)]">{copy.labels.eyebrow}</span>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                                        {copy.labels.programmeFirst}
                                    </p>
                                    <h1 className="max-w-[8.2ch] font-heading text-[3.2rem] leading-[0.82] tracking-[-0.072em] text-[var(--ink)] md:text-[4.65rem] xl:text-[5.7rem]">
                                        {resolvedTitle}
                                    </h1>
                                    <p className="max-w-[34rem] text-[0.98rem] leading-[1.95rem] text-[var(--ink-soft)] md:text-[1.02rem]">
                                        {resolvedSubtitle}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <Button
                                        asChild
                                        size="lg"
                                        motion="magnetic"
                                        className="rounded-[1.05rem] bg-[var(--accent-strong)] text-white hover:bg-[#163455]"
                                    >
                                        <Link href={primaryAction.href} className="inline-flex items-center gap-3 text-white">
                                            <span>{primaryAction.text}</span>
                                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/12 text-white">
                                                <ArrowUpRight className="h-4 w-4" weight="bold" />
                                            </span>
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        motion="lift"
                                        className={heroSecondaryButtonClass}
                                    >
                                        <Link href={secondaryAction.href} className="inline-flex items-center gap-3">
                                            <span>{secondaryAction.text}</span>
                                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(19,44,71,0.08)] text-[var(--accent-strong)]">
                                                <ArrowRight className="h-4 w-4" weight="bold" />
                                            </span>
                                        </Link>
                                    </Button>
                                </div>
                            </motion.div>

                            {railItems.length > 0 ? (
                                <motion.div
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                    transition={{ ...publicMotionTokens.sectionSpring, delay: 0.08 }}
                                    className="mt-9 border-t border-[rgba(16,40,70,0.1)] pt-5"
                                >
                                    <div className="mb-4 flex items-center gap-3">
                                        <span className="editorial-caption text-[var(--ink-muted)]">{copy.labels.programmeRail}</span>
                                    </div>
                                    <div className="grid gap-3 xl:grid-cols-3">
                                        {railItems.map((item, index) => (
                                            <Link
                                                key={item.id}
                                                href={item.href}
                                                className={cn(
                                                    "group border-t border-[rgba(16,40,70,0.08)] pt-3 transition-colors hover:border-[rgba(16,40,70,0.18)]",
                                                    index > 0 && "hidden xl:block"
                                                )}
                                            >
                                                <p className="font-heading text-[1.18rem] leading-[1.02] text-[var(--ink)]">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 line-clamp-1 text-sm leading-6 text-[var(--ink-soft)] transition-transform duration-300 group-hover:translate-x-1">
                                                    {item.excerpt || (isEn ? "Structured learning route" : "Lộ trình học tập có cấu trúc")}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : null}
                        </div>
                    </MotionItem>

                    <MotionItem preset="fade-left">
                        <motion.figure
                            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                            transition={publicMotionTokens.hoverSpring}
                            className="relative overflow-hidden rounded-[1.8rem] border border-[rgba(16,40,70,0.1)] bg-[rgba(252,254,255,0.38)] shadow-[var(--shadow-sm)]"
                        >
                            <div className="relative aspect-[4/5] min-h-[420px] w-full md:min-h-[540px]">
                                {featuredMedia?.thumbnailUrl ? (
                                    <Image
                                        src={featuredMedia.thumbnailUrl}
                                        alt={featuredMedia.title || resolvedTitle}
                                        fill
                                        className="object-cover"
                                        priority
                                        sizes="(max-width: 1280px) 100vw, 48vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[linear-gradient(160deg,#deebf6_0%,#cedeed_42%,#eaf1f5_100%)]" />
                                )}
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,34,53,0.02),rgba(20,34,53,0.12),rgba(20,34,53,0.34))]" />
                                <div className="absolute left-5 top-5 inline-flex items-center gap-3 rounded-full border border-white/32 bg-white/62 px-3 py-1.5 backdrop-blur-sm">
                                    <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                                    <span className="editorial-caption text-[var(--accent-strong)]">{copy.labels.visual}</span>
                                </div>
                                <figcaption className="absolute inset-x-0 bottom-0 border-t border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(14,28,46,0.6))] px-5 py-4 md:px-6">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                        <p className="max-w-[30rem] text-sm leading-7 text-white/84 md:text-[0.96rem]">
                                            {featuredMedia?.description || copy.labels.imageCaption}
                                        </p>
                                        {filmHref ? (
                                            <Link href={filmHref} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/76 transition-colors hover:text-white">
                                                <Play className="h-3.5 w-3.5" weight="fill" />
                                                <span>{copy.labels.film}</span>
                                            </Link>
                                        ) : null}
                                    </div>
                                </figcaption>
                            </div>
                        </motion.figure>
                    </MotionItem>
                </MotionGroup>
            </Container>
        </section>
    );
}

export default HeroSection;
