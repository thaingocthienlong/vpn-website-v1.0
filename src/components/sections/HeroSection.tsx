"use client";

import * as React from "react";
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
    featuredImage?: string | null;
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
    const titleContainerRef = React.useRef<HTMLDivElement>(null);
    const titleRef = React.useRef<HTMLHeadingElement>(null);

    const copy = isEn
        ? {
              hero: {
                  title: "Vien Phuong Nam Institute",
                  subtitle: "Training, research, and institutional partnerships shaped around practical social-resource development needs.",
              },
              labels: {
                  eyebrow: "Editorial institutional profile",
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
        featuredImage: program.featuredImage || featuredMedia?.thumbnailUrl || null,
    }));
    const heroSecondaryButtonClass = "rounded-[1.02rem] !border-[rgba(16,36,56,0.12)] !bg-[linear-gradient(180deg,rgba(228,236,243,0.88),rgba(214,225,236,0.76))] !text-[var(--accent-strong)] shadow-[0_14px_30px_-28px_rgba(8,20,33,0.28)] hover:!bg-[linear-gradient(180deg,rgba(236,243,248,0.94),rgba(222,232,241,0.84))] hover:!text-[var(--ink)]";
    const heroMediaFigure = (
        <motion.figure
            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
            transition={publicMotionTokens.hoverSpring}
            className="relative min-w-0 overflow-hidden rounded-[1.8rem] border border-[rgba(16,40,70,0.1)] bg-[rgba(252,254,255,0.38)] shadow-[var(--shadow-sm)]"
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
    );

    React.useEffect(() => {
        const container = titleContainerRef.current;
        const titleElement = titleRef.current;

        if (!container || !titleElement) {
            return;
        }

        let frameId = 0;

        const fitTitle = () => {
            cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(() => {
                const viewport = window.visualViewport?.width ?? window.innerWidth;

                if (viewport < 1024) {
                    titleElement.style.removeProperty("font-size");
                    titleElement.style.removeProperty("white-space");
                    return;
                }

                const availableWidth = container.getBoundingClientRect().width;
                if (!availableWidth) {
                    return;
                }

                const maxFontSize = viewport >= 1536 ? 96 : viewport >= 1280 ? 88 : 76;
                titleElement.style.fontSize = `${maxFontSize}px`;
                titleElement.style.whiteSpace = "nowrap";

                const intrinsicWidth = titleElement.scrollWidth;
                if (!intrinsicWidth) {
                    return;
                }

                const scale = Math.min(1, availableWidth / intrinsicWidth);
                titleElement.style.fontSize = `${(maxFontSize * scale).toFixed(2)}px`;
            });
        };

        fitTitle();

        const resizeObserver = new ResizeObserver(fitTitle);
        resizeObserver.observe(container);
        window.visualViewport?.addEventListener("resize", fitTitle);
        window.addEventListener("resize", fitTitle);

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            window.visualViewport?.removeEventListener("resize", fitTitle);
            window.removeEventListener("resize", fitTitle);
        };
    }, [resolvedTitle]);

    return (
        <section className="relative isolate overflow-hidden text-[var(--ink)]">
            <Container className="relative">
                <MotionGroup
                    className="grid min-h-[100svh] grid-cols-[minmax(0,1fr)] items-start gap-9 pb-12 pt-[7.25rem] md:pb-16 md:pt-[8.8rem] xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:items-end xl:gap-12"
                    stagger={0.1}
                >
                    <MotionItem preset="fade-right" className="min-w-0 xl:self-start">
                        <div className="flex h-full min-w-0 flex-col justify-start">
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
                                    <div ref={titleContainerRef} className="max-w-full overflow-hidden">
                                        <h1
                                            ref={titleRef}
                                            className="inline-block max-w-full font-heading text-[clamp(3.15rem,10vw,4.9rem)] leading-[0.86] tracking-[-0.064em] text-[var(--ink)] md:text-[clamp(3.8rem,8vw,5.9rem)] xl:text-[clamp(4.6rem,6vw,5.85rem)]"
                                            style={{
                                                textWrap: "balance",
                                                wordBreak: "keep-all",
                                                overflowWrap: "normal",
                                            }}
                                        >
                                            {resolvedTitle}
                                        </h1>
                                    </div>
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

                            <div className="mt-9 xl:hidden">
                                {heroMediaFigure}
                            </div>

                            {railItems.length > 0 ? (
                                <motion.div
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                    transition={{ ...publicMotionTokens.sectionSpring, delay: 0.08 }}
                                    className="mt-9 border-t border-[rgba(16,40,70,0.1)] pt-5"
                                >
                                    <div className="grid grid-cols-2 gap-4 pb-2 xl:grid-cols-3 xl:pb-0">
                                        {railItems.map((item, index) => (
                                            <Link
                                                key={item.id}
                                                href={item.href}
                                                className={cn(
                                                    "group relative block aspect-video overflow-hidden rounded-[1.25rem] border border-[rgba(16,40,70,0.1)] bg-[linear-gradient(160deg,#dde7f1_0%,#cedaea_48%,#e8eef4_100%)] shadow-[0_20px_36px_-28px_rgba(8,20,33,0.24)]",
                                                    index === 0 ? "col-span-2 xl:col-span-1" : "",
                                                    shouldReduceMotion ? "" : "transition-transform duration-300 xl:hover:-translate-y-1"
                                                )}
                                            >
                                                {item.featuredImage ? (
                                                    <Image
                                                        src={item.featuredImage}
                                                        alt={item.title}
                                                        fill
                                                        className="object-cover transition-all duration-500 xl:group-hover:scale-[1.03] xl:group-hover:blur-[1.5px]"
                                                        sizes="(max-width: 1279px) 82vw, 22vw"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-[linear-gradient(160deg,#d8e3ef_0%,#c7d5e4_44%,#e7edf4_100%)]" />
                                                )}
                                                    <div className="absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(10,20,34,0.02),rgba(10,20,34,0.06),rgba(10,20,34,0.14))] transition-all duration-300 md:block xl:bg-[linear-gradient(180deg,rgba(10,20,34,0.01),rgba(10,20,34,0.03),rgba(10,20,34,0.08))] xl:group-hover:bg-[linear-gradient(180deg,rgba(10,20,34,0.18),rgba(10,20,34,0.38),rgba(10,20,34,0.9))]" />
                                                <div className="absolute inset-x-0 bottom-0 hidden items-end justify-between gap-3 p-4 md:flex">
                                                    <div className="space-y-1">
                                                        <p className="max-w-[16ch] font-heading text-[1.02rem] leading-[1.02] text-white transition-all duration-300 xl:translate-y-3 xl:opacity-0 xl:group-hover:-translate-y-1 xl:group-hover:opacity-100 xl:group-hover:text-[rgba(255,255,255,0.98)]">
                                                            {item.title}
                                                        </p>
                                                        <p className="line-clamp-1 text-xs uppercase tracking-[0.14em] text-white/72 transition-all duration-300 xl:translate-y-2 xl:opacity-0 xl:group-hover:translate-y-0 xl:group-hover:opacity-100">
                                                            {isEn ? "Open programme" : "Mở chương trình"}
                                                        </p>
                                                    </div>
                                                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/16 bg-white/10 text-white/82 transition-all duration-300 xl:translate-y-2 xl:opacity-0 xl:group-hover:translate-y-0 xl:group-hover:opacity-100">
                                                        <ArrowRight className="h-4 w-4" weight="bold" />
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : null}
                        </div>
                    </MotionItem>

                    <MotionItem preset="fade-left" className="hidden min-w-0 xl:block">
                        {heroMediaFigure}
                    </MotionItem>
                </MotionGroup>
            </Container>
        </section>
    );
}

export default HeroSection;
