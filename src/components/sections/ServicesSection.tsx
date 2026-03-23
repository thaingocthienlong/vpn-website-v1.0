"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import {
    ArrowRight,
    ArrowsClockwise,
    Flask,
    FileText,
    GraduationCap,
    Leaf,
    ShieldCheck,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

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

const iconMap: Record<string, ElementType> = {
    microscope: Flask,
    refresh: ArrowsClockwise,
    "shield-check": ShieldCheck,
    leaf: Leaf,
    "file-check": FileText,
    "graduation-cap": GraduationCap,
};

const viServices: Service[] = [
    { id: "sv-01", title: "Nghiên cứu Khoa học", slug: "nghien-cuu", excerpt: "Thực hiện các đề tài nghiên cứu khoa học, ứng dụng công nghệ mới", iconName: "microscope" },
    { id: "sv-02", title: "Chuyển giao Công nghệ", slug: "chuyen-giao", excerpt: "Chuyển giao, ứng dụng kết quả nghiên cứu vào thực tiễn sản xuất", iconName: "refresh" },
    { id: "sv-03", title: "Kiểm định An toàn", slug: "kiem-dinh", excerpt: "Kiểm định an toàn máy móc, thiết bị theo tiêu chuẩn quốc gia", iconName: "shield-check" },
    { id: "sv-04", title: "Quan trắc Môi trường", slug: "quan-trac", excerpt: "Quan trắc, phân tích và đánh giá các thông số môi trường", iconName: "leaf" },
    { id: "sv-05", title: "Tư vấn ISO", slug: "tu-van-iso", excerpt: "Tư vấn xây dựng và áp dụng hệ thống quản lý chất lượng ISO", iconName: "file-check" },
    { id: "sv-06", title: "Đào tạo & Cấp chứng chỉ", slug: "dao-tao", excerpt: "Đào tạo nghiệp vụ và cấp chứng chỉ chuyên môn theo quy định", iconName: "graduation-cap" },
];

const enServices: Service[] = [
    { id: "sv-01", title: "Scientific Research", slug: "nghien-cuu", excerpt: "Conducting scientific research projects, applying new technologies", iconName: "microscope" },
    { id: "sv-02", title: "Technology Transfer", slug: "chuyen-giao", excerpt: "Transferring and applying research results to practical production", iconName: "refresh" },
    { id: "sv-03", title: "Safety Inspection", slug: "kiem-dinh", excerpt: "Safety inspection of machinery and equipment per national standards", iconName: "shield-check" },
    { id: "sv-04", title: "Environmental Monitoring", slug: "quan-trac", excerpt: "Monitoring, analyzing, and evaluating environmental parameters", iconName: "leaf" },
    { id: "sv-05", title: "ISO Consulting", slug: "tu-van-iso", excerpt: "Consulting on building and implementing ISO quality management systems", iconName: "file-check" },
    { id: "sv-06", title: "Training & Certification", slug: "dao-tao", excerpt: "Professional training and certification as per regulations", iconName: "graduation-cap" },
];

function ServiceIcon({ iconName }: { iconName?: string }) {
    if (!iconName || !iconMap[iconName]) {
        return null;
    }

    const IconComponent = iconMap[iconName];

    return <IconComponent className="h-6 w-6" weight="duotone" />;
}

export function ServicesSection({
    services,
    title,
    subtitle,
}: ServicesSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();

    const resolvedServices = services || (isEn ? enServices : viServices);
    const resolvedTitle = title || (isEn ? "Our Services" : "Dịch Vụ Của Chúng Tôi");
    const resolvedSubtitle = subtitle || (isEn
        ? "Scientific research, technology transfer, and professional technical services"
        : "Nghiên cứu khoa học, chuyển giao công nghệ và các dịch vụ kỹ thuật chuyên nghiệp");
    const basePath = isEn ? "/en/services" : "/dich-vu";
    const leadService = resolvedServices[0];
    const upperStack = resolvedServices.slice(1, 3);
    const lowerGrid = resolvedServices.slice(3);

    return (
        <SectionWrapper background="gradient-blue">
            <MotionSection>
                <SectionHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
            </MotionSection>

            <MotionGroup className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)]" stagger={0.12}>
                {leadService ? (
                    <MotionItem>
                        <Link href={`${basePath}/${leadService.slug}`} className="group block h-full">
                            <motion.article
                                whileHover={shouldReduceMotion ? undefined : { y: -10, rotateX: 2.5, rotateY: -2 }}
                                transition={publicMotionTokens.hoverSpring}
                                style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                className="interactive-card public-panel public-band relative h-full overflow-hidden rounded-[2.4rem] p-6 md:p-8"
                            >
                                <FloatingAccent className="right-[10%] top-[8%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.14),transparent_72%)]" variant="halo" />
                                <div className="grid h-full gap-8">
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <motion.div
                                                className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] border border-[rgba(23,88,216,0.14)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]"
                                                animate={shouldReduceMotion ? undefined : { y: [0, -4, 0], scale: [1, 1.04, 1] }}
                                                transition={shouldReduceMotion ? undefined : { duration: 6, ease: "easeInOut", repeat: Infinity }}
                                            >
                                                <ServiceIcon iconName={leadService.iconName} />
                                            </motion.div>
                                            <ArrowRight className="h-4 w-4 text-[var(--accent-strong)]" weight="bold" />
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="max-w-[13ch] font-heading text-[2.3rem] text-[var(--ink)] md:text-[3rem]">
                                                {leadService.title}
                                            </h3>
                                            {leadService.excerpt ? (
                                                <p className="max-w-[40rem] text-sm leading-8 text-[var(--ink-soft)]">
                                                    {leadService.excerpt}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="grid gap-2.5 border-t border-[rgba(26,72,164,0.1)] pt-5 md:grid-cols-2">
                                        {upperStack.map((related) => (
                                            <div
                                                key={`${leadService.id}-${related.id}`}
                                                className="flex min-h-[104px] flex-col justify-between rounded-[1.45rem] border border-[rgba(23,88,216,0.1)] bg-white/66 px-4 py-3.5"
                                            >
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--ink-muted)]">
                                                    {resolvedTitle}
                                                </p>
                                                <p className="mt-2 text-sm leading-7 text-[var(--ink)]">
                                                    {related.title}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.article>
                        </Link>
                    </MotionItem>
                ) : null}

                <MotionGroup className="grid gap-5" stagger={0.1}>
                    {upperStack.map((service, index) => (
                        <MotionItem key={service.id}>
                            <Link href={`${basePath}/${service.slug}`} className="group block h-full">
                                <motion.article
                                    whileHover={shouldReduceMotion ? undefined : { y: -8, rotateX: 2.2, rotateY: -1.8 }}
                                    transition={publicMotionTokens.hoverSpring}
                                    style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                    className="interactive-card h-full rounded-[2.2rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(232,242,255,0.82))] p-6 shadow-[var(--shadow-xs)] md:p-7"
                                >
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <motion.div
                                            className="flex h-13 w-13 items-center justify-center rounded-[1.2rem] border border-[rgba(23,88,216,0.14)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]"
                                            animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                            transition={shouldReduceMotion ? undefined : { duration: 5.5, ease: "easeInOut", repeat: Infinity, delay: index * 0.25 }}
                                        >
                                            <ServiceIcon iconName={service.iconName} />
                                        </motion.div>
                                        <ArrowRight className="h-4 w-4 text-[var(--accent-strong)] transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                                    </div>
                                    <h3 className="max-w-[15ch] font-heading text-[1.95rem] text-[var(--ink)]">
                                        {service.title}
                                    </h3>
                                    {service.excerpt ? (
                                        <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                                            {service.excerpt}
                                        </p>
                                    ) : null}
                                </motion.article>
                            </Link>
                        </MotionItem>
                    ))}
                </MotionGroup>
            </MotionGroup>

            <MotionGroup className="mt-5 grid gap-5 md:grid-cols-3" stagger={0.1}>
                {lowerGrid.map((service, index) => (
                    <MotionItem key={service.id}>
                        <Link href={`${basePath}/${service.slug}`} className="group block h-full">
                            <motion.article
                                whileHover={shouldReduceMotion ? undefined : { y: -8, rotateX: 2.2, rotateY: -1.8 }}
                                transition={publicMotionTokens.hoverSpring}
                                style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                className="interactive-card h-full rounded-[2.1rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(232,242,255,0.82))] p-6 shadow-[var(--shadow-xs)] md:p-7"
                            >
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <motion.div
                                        className="flex h-13 w-13 items-center justify-center rounded-[1.2rem] border border-[rgba(23,88,216,0.14)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]"
                                        animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                        transition={shouldReduceMotion ? undefined : { duration: 5.5, ease: "easeInOut", repeat: Infinity, delay: index * 0.22 }}
                                    >
                                        <ServiceIcon iconName={service.iconName} />
                                    </motion.div>
                                    <ArrowRight className="h-4 w-4 text-[var(--accent-strong)] transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                                </div>
                                <h3 className="max-w-[15ch] font-heading text-[1.7rem] text-[var(--ink)]">
                                    {service.title}
                                </h3>
                                {service.excerpt ? (
                                    <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                                        {service.excerpt}
                                    </p>
                                ) : null}
                            </motion.article>
                        </Link>
                    </MotionItem>
                ))}
            </MotionGroup>
        </SectionWrapper>
    );
}

export default ServicesSection;
