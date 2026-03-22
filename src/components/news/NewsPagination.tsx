"use client";

import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface NewsPaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    locale?: "vi" | "en";
    onPageChange?: (page: number) => void;
}

export function NewsPagination({ currentPage, totalPages, basePath, locale = "vi", onPageChange }: NewsPaginationProps) {
    if (totalPages <= 1) return null;

    const isEn = locale === "en";
    const prevLabel = isEn ? "Previous" : "Trước";
    const nextLabel = isEn ? "Next" : "Sau";
    const pageLabel = isEn ? "Page" : "Trang";

    const getPageUrl = (page: number) => {
        return page === 1 ? basePath : `${basePath}?page=${page}`;
    };

    const handlePageClick = (page: number, e: React.MouseEvent) => {
        if (onPageChange) {
            e.preventDefault();
            onPageChange(page);
            // Scroll to top of content
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        const showAround = 2; // Show 2 pages around current

        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // First page
                i === totalPages || // Last page
                (i >= currentPage - showAround && i <= currentPage + showAround) // Around current
            ) {
                pages.push(i);
            } else if (
                (i === currentPage - showAround - 1 && i > 1) ||
                (i === currentPage + showAround + 1 && i < totalPages)
            ) {
                pages.push("...");
            }
        }

        // Remove duplicate "..."
        return pages.filter((p, i, arr) => p !== "..." || arr[i - 1] !== "...");
    };

    const linkClass = "inline-flex items-center gap-1 rounded-full border border-[rgba(26,72,164,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[rgba(23,88,216,0.08)]";
    const disabledClass = "inline-flex items-center gap-1 rounded-full border border-[rgba(26,72,164,0.12)] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[var(--ink-muted)]";

    return (
        <nav className="mt-12 flex items-center justify-center gap-2 rounded-[2rem] border border-[rgba(26,72,164,0.08)] bg-[rgba(255,255,255,0.72)] p-3" aria-label="Pagination">
            {/* Previous */}
            {currentPage > 1 ? (
                <Link
                    href={getPageUrl(currentPage - 1)}
                    onClick={(e) => handlePageClick(currentPage - 1, e)}
                    className={linkClass}
                >
                    <CaretLeft size={16} weight="bold" />
                    {prevLabel}
                </Link>
            ) : (
                <span className={disabledClass}>
                    <CaretLeft size={16} weight="bold" />
                    {prevLabel}
                </span>
            )}

            {/* Page Numbers */}
            <div className="hidden md:flex items-center gap-1">
                {getPageNumbers().map((page, idx) => (
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-[var(--ink-muted)]">...</span>
                    ) : (
                        <Link
                            key={page}
                            href={getPageUrl(page)}
                            onClick={(e) => handlePageClick(page as number, e)}
                            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors ${page === currentPage
                                ? "pointer-events-none border-[var(--accent)] bg-[var(--accent)] text-white"
                                : "border-[rgba(26,72,164,0.12)] bg-white text-[var(--ink)] hover:bg-[rgba(23,88,216,0.08)]"
                                }`}
                        >
                            {page}
                        </Link>
                    )
                ))}
            </div>

            {/* Mobile: Current page indicator */}
            <span className="px-4 py-2 text-sm text-[var(--ink)] md:hidden">
                {pageLabel} {currentPage} / {totalPages}
            </span>

            {/* Next */}
            {currentPage < totalPages ? (
                <Link
                    href={getPageUrl(currentPage + 1)}
                    onClick={(e) => handlePageClick(currentPage + 1, e)}
                    className={linkClass}
                >
                    {nextLabel}
                    <CaretRight size={16} weight="bold" />
                </Link>
            ) : (
                <span className={disabledClass}>
                    {nextLabel}
                    <CaretRight size={16} weight="bold" />
                </span>
            )}
        </nav>
    );
}

export default NewsPagination;
