"use client";

import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Admin dashboard skeleton:
 * - 4 stat cards
 * - Chart area
 * - Recent items list
 */
export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-6 rounded-xl bg-white/70  border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                            <Skeleton variant="text" className="w-24 h-4" animation="wave" />
                            <Skeleton variant="circular" width={40} height={40} animation="wave" />
                        </div>
                        <Skeleton variant="text" className="w-20 h-8" animation="wave" />
                        <Skeleton variant="text" className="w-32 h-3" animation="wave" />
                    </div>
                ))}
            </div>

            {/* Chart / activity area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-xl bg-white/70  border border-slate-100">
                    <Skeleton variant="text" className="w-40 h-6 mb-4" animation="wave" />
                    <Skeleton variant="rectangular" className="w-full rounded-lg" height={250} animation="wave" />
                </div>
                <div className="p-6 rounded-xl bg-white/70  border border-slate-100">
                    <Skeleton variant="text" className="w-32 h-6 mb-4" animation="wave" />
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton variant="circular" width={32} height={32} animation="wave" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton variant="text" className="w-full h-4" animation="wave" />
                                    <Skeleton variant="text" className="w-20 h-3" animation="wave" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardSkeleton;
