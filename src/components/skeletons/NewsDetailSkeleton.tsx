"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * News detail page skeleton matching NewsDetail layout:
 * - Hero image (aspect-video)
 * - Category badge + title + meta
 * - Content paragraphs
 * - Share buttons
 * - Related posts (3 cards)
 */
export function NewsDetailSkeleton() {
    return (
        <article className="space-y-8">
            {/* Hero Image */}
            <Skeleton
                variant="rectangular"
                className="w-full aspect-video rounded-2xl"
                animation="wave"
                height="auto"
            />

            {/* Header */}
            <header className="space-y-4">
                {/* Category badge */}
                <Skeleton variant="text" className="w-24 h-8 rounded-full" animation="wave" />

                {/* Title */}
                <Skeleton variant="text" className="w-full h-9" animation="wave" />
                <Skeleton variant="text" className="w-4/5 h-9" animation="wave" />

                {/* Meta row */}
                <div className="flex items-center gap-4">
                    <Skeleton variant="text" className="w-32 h-4" animation="wave" />
                    <Skeleton variant="text" className="w-24 h-4" animation="wave" />
                    <Skeleton variant="text" className="w-28 h-4" animation="wave" />
                </div>
            </header>

            {/* Content */}
            <div className="space-y-4">
                <Skeleton variant="text" className="w-full h-4" animation="wave" />
                <Skeleton variant="text" className="w-full h-4" animation="wave" />
                <Skeleton variant="text" className="w-11/12 h-4" animation="wave" />
                <Skeleton variant="text" className="w-full h-4" animation="wave" />
                <Skeleton variant="text" className="w-3/4 h-4" animation="wave" />

                {/* Image in content */}
                <Skeleton
                    variant="rectangular"
                    className="w-full rounded-xl my-6"
                    height={300}
                    animation="wave"
                />

                <Skeleton variant="text" className="w-full h-4" animation="wave" />
                <Skeleton variant="text" className="w-full h-4" animation="wave" />
                <Skeleton variant="text" className="w-5/6 h-4" animation="wave" />
                <Skeleton variant="text" className="w-full h-4" animation="wave" />
                <Skeleton variant="text" className="w-2/3 h-4" animation="wave" />
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                <Skeleton variant="text" className="w-16 h-5" animation="wave" />
                <Skeleton variant="circular" width={36} height={36} animation="wave" />
                <Skeleton variant="circular" width={36} height={36} animation="wave" />
                <Skeleton variant="circular" width={36} height={36} animation="wave" />
            </div>

            {/* Related posts */}
            <section className="pt-8 border-t border-slate-100">
                <Skeleton variant="text" className="w-48 h-7 mb-6" animation="wave" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl bg-white/70  border border-slate-100">
                            <Skeleton variant="rectangular" className="w-full aspect-[16/10]" height="auto" animation="wave" />
                            <div className="p-5 space-y-2">
                                <Skeleton variant="text" className="w-20 h-6 rounded-full" animation="wave" />
                                <Skeleton variant="text" className="w-full h-5" animation="wave" />
                                <Skeleton variant="text" className="w-3/4 h-5" animation="wave" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </article>
    );
}

/**
 * Sidebar skeleton matching NewsSidebar:
 * - Search box
 * - Categories list
 * - Recent posts (5)
 * - Popular posts (5)
 */
export function NewsSidebarSkeleton() {
    return (
        <div className="space-y-8">
            {/* Search */}
            <div>
                <Skeleton variant="text" className="w-24 h-6 mb-3" animation="wave" />
                <Skeleton variant="rectangular" className="w-full h-10 rounded-lg" animation="wave" />
            </div>

            {/* Categories */}
            <div>
                <Skeleton variant="text" className="w-24 h-6 mb-3" animation="wave" />
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <Skeleton variant="text" className="w-32 h-5" animation="wave" />
                            <Skeleton variant="text" className="w-8 h-5 rounded-full" animation="wave" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent posts */}
            <div>
                <Skeleton variant="text" className="w-28 h-6 mb-3" animation="wave" />
                <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="flex-1 space-y-1">
                                <Skeleton variant="text" className="w-full h-4" animation="wave" />
                                <Skeleton variant="text" className="w-3/4 h-4" animation="wave" />
                                <Skeleton variant="text" className="w-20 h-3" animation="wave" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Popular posts */}
            <div>
                <Skeleton variant="text" className="w-32 h-6 mb-3" animation="wave" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton variant="circular" width={28} height={28} animation="wave" />
                            <div className="flex-1 space-y-1">
                                <Skeleton variant="text" className="w-full h-4" animation="wave" />
                                <Skeleton variant="text" className="w-20 h-3" animation="wave" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NewsDetailSkeleton;
