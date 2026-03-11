"use client";

import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { PartnerLogo } from "@/components/cards";
import GlowingCards, { GlowingCard } from "@/components/lightswind/glowing-cards";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import {
    ThreeDScrollTriggerContainer,
    ThreeDScrollTriggerRow,
} from "@/components/effects/ThreeDScrollTrigger";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

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

    const resolvedTitle = title || (isEn ? "Strategic Partners" : "Đối Tác Chiến Lược");
    const resolvedSubtitle = subtitle || (isEn
        ? "We are proud to partner with leading education and business organizations"
        : "Chúng tôi tự hào hợp tác với các tổ chức giáo dục và doanh nghiệp hàng đầu");

    if (partners.length === 0) {
        return null;
    }

    // Split into 2 rows for visual depth (opposite flow directions)
    const mid = Math.ceil(partners.length / 2);
    const row1Partners = partners.slice(0, mid);
    const row2Partners = partners.slice(mid);

    // If fewer than 4 partners, use single row
    const useSingleRow = partners.length < 4;

    return (
        <SectionWrapper>
            <ScrollReveal>
                <SectionHeader
                    title={resolvedTitle}
                    subtitle={resolvedSubtitle}
                    centered
                />
            </ScrollReveal>

            <ScrollReveal delay={1}>
                <ThreeDScrollTriggerContainer className="space-y-4">
                    {/* Row 1: flows right, reacts to scroll velocity */}
                    <ThreeDScrollTriggerRow
                        baseVelocity={3}
                        direction={1}
                        className="py-2"
                    >
                        <GlowingCards
                            gap="1.5rem"
                            padding="0"
                            maxWidth="max-content"
                            responsive={false}
                            borderGlowOnly={true}
                            innerClassName="flex-nowrap min-w-max ml-6"
                        >
                            {(useSingleRow ? partners : row1Partners).map((partner) => (
                                <GlowingCard key={partner.id} className="h-20 w-[160px] min-w-[160px] p-0 flex shrink-0 bg-white">
                                    <PartnerLogo
                                        name={partner.name}
                                        logo={partner.logo}
                                        website={partner.website}
                                    />
                                </GlowingCard>
                            ))}
                        </GlowingCards>
                    </ThreeDScrollTriggerRow>

                    {/* Row 2: flows left (opposite), slightly slower for depth */}
                    {!useSingleRow && row2Partners.length > 0 && (
                        <ThreeDScrollTriggerRow
                            baseVelocity={2}
                            direction={-1}
                            className="py-2"
                        >
                            <GlowingCards
                                gap="1.5rem"
                                padding="0"
                                maxWidth="max-content"
                                responsive={false}
                                borderGlowOnly={true}
                                innerClassName="flex-nowrap min-w-max ml-6"
                            >
                                {row2Partners.map((partner) => (
                                    <GlowingCard key={partner.id} className="h-20 w-[160px] min-w-[160px] p-0 flex shrink-0 bg-white">
                                        <PartnerLogo
                                            name={partner.name}
                                            logo={partner.logo}
                                            website={partner.website}
                                        />
                                    </GlowingCard>
                                ))}
                            </GlowingCards>
                        </ThreeDScrollTriggerRow>
                    )}
                </ThreeDScrollTriggerContainer>
            </ScrollReveal>
        </SectionWrapper>
    );
}

export default PartnersSection;
