"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
    title: string;
    description?: string | null;
    slug: string;
    icon?: React.ElementType;
    iconName?: string;
    locale?: "vi" | "en";
    className?: string;
    variant?: "feature" | "default";
}

export function ServiceCard({
    title,
    description,
    slug,
    icon: Icon,
    locale = "vi",
    className,
    variant = "default",
}: ServiceCardProps) {
    const isEn = locale === "en";
    const href = isEn ? `/en/services/${slug}` : `/dich-vu/${slug}`;
    const isFeature = variant === "feature";

    return (
        <Link href={href} className="group block h-full cursor-pointer rounded-[inherit]">
            <article
                className={cn(
                    "interactive-card relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(232,242,255,0.82))]",
                    "shadow-[var(--shadow-xs)]",
                    isFeature ? "min-h-[320px] p-7 md:p-8" : "min-h-[260px] p-6 md:p-7",
                    className
                )}
            >
                <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--accent),rgba(109,167,255,0.45),transparent)]" />

                <div className="mb-8 flex items-start gap-4">
                    {Icon ? (
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-[rgba(23,88,216,0.14)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)] transition-transform duration-300 group-hover:-translate-y-0.5">
                            <Icon className="h-7 w-7" weight="duotone" />
                        </div>
                    ) : (
                        <div className="h-14 w-14 rounded-[1.25rem] border border-[rgba(23,88,216,0.14)] bg-[rgba(23,88,216,0.08)]" />
                    )}
                </div>

                <h3 className={cn("font-heading text-[var(--ink)]", isFeature ? "mb-5 text-[2rem]" : "mb-4 text-[1.75rem]")}>
                    {title}
                </h3>

                {description && (
                    <p className={cn("mb-8 flex-1 text-[var(--ink-soft)]", isFeature ? "text-[15px] leading-8" : "text-sm leading-7")}>
                        {description}
                    </p>
                )}

                <div className="mt-auto flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                    <span>{isEn ? "View details" : "Xem chi tiết"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                </div>
            </article>
        </Link>
    );
}

export default ServiceCard;
