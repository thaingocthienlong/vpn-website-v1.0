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
    phone = "0912 114 511",
    email = "vanphong@vienphuongnam.com.vn",
}: CTASectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();

    const resolvedTitle = title || (isEn
        ? "Ready to work with Vien Phuong Nam?"
        : "Sẵn sàng đồng hành cùng Viện Phương Nam?");
    const resolvedSubtitle = subtitle || (isEn
        ? "Connect with our team for training, research, and partnership opportunities tailored to your goals."
        : "Kết nối với đội ngũ của chúng tôi để được tư vấn về đào tạo, nghiên cứu và các cơ hội hợp tác phù hợp.");
    const resolvedPrimaryCTA = primaryCTA || (isEn
        ? { text: "Request Consultation", href: "/en/contact" }
        : { text: "Yêu cầu tư vấn", href: "/lien-he" });
    const resolvedSecondaryCTA = secondaryCTA || (isEn
        ? { text: "Explore Services", href: "/en/services" }
        : { text: "Khám phá dịch vụ", href: "/dich-vu" });

    return (
        <section className="relative overflow-hidden py-24 md:py-30">
            <Container className="relative z-10">
                <MotionSection>
                    <div className="public-panel public-band public-frame relative overflow-hidden rounded-[3.2rem] px-6 py-10 shadow-[var(--shadow-sm)] md:px-10 md:py-12">
                        <FloatingAccent className="left-[9%] top-[16%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(35,77,128,0.14),transparent_72%)]" variant="halo" />
                        <FloatingAccent className="right-[10%] bottom-[12%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(160,121,66,0.14),transparent_74%)]" variant="orb" />

                        <MotionGroup className="relative grid gap-6 xl:grid-cols-[1.08fr_0.92fr]" stagger={0.1}>
                            <MotionItem>
                                <div className="public-panel-muted rounded-[2.8rem] p-6 md:p-8">
                                    <MotionGroup className="space-y-6" stagger={0.08}>
                                        <MotionItem>
                                            <div className="space-y-4">
                                                <p className="editorial-caption text-[var(--ink-muted)]">
                                                    {isEn ? "Consultation desk" : "Bàn tư vấn"}
                                                </p>
                                                <h2 className="max-w-[10.5ch] font-heading text-[2.65rem] leading-[0.92] text-[var(--ink)] md:text-[3.9rem]">
                                                    {resolvedTitle}
                                                </h2>
                                            </div>
                                        </MotionItem>
                                        <MotionItem>
                                            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
                                                <p className="max-w-[38rem] text-base leading-8 text-[var(--ink-soft)]">
                                                    {resolvedSubtitle}
                                                </p>
                                                <div className="rounded-[2rem] border border-[rgba(19,35,56,0.08)] bg-white/72 px-4 py-4">
                                                    <p className="editorial-caption text-[var(--ink-muted)]">
                                                        {isEn ? "Response window" : "Thời gian phản hồi"}
                                                    </p>
                                                    <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                                                        {isEn
                                                            ? "Our team usually gets back within one working day."
                                                            : "Đội ngũ thường phản hồi trong vòng một ngày làm việc."}
                                                    </p>
                                                </div>
                                            </div>
                                        </MotionItem>
                                        <MotionGroup className="flex flex-col gap-3 sm:flex-row" stagger={0.08}>
                                            <MotionItem>
                                                <Button asChild size="lg" motion="magnetic" className="min-w-[230px] rounded-[1.35rem] bg-[linear-gradient(135deg,#102846,#234d80)]">
                                                    <Link href={resolvedPrimaryCTA.href} className="inline-flex items-center gap-3">
                                                        <span>{resolvedPrimaryCTA.text}</span>
                                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/12">
                                                            <ArrowRight className="h-4 w-4" weight="bold" />
                                                        </span>
                                                    </Link>
                                                </Button>
                                            </MotionItem>
                                            <MotionItem>
                                                <Button asChild size="lg" variant="outline" motion="lift" className="min-w-[230px] rounded-[1.35rem] border-[rgba(19,35,56,0.12)] bg-white/52 hover:bg-white/74">
                                                    <Link href={resolvedSecondaryCTA.href} className="inline-flex items-center gap-3">
                                                        <span>{resolvedSecondaryCTA.text}</span>
                                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(16,40,70,0.06)]">
                                                            <ArrowRight className="h-4 w-4" weight="bold" />
                                                        </span>
                                                    </Link>
                                                </Button>
                                            </MotionItem>
                                        </MotionGroup>
                                    </MotionGroup>
                                </div>
                            </MotionItem>

                            <MotionItem>
                                <div className="public-panel-contrast public-frame flex h-full flex-col justify-between rounded-[2.8rem] p-5 md:p-6">
                                    <div className="space-y-3">
                                        <p className="editorial-caption text-white/54">
                                            {isEn ? "Direct channels" : "Kênh liên hệ trực tiếp"}
                                        </p>
                                        <h3 className="max-w-[12ch] font-heading text-[2rem] leading-[1.02] !text-white md:text-[2.5rem]" style={{ color: "#f7fbff" }}>
                                            {isEn ? "Speak with the institute team" : "Trao đổi trực tiếp với đội ngũ viện"}
                                        </h3>
                                        <p className="max-w-[30rem] text-sm leading-7 text-white/72">
                                            {isEn
                                                ? "Use direct contact details for quick consultation, scheduling, and partnership requests."
                                                : "Dùng các kênh liên hệ trực tiếp để đặt lịch, nhận tư vấn nhanh và kết nối hợp tác."}
                                        </p>
                                    </div>

                                    <MotionGroup className="mt-8 grid gap-3" stagger={0.08}>
                                        {phone ? (
                                            <MotionItem>
                                                <motion.a
                                                    href={`tel:${phone.replace(/\s/g, "")}`}
                                                    whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.01 }}
                                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                                                transition={publicMotionTokens.hoverSpring}
                                                    className="flex items-center gap-4 rounded-[1.85rem] border border-white/10 bg-white/8 px-4 py-4 text-white/82 transition-colors hover:bg-white/12 hover:text-white"
                                                >
                                                    <motion.div
                                                        className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/12 bg-white/10 text-white"
                                                        animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                                        transition={shouldReduceMotion ? undefined : { duration: 4.6, ease: "easeInOut", repeat: Infinity }}
                                                    >
                                                        <Phone className="h-[1.125rem] w-[1.125rem]" weight="bold" />
                                                    </motion.div>
                                                    <div>
                                                        <p className="editorial-caption text-white/46">
                                                            {isEn ? "Phone" : "Điện thoại"}
                                                        </p>
                                                        <span className="mt-2 block text-sm leading-7">{phone}</span>
                                                    </div>
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
                                                    className="flex items-center gap-4 rounded-[1.85rem] border border-white/10 bg-white/8 px-4 py-4 text-white/82 transition-colors hover:bg-white/12 hover:text-white"
                                                >
                                                    <motion.div
                                                        className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/12 bg-white/10 text-white"
                                                        animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                                        transition={shouldReduceMotion ? undefined : { duration: 4.6, ease: "easeInOut", repeat: Infinity, delay: 0.18 }}
                                                    >
                                                        <EnvelopeSimple className="h-[1.125rem] w-[1.125rem]" weight="bold" />
                                                    </motion.div>
                                                    <div>
                                                        <p className="editorial-caption text-white/46">
                                                            Email
                                                        </p>
                                                        <span className="mt-2 block text-sm leading-7">{email}</span>
                                                    </div>
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
