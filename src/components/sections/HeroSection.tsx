"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react";
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
}

export function HeroSection({
    ctaPrimary,
    ctaSecondary,
    featuredPrograms = [],
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
              },
          }
        : {
              hero: {
                  title: "Viện Phát triển Nguồn lực Xã hội Phương Nam",
                  subtitle: "Nghiên cứu • Đào tạo • Chuyển giao KHCN",
                  cta: "Khám phá",
              },
              sections: {
                  training: "Chương trình Đào tạo",
                  services: "Dịch vụ",
                  contact: "Liên hệ",
              },
          };

    const ctaMain = ctaPrimary || (isEn ? { text: copy.hero.cta, href: "/en/services" } : { text: copy.hero.cta, href: "/dich-vu" });
    const ctaContact = ctaSecondary || (isEn ? { text: copy.sections.contact, href: "/en/contact" } : { text: copy.sections.contact, href: "/lien-he" });

    const displayPrograms = featuredPrograms.slice(0, 1).map((program) => ({
        title: isEn ? (program.title_en || program.title) : program.title,
        desc: isEn ? (program.excerpt_en || program.excerpt || "") : (program.excerpt || ""),
        slug: isEn ? `/en/training/${program.slug}` : `/dao-tao/${program.slug}`,
    }));

    const spotlightProgram = displayPrograms[0] || {
        title: copy.sections.training,
        desc: copy.hero.subtitle,
        slug: ctaMain.href,
    };

    const heroSummaries = [
        {
            label: copy.sections.services,
            desc: copy.hero.subtitle,
            href: ctaMain.href,
        },
        {
            label: copy.sections.contact,
            desc: ctaContact.text,
            href: ctaContact.href,
        },
    ];

    return (
        <section className="relative overflow-hidden pb-16 pt-6 md:pb-24">
            <Container>
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(390px,0.92fr)]">
                    <motion.div
                        initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                        animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={publicMotionTokens.sectionSpring}
                        className="public-panel public-band relative overflow-hidden rounded-[2.9rem] p-6 md:p-8 lg:p-10"
                    >
                        <FloatingAccent className="right-[6%] top-[8%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.16),transparent_72%)]" variant="orb" />
                        <FloatingAccent className="bottom-[12%] left-[5%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.48),transparent_74%)]" variant="halo" />
                        <MotionGroup className="grid gap-8" stagger={0.1}>
                            <MotionItem className="space-y-7">
                                <Badge variant="default" size="md">
                                    {copy.sections.training}
                                </Badge>

                                <MotionGroup className="space-y-5" stagger={0.08}>
                                    <h1 className="max-w-[11.8ch] font-heading text-[2.9rem] leading-[0.9] tracking-[-0.065em] text-[var(--ink)] md:text-[4.25rem] xl:text-[4.7rem]">
                                        {copy.hero.title}
                                    </h1>
                                    <MotionItem className="flex max-w-3xl items-start gap-4" preset="fade-right">
                                        <div className="mt-2 h-14 w-px shrink-0 bg-[rgba(23,88,216,0.22)] md:h-16" />
                                        <p className="max-w-[38rem] text-base leading-8 text-[var(--ink-soft)] md:text-lg">
                                            {copy.hero.subtitle}
                                        </p>
                                    </MotionItem>
                                </MotionGroup>

                                <MotionItem className="flex flex-col gap-3 sm:flex-row" preset="fade-up">
                                    <Button asChild size="lg" motion="magnetic">
                                        <Link href={ctaMain.href}>
                                            {ctaMain.text}
                                            <ArrowRight className="h-4 w-4" weight="bold" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" motion="lift">
                                        <Link href={ctaContact.href}>{ctaContact.text}</Link>
                                    </Button>
                                </MotionItem>
                            </MotionItem>

                            <MotionGroup className="grid gap-4 border-t border-[rgba(26,72,164,0.1)] pt-6 md:grid-cols-2" stagger={0.1}>
                                {heroSummaries.map((item) => (
                                    <motion.div
                                        key={item.label}
                                        variants={{
                                            hidden: { opacity: 0, y: 18, scale: 0.98 },
                                            visible: { opacity: 1, y: 0, scale: 1 },
                                        }}
                                        whileHover={shouldReduceMotion ? undefined : { y: -6, rotateX: 2.5, rotateY: -2 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                    >
                                        <Link
                                            href={item.href}
                                            className="interactive-card block rounded-[1.75rem] border border-[rgba(26,72,164,0.1)] bg-white/76 p-4 transition-all duration-300 hover:border-[rgba(26,72,164,0.18)]"
                                        >
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                                    {item.label}
                                                </p>
                                                <ArrowRight className="h-4 w-4 text-[var(--accent-strong)]" weight="bold" />
                                            </div>
                                            <p className="text-sm leading-7 text-[var(--ink-soft)]">
                                                {item.desc}
                                            </p>
                                        </Link>
                                    </motion.div>
                                ))}
                            </MotionGroup>
                        </MotionGroup>
                    </motion.div>

                    <ParallaxLayer depth={30}>
                        <motion.div
                            initial={shouldReduceMotion ? false : { opacity: 0, x: 28, y: 22 }}
                            animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
                            transition={{ ...publicMotionTokens.sectionSpring, delay: 0.08 }}
                            className="public-panel-contrast public-band relative flex min-h-[430px] flex-col justify-between overflow-hidden rounded-[2.6rem] p-6 md:p-7"
                        >
                            <FloatingAccent className="right-[10%] top-[12%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),transparent_72%)]" variant="mesh" />
                            <FloatingAccent className="bottom-[16%] left-[8%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(120,169,255,0.22),transparent_74%)]" variant="orb" />
                            <MotionGroup className="flex h-full flex-col justify-between gap-6" stagger={0.1}>
                                <MotionItem className="flex items-center justify-between gap-4" preset="fade-left">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
                                        {copy.sections.training}
                                    </p>
                                    <Button asChild variant="outline" size="icon" motion="magnetic" className="border-white/14 bg-white/8 text-white hover:bg-white/14 hover:text-white">
                                        <Link href={spotlightProgram.slug} aria-label={spotlightProgram.title}>
                                            <ArrowRight className="h-4 w-4" weight="bold" />
                                        </Link>
                                    </Button>
                                </MotionItem>

                                <MotionItem className="space-y-4" preset="fade-left">
                                    <h2 className="max-w-[12ch] font-heading text-[2.05rem] text-white md:text-[2.45rem]">
                                        {spotlightProgram.title}
                                    </h2>
                                    {spotlightProgram.desc ? (
                                        <p className="max-w-[30rem] text-sm leading-8 text-white/76">
                                            {spotlightProgram.desc}
                                        </p>
                                    ) : null}
                                </MotionItem>

                                <MotionItem className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row xl:flex-col" preset="fade-up">
                                    <Button
                                        asChild
                                        variant="secondary"
                                        size="lg"
                                        motion="magnetic"
                                        className="border-white/16 bg-white !text-[var(--accent-strong)] hover:bg-[rgba(255,255,255,0.92)]"
                                    >
                                        <Link href={spotlightProgram.slug}>{ctaMain.text}</Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        motion="lift"
                                        className="border-white/14 text-white hover:bg-white/10 hover:text-white"
                                    >
                                        <Link href={ctaContact.href}>{ctaContact.text}</Link>
                                    </Button>
                                </MotionItem>
                            </MotionGroup>
                        </motion.div>
                    </ParallaxLayer>
                </div>
            </Container>
        </section>
    );
}

export default HeroSection;
