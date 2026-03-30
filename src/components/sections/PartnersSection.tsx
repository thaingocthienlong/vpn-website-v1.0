"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { PartnerLogo } from "@/components/cards";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, publicMotionTokens } from "@/components/motion/PublicMotion";

interface Partner {
    id: string;
    name: string;
    logo?: string | null;
    website?: string | null;
}

interface PartnersSectionProps {
    partners?: Partner[];
    title?: string;
    subtitle?: string;
}

export function PartnersSection({
    partners = [],
    title,
    subtitle,
}: PartnersSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();

    if (partners.length === 0) {
        return null;
    }

    const visiblePartners = partners.slice(0, 8);

    return (
        <SectionWrapper padding="sm">
            <div className="border-y border-[rgba(16,40,70,0.12)] py-6">
                <div className="grid gap-8 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] xl:items-start">
                    <motion.div
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="space-y-4"
                    >
                        <div className="inline-flex items-center gap-3">
                            <span className="h-px w-10 bg-[rgba(16,40,70,0.18)]" />
                            <span className="editorial-caption text-[var(--ink-muted)]">
                                {isEn ? "Institutional proof" : "Bằng chứng tổ chức"}
                            </span>
                        </div>
                        <h2 className="max-w-[12ch] font-heading text-[2.15rem] text-[var(--ink)] md:text-[2.8rem]">
                            {title || (isEn ? "Partnerships that signal institutional trust" : "Các đối tác khẳng định độ tin cậy của tổ chức")}
                        </h2>
                        <p className="max-w-[30rem] text-sm leading-8 text-[var(--ink-soft)]">
                            {subtitle || (isEn
                                ? "A short trust block anchored by partner institutions instead of a dense logo wall."
                                : "Một khối tin cậy ngắn, đặt trọng tâm vào mạng lưới đối tác thay vì một bức tường logo dày đặc.")}
                        </p>
                    </motion.div>

                    <MotionGroup className="grid gap-x-8 gap-y-5 border-t border-[rgba(16,40,70,0.08)] pt-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.05}>
                        {visiblePartners.map((partner, index) => (
                            <MotionItem key={`${partner.id}-${index}`}>
                                <motion.div
                                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                    transition={publicMotionTokens.hoverSpring}
                                    className="flex min-h-[72px] items-center"
                                >
                                    <PartnerLogo name={partner.name} logo={partner.logo} website={partner.website} />
                                </motion.div>
                            </MotionItem>
                        ))}
                    </MotionGroup>
                </div>
            </div>
        </SectionWrapper>
    );
}

export default PartnersSection;
