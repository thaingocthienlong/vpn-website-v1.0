"use client";

import { Skeleton } from "@/components/ui/Skeleton";

interface StaffCardSkeletonProps {
    count?: number;
    columns?: 2 | 3 | 4;
}

/**
 * Staff / advisory board card skeleton:
 * - Circle avatar
 * - Name
 * - Title/position
 */
export function StaffCardSkeleton({ count = 8, columns = 4 }: StaffCardSkeletonProps) {
    const colClass = columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : columns === 3
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

    return (
        <div className={`grid ${colClass} gap-6`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col items-center p-6 rounded-2xl bg-white/70  border border-slate-100 space-y-3">
                    <Skeleton variant="circular" width={96} height={96} animation="wave" />
                    <Skeleton variant="text" className="w-32 h-5" animation="wave" />
                    <Skeleton variant="text" className="w-24 h-4" animation="wave" />
                    <Skeleton variant="text" className="w-40 h-3" animation="wave" />
                </div>
            ))}
        </div>
    );
}

export default StaffCardSkeleton;
