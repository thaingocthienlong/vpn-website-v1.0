"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui";
import { SectionHeader } from "./SectionHeader";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

interface Service {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    iconName?: string;
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
    const shouldReduceMotion = useReducedMotion();
    const resolvedServices = services.slice(0, 3);
    const [leadService, ...supportingServices] = resolvedServices;
    const basePath = isEn ? "/en/services" : "/dich-vu";
    const bubbleButtonClass = "rounded-[1.02rem] !border-white/28 !bg-[linear-gradient(180deg,rgba(252,254,255,0.22),rgba(241,247,251,0.12))] !text-white shadow-[0_14px_30px_-28px_rgba(8,20,33,0.42)] hover:!bg-[linear-gradient(180deg,rgba(252,254,255,0.3),rgba(241,247,251,0.18))] hover:!text-white";

    if (!leadService) {
        return null;
    }

    return (
        <SectionWrapper background="gradient-dark" padding="md" className="public-band">
            <MotionSection>
                <SectionHeader
                    badge={isEn ? "Capabilities" : "Năng lực"}
                    title={title || (isEn ? "Applied services and institutional delivery" : "Dịch vụ ứng dụng và năng lực triển khai")}
                    subtitle={subtitle || (isEn
                        ? "A restrained brief of the institute's applied work, framed as a service landscape rather than a card catalogue."
                        : "Một lát cắt cô đọng về năng lực triển khai của viện, được trình bày như bản ghi chú tổ chức thay vì danh mục thẻ nội dung.")}
                    variant="dark"
                />
            </MotionSection>

            <MotionGroup className="grid gap-7 xl:grid-cols-[minmax(0,0.92fr)_minmax(340px,1.02fr)] xl:items-start" stagger={0.1}>
                <MotionItem>
                    <motion.article
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="border-y border-white/10 py-5"
                    >
                        <div className="space-y-5">
                            <p className="editorial-caption text-[var(--on-dark-meta)]">
                                {isEn ? "Featured service" : "Dịch vụ tiêu biểu"}
                            </p>
                            <h3 className="max-w-[12ch] font-heading text-[2.15rem] !text-[var(--on-dark-heading)] md:text-[2.85rem]">
                                {leadService.title}
                            </h3>
                            <p className="max-w-[34rem] text-sm leading-[1.85rem] text-[var(--on-dark-body)] md:text-[0.96rem]">
                                {leadService.excerpt || (
                                    isEn
                                        ? "A lead service note that frames the institute's applied research, coordination, and implementation support."
                                        : "Một ghi chú dịch vụ dẫn hướng, giới thiệu các năng lực nghiên cứu ứng dụng, điều phối và hỗ trợ triển khai của viện."
                                )}
                            </p>
                            <div className="border-t border-white/8 pt-4">
                                <p className="max-w-[28rem] text-sm leading-7 text-[var(--on-dark-meta)]">
                                    {isEn
                                        ? "The homepage keeps this section deliberately concise so visitors can understand the service structure in one scan."
                                        : "Trang chủ chỉ giữ phần này ở mức cô đọng để người xem nhận ra ngay cấu trúc dịch vụ chỉ sau một lần quét mắt."}
                                </p>
                            </div>
                            <Button
                                asChild
                                variant="outline"
                                size="lg"
                                motion="magnetic"
                                className={bubbleButtonClass}
                            >
                                <Link href={`${basePath}/${leadService.slug}`} className="inline-flex items-center gap-3">
                                    <span>{isEn ? "Open featured service" : "Mở dịch vụ tiêu biểu"}</span>
                                    <ArrowRight className="h-4 w-4" weight="bold" />
                                </Link>
                            </Button>
                        </div>
                    </motion.article>
                </MotionItem>

                <MotionItem>
                    <motion.div
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="border-t border-white/10 pt-4"
                    >
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <p className="editorial-caption text-[var(--on-dark-meta)]">
                                {isEn ? "Supporting services" : "Dịch vụ hỗ trợ"}
                            </p>
                            <Link href={basePath} className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--on-dark-body)]">
                                {isEn ? "All services" : "Tất cả dịch vụ"}
                            </Link>
                        </div>

                        <div className="divide-y divide-white/8 border-y border-white/8">
                            {supportingServices.map((service) => (
                                <Link
                                    key={service.id}
                                    href={`${basePath}/${service.slug}`}
                                    className="group grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
                                >
                                    <div className="space-y-2">
                                        <h3 className="max-w-[18ch] font-heading text-[1.4rem] !text-[var(--on-dark-heading)]">
                                            {service.title}
                                        </h3>
                                        {service.excerpt ? (
                                            <p className="line-clamp-2 text-sm leading-7 text-[var(--on-dark-body)]">
                                                {service.excerpt}
                                            </p>
                                        ) : null}
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--on-dark-body)]">
                                        <span>{isEn ? "Open" : "Mở"}</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </MotionItem>
            </MotionGroup>
        </SectionWrapper>
    );
}

export default ServicesSection;
