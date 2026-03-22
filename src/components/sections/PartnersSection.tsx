"use client";

import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { PartnerLogo } from "@/components/cards";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

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

    const resolvedTitle = title || (isEn ? "Strategic Partners" : "Đối Tác Chiến Lược");
    const resolvedSubtitle = subtitle || (isEn
        ? "We are proud to partner with leading education and business organizations"
        : "Chúng tôi tự hào hợp tác với các tổ chức giáo dục và doanh nghiệp hàng đầu");

    if (partners.length === 0) {
        return null;
    }

    const primaryRow = partners.slice(0, Math.ceil(partners.length / 2));
    const secondaryRow = partners.slice(Math.ceil(partners.length / 2));
    const fallbackRow = secondaryRow.length > 0 ? secondaryRow : primaryRow;
    const leadPartners = partners.slice(0, 3);

    return (
        <SectionWrapper>
            <MotionSection>
                <SectionHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
            </MotionSection>

            <div className="public-panel public-band relative overflow-hidden rounded-[2.6rem] p-5 md:p-6">
                <FloatingAccent className="left-[7%] top-[12%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.12),transparent_70%)]" variant="halo" />
                <MotionGroup className="relative grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]" stagger={0.1}>
                    <MotionItem>
                        <div className="public-panel-muted rounded-[2.2rem] p-5 md:p-6">
                            <MotionGroup className="grid gap-4" stagger={0.08}>
                                {leadPartners.map((partner) => (
                                    <MotionItem key={`${partner.id}-lead`}>
                                        <motion.div
                                            whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                                            transition={publicMotionTokens.hoverSpring}
                                            className="rounded-[1.75rem] border border-[rgba(26,72,164,0.1)] bg-white/72 p-3"
                                        >
                                            <PartnerLogo name={partner.name} logo={partner.logo} website={partner.website} />
                                        </motion.div>
                                    </MotionItem>
                                ))}
                            </MotionGroup>
                        </div>
                    </MotionItem>

                    <MotionGroup className="grid gap-4" stagger={0.08}>
                        <MotionItem>
                            <div className="overflow-hidden rounded-[2.2rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.78)] p-4 md:p-5">
                                <motion.div
                                    className="flex gap-4"
                                    animate={
                                        shouldReduceMotion
                                            ? undefined
                                            : { x: ["0%", "-12%", "0%"] }
                                    }
                                    transition={
                                        shouldReduceMotion
                                            ? undefined
                                            : { duration: 18, ease: "easeInOut", repeat: Infinity }
                                    }
                                >
                                    {[...primaryRow, ...primaryRow].map((partner, index) => (
                                        <motion.div
                                            key={`${partner.id}-primary-${index}`}
                                            className="min-w-[220px] shrink-0 rounded-[1.5rem] border border-[rgba(26,72,164,0.08)] bg-white/80 p-3"
                                            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                            transition={publicMotionTokens.hoverSpring}
                                        >
                                            <PartnerLogo name={partner.name} logo={partner.logo} website={partner.website} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </MotionItem>

                        <MotionItem>
                            <div className="overflow-hidden rounded-[2.2rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.78)] p-4 md:p-5">
                                <motion.div
                                    className="flex gap-4"
                                    animate={
                                        shouldReduceMotion
                                            ? undefined
                                            : { x: ["-8%", "0%", "-8%"] }
                                    }
                                    transition={
                                        shouldReduceMotion
                                            ? undefined
                                            : { duration: 20, ease: "easeInOut", repeat: Infinity }
                                    }
                                >
                                    {[...fallbackRow, ...fallbackRow].map((partner, index) => (
                                        <motion.div
                                            key={`${partner.id}-secondary-${index}`}
                                            className="min-w-[220px] shrink-0 rounded-[1.5rem] border border-[rgba(26,72,164,0.08)] bg-white/80 p-3"
                                            whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                            transition={publicMotionTokens.hoverSpring}
                                        >
                                            <PartnerLogo name={partner.name} logo={partner.logo} website={partner.website} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </MotionItem>
                    </MotionGroup>
                </MotionGroup>
            </div>
        </SectionWrapper>
    );
}

export default PartnersSection;
