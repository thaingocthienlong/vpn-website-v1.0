"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, MotionSection } from "@/components/motion/PublicMotion";

interface Service {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    hasEnglishContent?: boolean;
}

interface ServiceCardConfig {
    key: "science-tech" | "partnerships" | "study-abroad";
    titleVi: string;
    titleEn: string;
    parentSlug: string;
    childSlugs: string[];
}

interface ServicesApiResponse {
    data?: Service[];
}

interface ResolvedServiceCard {
    key: ServiceCardConfig["key"];
    title: string;
    parent: Service;
    links: Service[];
}

const SERVICE_CARD_CONFIGS: ServiceCardConfig[] = [
    {
        key: "science-tech",
        titleVi: "Khoa học và công nghệ",
        titleEn: "Science and Technology",
        parentSlug: "dich-vu-khoa-hoc-va-cong-nghe",
        childSlugs: ["nghien-cuu-khoa-hoc"],
    },
    {
        key: "partnerships",
        titleVi: "Hợp tác trong và ngoài nước",
        titleEn: "Domestic and International Partnerships",
        parentSlug: "hop-tac-trong-va-ngoai-nuoc",
        childSlugs: ["hop-tac-trong-va-ngoai-nuoc"],
    },
    {
        key: "study-abroad",
        titleVi: "Du học - Định cư",
        titleEn: "Study Abroad and Immigration",
        parentSlug: "du-hoc-va-dinh-cu",
        childSlugs: [
            "dich-vu-tu-van-visa-cua-leading-edge-migration-lem-chia-khoa-vang-chinh-phuc-giac-mo-uc",
            "gioi-thieu-truong-va-nganh-hoc-noi-bat-o-uc",
            "he-thong-giao-duc-tai-uc",
            "gioi-thieu-ve-nuoc-uc",
            "pte-academic-2025-nhung-thay-doi-quan-trong-tu-782025",
        ],
    },
];

function resolveCards(services: Service[], isEn: boolean): ResolvedServiceCard[] {
    const serviceBySlug = new Map(services.map((service) => [service.slug, service]));

    return SERVICE_CARD_CONFIGS.map((config) => {
        const parent = serviceBySlug.get(config.parentSlug);
        if (!parent) return null;

        const links = config.childSlugs
            .map((slug) => serviceBySlug.get(slug))
            .filter((service): service is Service => Boolean(service));

        return {
            key: config.key,
            title: isEn ? config.titleEn : config.titleVi,
            parent,
            links,
        };
    }).filter((card): card is ResolvedServiceCard => card !== null);
}

interface ServicesSectionProps {
    services?: Service[];
    title?: string;
    subtitle?: string;
}

export function ServicesSection({
    services = [],
    title,
    subtitle,
}: ServicesSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const [remoteServices, setRemoteServices] = useState<Service[]>([]);
    const basePath = isEn ? "/en/services" : "/dich-vu";
    const sourceServices = useMemo(
        () => (remoteServices.length > 0 ? remoteServices : services),
        [remoteServices, services]
    );

    const hasRequiredParents = useMemo(
        () =>
            SERVICE_CARD_CONFIGS.every((config) =>
                sourceServices.some((service) => service.slug === config.parentSlug)
            ),
        [sourceServices]
    );

    useEffect(() => {
        if (isEn || hasRequiredParents) return;

        let ignore = false;

        async function hydrateServicesForCards() {
            try {
                const response = await fetch(`/api/services?locale=${isEn ? "en" : "vi"}`);
                if (!response.ok) return;

                const payload: ServicesApiResponse = await response.json();
                if (!ignore && Array.isArray(payload.data)) {
                    setRemoteServices(payload.data);
                }
            } catch {
                // Keep existing payload fallback from props
            }
        }

        hydrateServicesForCards();

        return () => {
            ignore = true;
        };
    }, [hasRequiredParents, isEn]);

    const cards = useMemo(() => resolveCards(sourceServices, isEn), [sourceServices, isEn]);

    if (cards.length === 0) return null;

    return (
        <SectionWrapper
            background="gradient-dark"
            padding="md"
            className="public-band [--on-dark-heading:#ffffff] [&_h2]:!text-white"
            appearanceTargetId="homepage.section.services.surface"
        >
            <MotionSection>
                <SectionHeader
                    badge={isEn ? "Capabilities" : "Năng lực"}
                    title={title || (isEn ? "Applied services and institutional delivery" : "Dịch vụ ứng dụng và năng lực triển khai")}
                    subtitle={subtitle || (isEn
                        ? "A concise service map with direct pathways into each capability area."
                        : "Bố cục dạng thẻ giúp người xem đi thẳng vào từng nhóm dịch vụ và nội dung chi tiết bên trong.")}
                    variant="dark"
                    appearanceTargetId="homepage.section.services.header"
                />
            </MotionSection>

            <MotionGroup className="grid gap-8 lg:grid-cols-3 lg:items-start" stagger={0.08}>
                {cards.map((card) => (
                    <MotionItem key={card.key}>
                        <motion.article
                            whileHover={{ y: -2 }}
                            className="group"
                        >
                            <div
                                className={cn(
                                    "h-[220px] overflow-hidden rounded-[1.35rem] border border-white/12",
                                    card.parent.featuredImage ? "bg-cover bg-center bg-no-repeat" : "bg-[linear-gradient(155deg,rgba(228,240,255,0.18),rgba(111,170,255,0.1))]"
                                )}
                                style={
                                    card.parent.featuredImage
                                        ? { backgroundImage: `url(\"${card.parent.featuredImage}\")` }
                                        : undefined
                                }
                                aria-label={card.title}
                            />

                            <div className="relative z-10 mx-5 -mt-11 rounded-[1.2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(16,33,52,0.92),rgba(13,27,43,0.94))] p-6 shadow-[0_22px_38px_-26px_rgba(2,8,18,0.9)]">
                                <h3 className="font-heading text-[2rem] leading-[1.04] !text-white" style={{ color: "#ffffff" }}>
                                    <Link
                                        href={`${basePath}/${card.parent.slug}`}
                                        className="text-white transition-colors duration-300 hover:text-white/90"
                                        style={{ color: "#ffffff" }}
                                    >
                                        {card.title}
                                    </Link>
                                </h3>

                                <ul className="mt-5 space-y-2.5">
                                    {card.links.map((service) => (
                                        <li key={`${card.key}-${service.slug}`}>
                                            <Link
                                                href={`${basePath}/${service.slug}`}
                                                className="group/link inline-flex items-start gap-2.5 text-[1.01rem] leading-7 text-[var(--on-dark-body)] transition-colors duration-300 hover:text-white"
                                            >
                                                <ArrowRight className="mt-[0.44rem] h-3.5 w-3.5 shrink-0 text-[var(--on-dark-meta)] transition-all duration-300 group-hover/link:translate-x-0.5 group-hover/link:text-white" weight="bold" />
                                                <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">
                                                    {service.title}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.article>
                    </MotionItem>
                ))}
            </MotionGroup>
        </SectionWrapper>
    );
}

export default ServicesSection;
