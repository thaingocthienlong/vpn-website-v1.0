"use client";

import { SectionWrapper, type SectionWrapperProps } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { ServiceCard } from "@/components/cards";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { GlowingCard, GlowingCards } from "@/components/lightswind/glowing-cards";
import {
    Microscope,
    RefreshCcw,
    ShieldCheck,
    Leaf,
    FileCheck,
    GraduationCap,
    type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

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
    background?: SectionWrapperProps["background"];
    textColor?: SectionWrapperProps["textColor"];
    backdropBlur?: SectionWrapperProps["backdropBlur"];
}

const iconMap: Record<string, LucideIcon> = {
    microscope: Microscope,
    refresh: RefreshCcw,
    "shield-check": ShieldCheck,
    leaf: Leaf,
    "file-check": FileCheck,
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


export function ServicesSection({
    services,
    title,
    background,
    textColor,
    backdropBlur,
}: ServicesSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedServices = services || (isEn ? enServices : viServices);
    const resolvedTitle = title || (isEn ? "Our Services" : "Dịch Vụ Của Chúng Tôi");

    return (
        <SectionWrapper background={background || "frosted-white"} textColor={textColor} backdropBlur={backdropBlur}>
            <ScrollReveal>
                <SectionHeader
                    title={resolvedTitle}
                    centered
                />
            </ScrollReveal>

            <ScrollReveal delay={1}>
                <GlowingCards className="mt-6" gap="1.5rem" padding="0">
                    {resolvedServices.map((service) => (
                        <GlowingCard
                            key={service.id}
                            glowColor="#3B82F6"
                            className="w-full sm:basis-[calc(50%-0.75rem)] xl:basis-[calc(33.333%-1rem)] p-0 overflow-hidden"
                        >
                            <ServiceCard
                                title={service.title}
                                description={service.excerpt}
                                slug={service.slug}
                                icon={service.iconName ? iconMap[service.iconName] : undefined}
                                locale={locale}
                                variant="transparent"
                            />
                        </GlowingCard>
                    ))}
                </GlowingCards>
            </ScrollReveal>
        </SectionWrapper>
    );
}

export default ServicesSection;
