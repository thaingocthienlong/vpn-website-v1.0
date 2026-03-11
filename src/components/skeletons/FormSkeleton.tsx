"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton placeholder for admin detail/edit pages (2-column form layout).
 * Mimics the common pattern: header bar + left content area + right sidebar.
 */
export const FormSkeleton = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header bar: back button + title + action buttons */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton variant="circular" className="w-10 h-10" />
                    <div className="space-y-2">
                        <Skeleton variant="text" className="h-6 w-48 rounded-md" />
                        <Skeleton variant="text" className="h-3 w-32 rounded-md" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <Skeleton variant="rectangular" className="h-10 w-28 rounded-lg" />
                    <Skeleton variant="rectangular" className="h-10 w-28 rounded-lg" />
                </div>
            </div>

            {/* Main content: 2/3 left + 1/3 right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - form fields */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Card 1: Basic info */}
                    <div className="bg-white/70  p-6 rounded-xl border border-slate-100 space-y-4">
                        <Skeleton variant="text" className="h-5 w-36 rounded-md" />
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton variant="text" className="h-4 w-20 rounded-md" />
                                <Skeleton variant="rectangular" className="h-10 w-full rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton variant="text" className="h-4 w-24 rounded-md" />
                                <Skeleton variant="rectangular" className="h-10 w-full rounded-lg" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton variant="text" className="h-4 w-28 rounded-md" />
                                <Skeleton variant="rectangular" className="h-20 w-full rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Rich text editor */}
                    <div className="bg-white/70  p-6 rounded-xl border border-slate-100 space-y-4">
                        <Skeleton variant="text" className="h-5 w-32 rounded-md" />
                        <Skeleton variant="rectangular" className="h-48 w-full rounded-lg" />
                    </div>
                </div>

                {/* Right column - sidebar */}
                <div className="space-y-6">
                    <div className="bg-white/70  p-6 rounded-xl border border-slate-100 space-y-4">
                        <Skeleton variant="text" className="h-5 w-24 rounded-md" />
                        <div className="space-y-3">
                            <Skeleton variant="rectangular" className="h-10 w-full rounded-lg" />
                            <Skeleton variant="rectangular" className="h-5 w-28 rounded-md" />
                            <Skeleton variant="rectangular" className="h-5 w-24 rounded-md" />
                        </div>
                    </div>

                    <div className="bg-white/70  p-6 rounded-xl border border-slate-100 space-y-4">
                        <Skeleton variant="text" className="h-5 w-28 rounded-md" />
                        <Skeleton variant="rectangular" className="h-40 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
};
