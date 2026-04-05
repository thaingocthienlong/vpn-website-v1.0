"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { PartnerLogo } from "@/components/cards";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, publicMotionTokens } from "@/components/motion/PublicMotion";
import {
    getAppearanceTargetProps,
    getAppearanceTextStyle,
} from "@/lib/appearance/runtime";

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

    return (
        <SectionWrapper padding="sm" appearanceTargetId="homepage.section.partners.surface">
            <div className="border-y border-[rgba(16,40,70,0.12)] py-7 md:py-9">
                <MotionGroup className="space-y-7 md:space-y-8" stagger={0.06}>
                    <MotionItem>
                        <motion.div
                            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                            transition={publicMotionTokens.hoverSpring}
                            className="space-y-4"
                            {...getAppearanceTargetProps("homepage.section.partners.header")}
                        >
                            <div className="inline-flex items-center gap-3">
                                <span className="h-px w-10 bg-[rgba(16,40,70,0.18)]" />
                                <span className="editorial-caption text-[var(--ink-muted)]">
                                    {isEn ? "Institutional proof" : "Bằng chứng tổ chức"}
                                </span>
                            </div>
                            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_auto] xl:items-end xl:justify-between">
                                <div className="space-y-3">
                                    <h2
                                        className="max-w-[18ch] font-heading text-[2.15rem] text-[var(--ink)] md:text-[2.8rem]"
                                        style={getAppearanceTextStyle({
                                            colorRole: "title",
                                            colorFallback: "var(--ink)",
                                            sizeRole: "title",
                                            sizeFallback: "clamp(2rem,4vw,3.05rem)",
                                        })}
                                    >
                                        {title || (isEn ? "Partnerships that signal institutional trust" : "Đối tác liên kết")}
                                    </h2>
                                    <p
                                        className="max-w-[42rem] text-sm leading-8 text-[var(--ink-soft)]"
                                        style={getAppearanceTextStyle({
                                            colorRole: "body",
                                            colorFallback: "var(--ink-soft)",
                                            sizeRole: "body",
                                            sizeFallback: "0.96rem",
                                        })}
                                    >
                                        {subtitle || (isEn
                                            ? "A full institutional partner wall designed to keep every mark legible, calm, and credible."
                                            : "Mạng lưới đối tác được trình bày như một bức tường nhận diện gọn gàng, đủ rộng để mọi logo hiển thị rõ ràng và chuyên nghiệp.")}
                                    </p>
                                </div>
                                <p
                                    className="editorial-caption text-[var(--ink-muted)] xl:justify-self-end"
                                    style={getAppearanceTextStyle({
                                        colorRole: "badge",
                                        colorFallback: "var(--ink-muted)",
                                    })}
                                >
                                    {partners.length} {isEn ? "active partners" : "đối tác đang hiển thị"}
                                </p>
                            </div>
                        </motion.div>
                    </MotionItem>

                    <MotionItem>
                        <MotionGroup
                            className="grid grid-cols-2 gap-3 border-t border-[rgba(16,40,70,0.08)] pt-5 md:grid-cols-3 md:gap-4 xl:grid-cols-6 xl:gap-4"
                            stagger={0.03}
                        >
                            {partners.map((partner, index) => (
                                <MotionItem key={`${partner.id}-${index}`}>
                                    <motion.div
                                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        className="flex h-full min-h-[104px] items-stretch"
                                    >
                                        <PartnerLogo name={partner.name} logo={partner.logo} website={partner.website} />
                                    </motion.div>
                                </MotionItem>
                            ))}
                        </MotionGroup>
                    </MotionItem>
                </MotionGroup>
            </div>
        </SectionWrapper>
    );
}

export default PartnersSection;
