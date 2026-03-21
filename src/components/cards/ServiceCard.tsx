"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
    title: string;
    description?: string | null;
    slug: string;
    icon?: LucideIcon;
    iconName?: string;
    locale?: "vi" | "en";
    variant?: "default" | "transparent";
    className?: string;
}

export function ServiceCard({
    title,
    description,
    slug,
    icon: Icon,
    locale = "vi",
    variant = "default",
    className,
}: ServiceCardProps) {
    const isEn = locale === "en";
    const href = isEn ? `/en/services/${slug}` : `/dich-vu/${slug}`;

    return (
        <Link href={href} className="group block h-full cursor-pointer rounded-[inherit]">
            <article className={cn(
                "flex h-full flex-col p-6 transition-shadow",
                variant === "default" && "rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md",
                variant === "transparent" && "bg-transparent border-none shadow-none",
                className
            )}>
                {Icon && (
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 via-blue-500/10 to-cyan-500/20 transition-transform duration-200 group-hover:scale-110">
                        <Icon className="h-7 w-7 text-blue-600 transition-colors duration-300 group-hover:text-blue-700" />
                    </div>
                )}

                <h3 className="mb-3 font-heading text-lg font-semibold text-sky-950 transition-colors duration-300 group-hover:text-blue-600">
                    {title}
                </h3>

                {description && (
                    <p className="mb-5 flex-1 text-sm leading-6 text-slate-700 transition-colors duration-300 group-hover:text-slate-800">
                        {description}
                    </p>
                )}

                <div className="mt-auto flex items-center text-sm font-medium text-blue-600 transition-colors duration-300 group-hover:text-blue-700">
                    <span>{isEn ? "View details" : "Xem chi tiết"}</span>
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </article>
        </Link>
    );
}

export default ServiceCard;
