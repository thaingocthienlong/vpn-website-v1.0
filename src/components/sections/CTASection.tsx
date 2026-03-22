"use client";

import { Button } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, EnvelopeSimple, Phone } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { Container } from "@/components/layout";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

interface CTASectionProps {
    title?: string;
    subtitle?: string;
    primaryCTA?: {
        text: string;
        href: string;
    };
    secondaryCTA?: {
        text: string;
        href: string;
    };
    phone?: string;
    email?: string;
}

export function CTASection({
    title,
    subtitle,
    primaryCTA,
    secondaryCTA,
    phone = "028 1234 5678",
    email = "info@sisrd.edu.vn",
}: CTASectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();

    const resolvedTitle = title || (isEn
        ? "Ready to Start Your Learning Journey?"
        : "Sẵn Sàng Bắt Đầu Hành Trình Học Tập?");
    const resolvedSubtitle = subtitle || (isEn
        ? "Contact us today for a free consultation on the training programs best suited for you."
        : "Liên hệ ngay với chúng tôi để được tư vấn miễn phí về các chương trình đào tạo phù hợp nhất với bạn.");
    const resolvedPrimaryCTA = primaryCTA || (isEn
        ? { text: "Register for Consultation", href: "/en/contact" }
        : { text: "Đăng ký tư vấn", href: "/lien-he" });
    const resolvedSecondaryCTA = secondaryCTA || (isEn
        ? { text: "View Courses", href: "/en/training" }
        : { text: "Xem khóa học", href: "/dao-tao" });

    return (
        <section className="relative overflow-hidden py-20">
            <Container className="relative z-10">
                <MotionSection>
                    <div className="public-panel public-band relative overflow-hidden rounded-[3rem] px-6 py-10 shadow-[var(--shadow-sm)] md:px-10 md:py-12">
                        <FloatingAccent className="left-[9%] top-[16%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.14),transparent_72%)]" variant="halo" />
                        <FloatingAccent className="right-[10%] bottom-[12%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(127,178,255,0.16),transparent_74%)]" variant="orb" />

                        <MotionGroup className="relative grid gap-6 xl:grid-cols-[0.98fr_1.02fr]" stagger={0.1}>
                            <MotionItem>
                                <div className="public-panel-muted rounded-[2.3rem] p-6 md:p-7">
                                    <MotionGroup className="space-y-6" stagger={0.08}>
                                        <MotionItem>
                                            <h2 className="max-w-[12ch] font-heading text-[2.35rem] text-[var(--ink)] md:text-[3.4rem]">
                                                {resolvedTitle}
                                            </h2>
                                        </MotionItem>
                                        <MotionItem>
                                            <p className="max-w-[40rem] text-base leading-8 text-[var(--ink-soft)]">
                                                {resolvedSubtitle}
                                            </p>
                                        </MotionItem>
                                        <MotionGroup className="flex flex-col gap-3 sm:flex-row" stagger={0.08}>
                                            <MotionItem>
                                                <Button asChild size="lg" motion="magnetic" className="min-w-[220px]">
                                                    <Link href={resolvedPrimaryCTA.href} className="inline-flex items-center">
                                                        <span>{resolvedPrimaryCTA.text}</span>
                                                        <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                                                    </Link>
                                                </Button>
                                            </MotionItem>
                                            <MotionItem>
                                                <Button asChild size="lg" variant="outline" motion="lift" className="min-w-[220px]">
                                                    <Link href={resolvedSecondaryCTA.href}>
                                                        {resolvedSecondaryCTA.text}
                                                    </Link>
                                                </Button>
                                            </MotionItem>
                                        </MotionGroup>
                                    </MotionGroup>
                                </div>
                            </MotionItem>

                            <MotionItem>
                                <div className="public-panel-muted flex h-full flex-col justify-center rounded-[2.3rem] p-5 md:p-6">
                                    <MotionGroup className="grid gap-3" stagger={0.08}>
                                        {phone ? (
                                            <MotionItem>
                                                <motion.a
                                                    href={`tel:${phone.replace(/\s/g, "")}`}
                                                    whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.01 }}
                                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                                                    transition={publicMotionTokens.hoverSpring}
                                                    className="flex items-center gap-4 rounded-[1.5rem] border border-[rgba(26,72,164,0.12)] bg-white/82 px-4 py-4 text-[var(--ink-soft)] transition-colors hover:bg-white hover:text-[var(--ink)]"
                                                >
                                                    <motion.div
                                                        className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[rgba(23,88,216,0.14)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]"
                                                        animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                                        transition={shouldReduceMotion ? undefined : { duration: 4.6, ease: "easeInOut", repeat: Infinity }}
                                                    >
                                                        <Phone className="h-[1.125rem] w-[1.125rem]" weight="bold" />
                                                    </motion.div>
                                                    <span className="block text-sm leading-7">{phone}</span>
                                                </motion.a>
                                            </MotionItem>
                                        ) : null}
                                        {email ? (
                                            <MotionItem>
                                                <motion.a
                                                    href={`mailto:${email}`}
                                                    whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.01 }}
                                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                                                    transition={publicMotionTokens.hoverSpring}
                                                    className="flex items-center gap-4 rounded-[1.5rem] border border-[rgba(26,72,164,0.12)] bg-white/82 px-4 py-4 text-[var(--ink-soft)] transition-colors hover:bg-white hover:text-[var(--ink)]"
                                                >
                                                    <motion.div
                                                        className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[rgba(23,88,216,0.14)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]"
                                                        animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                                        transition={shouldReduceMotion ? undefined : { duration: 4.6, ease: "easeInOut", repeat: Infinity, delay: 0.18 }}
                                                    >
                                                        <EnvelopeSimple className="h-[1.125rem] w-[1.125rem]" weight="bold" />
                                                    </motion.div>
                                                    <span className="block text-sm leading-7">{email}</span>
                                                </motion.a>
                                            </MotionItem>
                                        ) : null}
                                    </MotionGroup>
                                </div>
                            </MotionItem>
                        </MotionGroup>
                    </div>
                </MotionSection>
            </Container>
        </section>
    );
}

export default CTASection;
