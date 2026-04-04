"use client";

import { Skeleton } from "@/components/ui/Skeleton";

interface NewsCardSkeletonProps {
    variant?: "default" | "featured";
    count?: number;
    columns?: 2 | 3;
    layout?: "grid" | "rows";
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

function SingleRow() {
    return (
        <div className="grid gap-6 py-8 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1fr)_16rem] md:items-start lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
            <div className="order-2 md:order-1">
                <div className="mb-4 flex flex-wrap gap-3">
                    <Skeleton variant="text" className="h-3 w-20" animation="wave" />
                    <Skeleton variant="text" className="h-3 w-24" animation="wave" />
                    <Skeleton variant="text" className="h-3 w-16" animation="wave" />
                </div>
                <Skeleton variant="text" className="mb-3 h-8 w-full max-w-3xl" animation="wave" />
                <Skeleton variant="text" className="mb-3 h-8 w-11/12 max-w-2xl" animation="wave" />
                <Skeleton variant="text" className="mb-2 h-6 w-full max-w-3xl" animation="wave" />
                <Skeleton variant="text" className="h-6 w-5/6 max-w-2xl" animation="wave" />
            </div>
            <div className="order-1 md:order-2">
                <Skeleton variant="rectangular" className="aspect-[16/10] w-full rounded-[1.4rem]" animation="wave" height="auto" />
            </div>
        </div>
    );
}

/**
 * News listing skeleton matching NewsList layout:
 * - Featured section (2 large cards)
 * - Regular grid (3 columns, count cards)
 */
export function NewsCardSkeleton({
    variant = "default",
    count = 9,
    columns = 3,
    layout = "grid",
}: NewsCardSkeletonProps) {
    const regularGridClass = columns === 2
        ? "grid grid-cols-1 gap-6 md:grid-cols-2"
        : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3";

    if (layout === "rows") {
        return (
            <div className="public-panel rounded-[2.2rem] px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
                <div className="divide-y divide-[rgba(26,72,164,0.14)]">
                    {Array.from({ length: count }).map((_, i) => (
                        <SingleRow key={i} />
                    ))}
                </div>
            </div>
        );
    }

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
                    <div className={regularGridClass}>
                        {Array.from({ length: Math.max(count - 2, 3) }).map((_, i) => (
                            <SingleCard key={i} />
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className={regularGridClass}>
            {Array.from({ length: count }).map((_, i) => (
                <SingleCard key={i} />
            ))}
        </div>
    );
}

export default NewsCardSkeleton;
