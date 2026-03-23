"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { Container } from "@/components/layout";
import { detectLocaleFromPath } from "@/lib/routes";
import {
    FloatingAccent,
    MotionGroup,
    MotionItem,
    ParallaxLayer,
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
    ctaPrimary?: {
        text: string;
        href: string;
    };
    ctaSecondary?: {
        text: string;
        href: string;
    };
    featuredPrograms?: Course[];
    featuredVideo?: {
        eyebrow?: string;
        title: string;
        description?: string;
        thumbnailUrl?: string;
        href?: string;
    };
}

export function HeroSection({
    ctaPrimary,
    ctaSecondary,
    featuredPrograms = [],
    featuredVideo,
}: HeroSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();

    const copy = isEn
        ? {
              hero: {
                  title: "Southern Institute for Social Resources Development",
                  subtitle: "Research • Training • Technology Transfer",
                  cta: "Explore",
              },
              sections: {
                  training: "Training Programs",
                  services: "Services",
                  contact: "Contact",
                  featured: "Featured",
                  featuredVideo: "Featured Video",
                  featuredPrograms: "Featured Programs",
              },
              video: {
                  eyebrow: "Introduction Video",
                  title: "Inside Southern Institute for Social Resources Development",
                  description: "A placeholder featured video module for the new homepage hero layout.",
                  href: "/en/contact",
              },
              placeholders: {
                  programTitle: "Featured Program",
                  programDesc: "Program details will appear here when featured course data is available.",
                  ctaLabel: "Get in Touch",
              },
          }
        : {
              hero: {
                  cta: "Khám phá",
              },
              sections: {
                  training: "Chương trình Đào tạo",
                  services: "Dịch vụ",
                  contact: "Liên hệ",
                  featured: "Nổi bật",
                  featuredVideo: "Video Nổi Bật",
                  featuredPrograms: "Chương trình Nổi Bật",
              },
              video: {
                  eyebrow: "Video Giới Thiệu",
                  title: "Khám phá tổng quan về Viện Phát triển Nguồn lực Xã hội Phương Nam",
                  description: "Khung video tạm thời để trực quan hóa bố cục hero mới trước khi gắn nội dung chính thức.",
                  href: "/lien-he",
              },
              placeholders: {
                  programTitle: "Chương trình nổi bật",
                  programDesc: "Thông tin chương trình sẽ hiển thị tại đây khi có dữ liệu khóa học phù hợp.",
                  ctaLabel: "Kết nối với chúng tôi",
              },
          };

    const ctaMain = ctaPrimary || (isEn ? { text: copy.hero.cta, href: "/en/services" } : { text: copy.hero.cta, href: "/dich-vu" });
    const ctaContact = ctaSecondary || (isEn ? { text: copy.sections.contact, href: "/en/contact" } : { text: copy.sections.contact, href: "/lien-he" });

    const displayPrograms = featuredPrograms.slice(0, 2).map((program) => ({
        title: isEn ? (program.title_en || program.title) : program.title,
        desc: isEn ? (program.excerpt_en || program.excerpt || "") : (program.excerpt || ""),
        slug: isEn ? `/en/training/${program.slug}` : `/dao-tao/${program.slug}`,
    }));

    const programCards = Array.from({ length: 2 }, (_, index) => {
        const existingProgram = displayPrograms[index];
        if (existingProgram) {
            return existingProgram;
        }

        return {
            title: copy.placeholders.programTitle,
            desc: copy.placeholders.programDesc,
            slug: ctaMain.href,
        };
    });

    const heroVideo = featuredVideo || {
        eyebrow: copy.video.eyebrow,
        title: copy.video.title,
        description: copy.video.description,
        href: copy.video.href,
    };

    return (
        <section className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-10">
            <Container>
                <MotionGroup
                    className="grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)]"
                    stagger={0.1}
                >
                    <MotionItem preset="fade-right">
                        <ParallaxLayer depth={20}>
                            <motion.div
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                transition={publicMotionTokens.sectionSpring}
                                className="public-band relative min-h-[420px] overflow-hidden rounded-[2.8rem] border border-[rgba(97,147,255,0.2)] bg-[linear-gradient(155deg,rgba(42,101,227,0.95),rgba(64,124,244,0.92)_54%,rgba(154,197,255,0.86)_126%)] p-6 text-white shadow-[0_36px_110px_rgba(32,85,194,0.2)] md:min-h-[520px] md:p-8"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(210,230,255,0.14),transparent_28%)]" />
                                <FloatingAccent className="left-[8%] top-[10%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_74%)]" variant="halo" />
                                <FloatingAccent className="bottom-[10%] right-[8%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(209,229,255,0.16),transparent_74%)]" variant="orb" />

                                <div className="relative flex h-full flex-col justify-between gap-10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-3">
                                            <Badge variant="default" size="md" className="border-white/20 bg-white/14 !text-white shadow-none">
                                                {heroVideo.eyebrow || copy.sections.featuredVideo}
                                            </Badge>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/74">
                                                {copy.sections.featured}
                                            </p>
                                        </div>

                                        <Button
                                            asChild
                                            variant="outline"
                                            size="icon"
                                            motion="magnetic"
                                            className="border-white/18 bg-white/10 text-white hover:bg-white/18 hover:text-white"
                                        >
                                            <Link href={heroVideo.href || ctaMain.href} aria-label={heroVideo.title}>
                                                <ArrowRight className="h-4 w-4" weight="bold" />
                                            </Link>
                                        </Button>
                                    </div>

                                    <motion.div
                                        whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        className="relative flex flex-1 items-end overflow-hidden rounded-[2.2rem] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.04))] p-5 md:p-6"
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_54%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(6,27,68,0.36))]" />
                                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,rgba(7,20,42,0),rgba(7,20,42,0.76))]" />

                                        <motion.div
                                            className="absolute left-1/2 top-[42%] z-[1] inline-flex h-18 w-18 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white"
                                            whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
                                            transition={publicMotionTokens.hoverSpring}
                                        >
                                            <Play className="ml-1 h-7 w-7" weight="fill" />
                                        </motion.div>

                                        <div className="relative z-[1] max-w-[34rem] space-y-4">
                                            <h1
                                                className="max-w-[13ch] font-heading text-[2.2rem] leading-[1.02] tracking-[-0.04em] !text-white md:text-[3rem] xl:text-[3.45rem]"
                                                style={{ color: "#f7fbff" }}
                                            >
                                                {heroVideo.title}
                                            </h1>
                                            {heroVideo.description ? (
                                                <p className="max-w-[34rem] text-sm leading-8 text-white/84 md:text-base">
                                                    {heroVideo.description}
                                                </p>
                                            ) : null}
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </ParallaxLayer>
                    </MotionItem>

                    <MotionGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-1" stagger={0.08}>
                        {programCards.map((program, index) => (
                            <MotionItem key={`${program.title}-${index}`} preset="fade-left">
                                <motion.div
                                    whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                                    transition={publicMotionTokens.hoverSpring}
                                    className={`relative overflow-hidden rounded-[2.2rem] border p-5 shadow-[0_24px_66px_rgba(34,76,166,0.12)] md:p-6 ${
                                        index === 0
                                            ? "border-[rgba(96,148,255,0.22)] bg-[linear-gradient(150deg,rgba(60,120,242,0.94),rgba(89,145,255,0.88)_56%,rgba(167,206,255,0.82)_128%)] text-white"
                                            : "border-[rgba(26,72,164,0.1)] bg-white/88 text-[var(--ink)]"
                                    }`}
                                >
                                    {index === 0 ? (
                                        <>
                                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_24%)]" />
                                            <FloatingAccent className="right-[10%] top-[18%] h-16 w-16 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.14),transparent_72%)]" variant="mesh" />
                                        </>
                                    ) : null}

                                    <div className="relative z-[1] flex h-full flex-col gap-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${index === 0 ? "text-white/72" : "text-[var(--ink-muted)]"}`}>
                                                    {copy.sections.featuredPrograms}
                                                </p>
                                            </div>
                                            <ArrowRight className={`h-4 w-4 shrink-0 ${index === 0 ? "text-white" : "text-[var(--accent-strong)]"}`} weight="bold" />
                                        </div>

                                        <div className="space-y-3">
                                            <h2
                                                className={`max-w-[15ch] font-heading text-[1.55rem] leading-[1.04] tracking-[-0.032em] ${index === 0 ? "!text-white" : "text-[var(--ink)]"}`}
                                                style={index === 0 ? { color: "#f7fbff" } : undefined}
                                            >
                                                {program.title}
                                            </h2>
                                            {program.desc ? (
                                                <p className={`text-sm leading-7 ${index === 0 ? "text-white/82" : "text-[var(--ink-soft)]"}`}>
                                                    {program.desc}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="pt-2">
                                            <Link
                                                href={program.slug}
                                                className={`inline-flex items-center gap-2 text-sm font-semibold ${index === 0 ? "text-white" : "text-[var(--accent-strong)]"}`}
                                            >
                                                {ctaMain.text}
                                                <ArrowRight className="h-4 w-4" weight="bold" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            </MotionItem>
                        ))}

                        <MotionItem preset="fade-up" className="md:col-span-2 xl:col-span-1">
                            <motion.div
                                whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                                transition={publicMotionTokens.hoverSpring}
                                className="relative overflow-hidden rounded-[2.2rem] border border-[rgba(87,139,247,0.24)] bg-[linear-gradient(155deg,rgba(48,107,235,0.96),rgba(83,138,255,0.9)_56%,rgba(165,203,255,0.84)_126%)] p-5 text-white shadow-[0_28px_80px_rgba(31,83,190,0.16)] md:p-6"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_26%)]" />

                                <div className="relative z-[1] flex h-full flex-col gap-6">
                                    <div className="space-y-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/76">
                                            {copy.placeholders.ctaLabel}
                                        </p>
                                        <h2 className="max-w-[14ch] font-heading text-[1.9rem] leading-[1.04] tracking-[-0.03em] !text-white" style={{ color: "#f7fbff" }}>
                                            {copy.sections.contact}
                                        </h2>
                                        <p className="max-w-[24rem] text-sm leading-7 text-white/84">
                                            {copy.video.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            asChild
                                            size="lg"
                                            motion="magnetic"
                                            className="border-white/16 bg-[linear-gradient(135deg,rgba(8,38,92,0.44),rgba(19,60,132,0.4))] text-white shadow-none hover:bg-[linear-gradient(135deg,rgba(8,38,92,0.5),rgba(19,60,132,0.46))]"
                                        >
                                            <Link href={ctaMain.href} className="text-white">
                                                {ctaMain.text}
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="lg"
                                            motion="lift"
                                            className="border-white/18 bg-white/10 text-white hover:bg-white/16 hover:text-white"
                                        >
                                            <Link href={ctaContact.href} className="text-white">
                                                {ctaContact.text}
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </MotionItem>
                    </MotionGroup>
                </MotionGroup>
            </Container>
        </section>
    );
}

export default HeroSection;
