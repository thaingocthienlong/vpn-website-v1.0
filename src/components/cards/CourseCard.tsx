"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, GraduationCap } from "@phosphor-icons/react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

interface CourseCardProps {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    type: "ADMISSION" | "SHORT_COURSE" | "STUDY_ABROAD";
    duration?: string | null;
    price?: number | null;
    isRegistrationOpen?: boolean;
    isFeatured?: boolean;
    category?: {
        name: string;
        slug: string;
    } | null;
    locale?: "vi" | "en";
    variant?: "feature" | "default" | "compact";
    className?: string;
}

const viTypeLabels: Record<string, { label: string; color: "primary" | "accent" | "secondary" }> = {
    ADMISSION: { label: "Tuyển sinh", color: "primary" },
    SHORT_COURSE: { label: "Khóa ngắn hạn", color: "accent" },
    STUDY_ABROAD: { label: "Du học", color: "secondary" },
};

const enTypeLabels: Record<string, { label: string; color: "primary" | "accent" | "secondary" }> = {
    ADMISSION: { label: "Admissions", color: "primary" },
    SHORT_COURSE: { label: "Short Course", color: "accent" },
    STUDY_ABROAD: { label: "Study Abroad", color: "secondary" },
};

export function CourseCard({
    title,
    slug,
    excerpt,
    featuredImage,
    type,
    duration,
    price,
    isRegistrationOpen,
    category,
    locale = "vi",
    variant = "default",
    className,
}: CourseCardProps) {
    const isEn = locale === "en";
    const typeLabels = isEn ? enTypeLabels : viTypeLabels;
    const typeInfo = typeLabels[type] || typeLabels.SHORT_COURSE;
    const href = isEn ? `/en/training/${slug}` : `/dao-tao/${slug}`;
    const isFeature = variant === "feature";
    const isCompact = variant === "compact";

    const formattedPrice = price
        ? new Intl.NumberFormat(isEn ? "en-US" : "vi-VN", {
            style: "currency",
            currency: isEn ? "USD" : "VND",
            maximumFractionDigits: 0,
        }).format(price)
        : null;

    return (
        <Link href={href} className="group block h-full cursor-pointer">
            <article
                className={cn(
                    "interactive-card flex h-full flex-col overflow-hidden rounded-[2rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(234,243,255,0.84))] shadow-[var(--shadow-xs)]",
                    isCompact ? "p-5" : "",
                    className
                )}
            >
                {!isCompact && (
                    <div className={cn("relative w-full overflow-hidden", isFeature ? "aspect-[16/11]" : "aspect-[16/10]")}>
                        {featuredImage ? (
                            <Image
                                src={featuredImage}
                                alt={title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,rgba(23,88,216,0.16),rgba(234,243,255,0.52))]">
                                <GraduationCap className="h-14 w-14 text-[rgba(23,88,216,0.3)]" weight="duotone" />
                            </div>
                        )}
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                            <Badge variant={typeInfo.color} size="sm">
                                {typeInfo.label}
                            </Badge>
                            {isRegistrationOpen && (
                                <Badge variant="accent" size="sm">
                                    {isEn ? "Open" : "Đang mở"}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                <div className={cn("flex flex-1 flex-col", isCompact ? "pt-0" : isFeature ? "p-7 md:p-8" : "p-6 md:p-7")}>
                    {category && (
                        <span className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                            {category.name}
                        </span>
                    )}

                    {isCompact && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            <Badge variant={typeInfo.color} size="sm">
                                {typeInfo.label}
                            </Badge>
                            {isRegistrationOpen && (
                                <Badge variant="accent" size="sm">
                                    {isEn ? "Open" : "Đang mở"}
                                </Badge>
                            )}
                        </div>
                    )}

                    <h3 className={cn("font-heading text-[var(--ink)]", isFeature ? "mb-4 text-[2.15rem]" : isCompact ? "mb-3 text-[1.35rem]" : "mb-4 text-[1.8rem]")}>
                        {title}
                    </h3>

                    {excerpt && (
                        <p className={cn("text-[var(--ink-soft)]", isCompact ? "mb-5 line-clamp-2 text-sm leading-7" : "mb-6 line-clamp-3 text-sm leading-7")}>
                            {excerpt}
                        </p>
                    )}

                    <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-[var(--ink-soft)]">
                        {duration && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" weight="bold" />
                                {duration}
                            </span>
                        )}
                        {formattedPrice && (
                            <span className="font-semibold text-[var(--accent-strong)]">
                                {formattedPrice}
                            </span>
                        )}
                    </div>

                    <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                        {isEn ? "Learn more" : "Xem chi tiết"}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                    </span>
                </div>
            </article>
        </Link>
    );
}

export default CourseCard;
