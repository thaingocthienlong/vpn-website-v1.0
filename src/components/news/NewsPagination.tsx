"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

    const linkClass = "flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-800 bg-white rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-slate-800 transition-colors";
    const disabledClass = "flex items-center gap-1 px-4 py-2 text-sm font-medium text-slate-500 bg-white rounded-lg border border-slate-200 cursor-not-allowed";

    return (
        <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
            {/* Previous */}
            {currentPage > 1 ? (
                <Link
                    href={getPageUrl(currentPage - 1)}
                    onClick={(e) => handlePageClick(currentPage - 1, e)}
                    className={linkClass}
                >
                    <ChevronLeft size={16} />
                    {prevLabel}
                </Link>
            ) : (
                <span className={disabledClass}>
                    <ChevronLeft size={16} />
                    {prevLabel}
                </span>
            )}

            {/* Page Numbers */}
            <div className="hidden md:flex items-center gap-1">
                {getPageNumbers().map((page, idx) => (
                    page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-slate-500">...</span>
                    ) : (
                        <Link
                            key={page}
                            href={getPageUrl(page)}
                            onClick={(e) => handlePageClick(page as number, e)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${page === currentPage
                                ? "bg-blue-600 text-slate-800 border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)] pointer-events-none"
                                : "text-slate-800 bg-white border-slate-200 hover:bg-slate-100 hover:text-slate-800"
                                }`}
                        >
                            {page}
                        </Link>
                    )
                ))}
            </div>

            {/* Mobile: Current page indicator */}
            <span className="md:hidden px-4 py-2 text-sm text-slate-800">
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
                    <ChevronRight size={16} />
                </Link>
            ) : (
                <span className={disabledClass}>
                    {nextLabel}
                    <ChevronRight size={16} />
                </span>
            )}
        </nav>
    );
}

export default NewsPagination;
