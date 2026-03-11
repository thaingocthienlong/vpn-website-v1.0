"use client";

import { Skeleton } from "@/components/ui/Skeleton";

interface TableSkeletonProps {
    /** Number of data rows */
    rows?: number;
    /** Number of columns */
    columns?: number;
}

/**
 * Admin table skeleton: header row + data rows
 */
export function TableSkeleton({ rows = 8, columns = 5 }: TableSkeletonProps) {
    return (
        <div className="bg-white/70  rounded-xl border border-slate-100 overflow-hidden">
            {/* Table header */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white/70  border-b border-slate-100">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton
                        key={`h-${i}`}
                        variant="text"
                        className={`h-4 ${i === 0 ? "w-8" : i === 1 ? "flex-1" : "w-24"}`}
                        animation="wave"
                    />
                ))}
            </div>

            {/* Table rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={rowIdx}
                    className="flex items-center gap-4 px-6 py-4 border-b border-white/5 last:border-b-0"
                >
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton
                            key={`r${rowIdx}-c${colIdx}`}
                            variant="text"
                            className={`h-4 ${colIdx === 0 ? "w-8" : colIdx === 1 ? "flex-1" : "w-24"}`}
                            animation="wave"
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default TableSkeleton;
