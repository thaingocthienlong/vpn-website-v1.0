"use client";

import { Skeleton } from "@/components/ui/Skeleton";

interface CardGridSkeletonProps {
    /** Number of skeleton cards */
    count?: number;
    /** Grid columns at lg breakpoint */
    columns?: 2 | 3 | 4;
    /** Card style */
    variant?: "service" | "course" | "partner";
}

/**
 * Reusable grid skeleton for service cards, course cards, and partner logos.
 */
export function CardGridSkeleton({
    count = 6,
    columns = 3,
    variant = "service",
}: CardGridSkeletonProps) {
    const colClass = columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : columns === 4
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

    if (variant === "partner") {
        return (
            <div className={`grid ${colClass} gap-6`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center p-6 rounded-2xl bg-white/70  border border-slate-100 shadow-sm">
                        <Skeleton variant="rectangular" className="w-32 h-20 rounded-lg mb-3" animation="wave" />
                        <Skeleton variant="text" className="w-24 h-4" animation="wave" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "course") {
        return (
            <div className={`grid ${colClass} gap-6`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl bg-white/70  border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.2)] flex flex-col">
                        {/* Image */}
                        <Skeleton variant="rectangular" className="w-full aspect-[16/10]" height="auto" animation="wave" />
                        <div className="p-5 flex flex-col flex-1 space-y-3">
                            {/* Badge */}
                            <div className="flex gap-2">
                                <Skeleton variant="text" className="w-16 h-5 rounded-full" animation="wave" />
                                <Skeleton variant="text" className="w-12 h-5 rounded-full" animation="wave" />
                            </div>
                            {/* Title */}
                            <Skeleton variant="text" className="w-full h-5" animation="wave" />
                            <Skeleton variant="text" className="w-3/4 h-5" animation="wave" />
                            {/* Excerpt */}
                            <Skeleton variant="text" className="w-full h-4" animation="wave" />
                            <Skeleton variant="text" className="w-5/6 h-4" animation="wave" />
                            {/* Button */}
                            <div className="mt-auto pt-3">
                                <Skeleton variant="rectangular" className="w-28 h-9 rounded-lg" animation="wave" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Default: service card
    return (
        <div className={`grid ${colClass} gap-6`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/70  border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.2)] space-y-4">
                    {/* Icon */}
                    <Skeleton variant="circular" width={56} height={56} animation="wave" />
                    {/* Title */}
                    <Skeleton variant="text" className="w-3/4 h-6" animation="wave" />
                    {/* Description */}
                    <Skeleton variant="text" className="w-full h-4" animation="wave" />
                    <Skeleton variant="text" className="w-5/6 h-4" animation="wave" />
                    {/* Feature chips */}
                    <div className="flex gap-2 flex-wrap">
                        <Skeleton variant="text" className="w-20 h-6 rounded-full" animation="wave" />
                        <Skeleton variant="text" className="w-24 h-6 rounded-full" animation="wave" />
                        <Skeleton variant="text" className="w-16 h-6 rounded-full" animation="wave" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default CardGridSkeleton;
