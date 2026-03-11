"use client";

import { Skeleton } from "@/components/ui/Skeleton";

interface NewsCardSkeletonProps {
    variant?: "default" | "featured";
    count?: number;
}

/**
 * Single card skeleton matching NewsCard layout:
 * - Image area (aspect-[16/10] or [16/9])
 * - Category badge
 * - Title (2 lines)
 * - Excerpt (2 lines)
 * - Meta row (date + views)
 */
function SingleCard({ variant = "default" }: { variant?: "default" | "featured" }) {
    const isFeatured = variant === "featured";

    return (
        <div
            className={`
                overflow-hidden rounded-2xl h-full
                bg-white/70  border border-slate-100
                flex flex-col
            `}
        >
            {/* Image placeholder */}
            <Skeleton
                variant="rectangular"
                className={`w-full ${isFeatured ? "aspect-[16/9]" : "aspect-[16/10]"}`}
                animation="wave"
                height="auto"
            />

            {/* Content */}
            <div className={`flex-1 flex flex-col ${isFeatured ? "p-6" : "p-5"}`}>
                {/* Category badge */}
                <Skeleton variant="text" className="w-20 h-6 rounded-full mb-3" animation="wave" />

                {/* Title (2 lines) */}
                <Skeleton variant="text" className="w-full h-5 mb-2" animation="wave" />
                <Skeleton variant="text" className="w-3/4 h-5 mb-3" animation="wave" />

                {/* Excerpt (2 lines) */}
                <Skeleton variant="text" className="w-full h-4 mb-1" animation="wave" />
                <Skeleton variant="text" className="w-5/6 h-4 mb-4" animation="wave" />

                {/* Meta row */}
                <div className="flex items-center gap-4 mt-auto pt-3 border-t border-slate-100">
                    <Skeleton variant="text" className="w-24 h-3" animation="wave" />
                    <Skeleton variant="text" className="w-20 h-3" animation="wave" />
                </div>
            </div>
        </div>
    );
}

/**
 * News listing skeleton matching NewsList layout:
 * - Featured section (2 large cards)
 * - Regular grid (3 columns, count cards)
 */
export function NewsCardSkeleton({ variant = "default", count = 9 }: NewsCardSkeletonProps) {
    if (variant === "featured") {
        return (
            <div className="space-y-10">
                {/* Featured heading */}
                <section>
                    <Skeleton variant="text" className="w-48 h-7 mb-6" animation="wave" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SingleCard variant="featured" />
                        <SingleCard variant="featured" />
                    </div>
                </section>

                {/* Regular grid */}
                <section>
                    <Skeleton variant="text" className="w-40 h-7 mb-6" animation="wave" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: Math.max(count - 2, 3) }).map((_, i) => (
                            <SingleCard key={i} />
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SingleCard key={i} />
            ))}
        </div>
    );
}

export default NewsCardSkeleton;
