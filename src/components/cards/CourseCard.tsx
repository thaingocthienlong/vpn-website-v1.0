"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui";
import { Clock, GraduationCap, ArrowRight } from "lucide-react";

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
}: CourseCardProps) {
    const isEn = locale === "en";
    const typeLabels = isEn ? enTypeLabels : viTypeLabels;
    const typeInfo = typeLabels[type] || typeLabels.SHORT_COURSE;
    const href = isEn ? `/en/training/${slug}` : `/dao-tao/${slug}`;

    const formattedPrice = price
        ? new Intl.NumberFormat(isEn ? "en-US" : "vi-VN", {
            style: "currency",
            currency: isEn ? "USD" : "VND",
            maximumFractionDigits: 0,
        }).format(price)
        : null;

    return (
        <Link href={href} className="group block h-full cursor-pointer">
            <article className="relative rounded-xl overflow-hidden h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg shadow-sm border border-slate-100 bg-white">

                {/* Image container — aspect-video fits most course banners */}
                <div className="relative w-full aspect-video">
                    {featuredImage ? (
                        <Image
                            src={featuredImage}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-accent/20 flex items-center justify-center">
                            <GraduationCap className="w-16 h-16 text-primary/30" />
                        </div>
                    )}
                </div>

                {/* Registration status — always visible */}
                {isRegistrationOpen && (
                    <div className="absolute bottom-3 right-3 z-20">
                        <Badge variant="accent" size="sm" className="animate-pulse">
                            {isEn ? "Open" : "Đang mở"}
                        </Badge>
                    </div>
                )}

                {/* Default state: bottom gradient scrim with title */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/40 via-black/10 to-transparent p-4 pt-12 transition-opacity duration-300 group-hover:opacity-0">
                    {/* {category && (
                        <span className="text-xs text-white/70 font-medium mb-1 block">
                            {category.name}
                        </span>
                    )}
                    <h3 className="font-heading text-base font-semibold text-white line-clamp-2 drop-shadow-md">
                        {title}
                    </h3> */}
                </div>

                {/* Hover state: blur overlay with full info */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 bg-black/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {category && (
                        <span className="text-xs text-white/70 font-medium mb-1">
                            {category.name}
                        </span>
                    )}

                    <h3 className="font-heading text-base font-semibold text-white mb-2 line-clamp-2">
                        {title}
                    </h3>

                    {excerpt && (
                        <p className="text-white/80 text-sm line-clamp-2 mb-2">
                            {excerpt}
                        </p>
                    )}

                    {/* Meta: duration + price */}
                    <div className="flex items-center gap-3 text-sm text-white/70 mb-3">
                        {duration && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {duration}
                            </span>
                        )}
                        {formattedPrice && (
                            <span className="font-semibold text-white">
                                {formattedPrice}
                            </span>
                        )}
                    </div>

                    {/* CTA */}
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        {isEn ? "Learn more" : "Xem chi tiết"}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </article>
        </Link>
    );
}

export default CourseCard;
