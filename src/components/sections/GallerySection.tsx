"use client";

import Image from "next/image";
import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

interface GalleryImage {
    id: string;
    url: string;
    alt: string;
}

interface GallerySectionProps {
    images?: GalleryImage[];
    title?: string;
    subtitle?: string;
}

const galleryThemes = [
    ["#133b7a", "#e6f0ff", "#a9c8ff"],
    ["#234d97", "#eef5ff", "#c7dcff"],
    ["#0f315f", "#e8f2ff", "#93b6ff"],
    ["#1f4e91", "#eff5ff", "#cfe0ff"],
    ["#173f7c", "#edf4ff", "#b4cdff"],
    ["#3059aa", "#f4f8ff", "#d8e5ff"],
] as const;

function createGalleryFallback(index: number) {
    const [ink, paper, accent] = galleryThemes[index % galleryThemes.length];
    const encoded = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
            <defs>
                <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stop-color="${paper}" />
                    <stop offset="100%" stop-color="${accent}" />
                </linearGradient>
            </defs>
            <rect width="1200" height="900" fill="url(#bg)" rx="56" />
            <circle cx="930" cy="140" r="160" fill="rgba(255,255,255,0.16)" />
            <circle cx="320" cy="720" r="220" fill="rgba(255,255,255,0.12)" />
            <path d="M-120 756C70 636 248 560 420 560c175 0 348 82 560 82 120 0 250-32 340-88v346H-120Z" fill="rgba(12,38,80,0.18)" />
            <path d="M124 136h268" stroke="${ink}" stroke-opacity="0.16" stroke-width="20" stroke-linecap="round" />
            <path d="M124 774h368" stroke="rgba(255,255,255,0.36)" stroke-width="18" stroke-linecap="round" />
        </svg>`
    );

    return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

function normalizeGalleryImages(images: GalleryImage[]) {
    return images.map((image, index) => ({
        ...image,
        url:
            !image.url || image.url.startsWith("/images/gallery-")
                ? createGalleryFallback(index)
                : image.url,
    }));
}

export function GallerySection({
    images = [],
    title,
    subtitle,
}: GallerySectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();
    const resolvedImages = normalizeGalleryImages(images);
    const pageSize = 6;
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.max(1, Math.ceil(resolvedImages.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, Math.max(totalPages - 1, 0));
    const safeActiveIndex = Math.min(activeImageIndex, Math.max(resolvedImages.length - 1, 0));
    const activeImage = resolvedImages[safeActiveIndex];
    const pageStart = safeCurrentPage * pageSize;
    const pagedImages = resolvedImages.slice(pageStart, pageStart + pageSize);

    const changePage = (nextPage: number) => {
        const normalizedPage = (nextPage + totalPages) % totalPages;
        const nextStart = normalizedPage * pageSize;
        const nextActiveIndex = Math.min(nextStart, Math.max(resolvedImages.length - 1, 0));

        setCurrentPage(normalizedPage);

        if (safeActiveIndex < nextStart || safeActiveIndex >= nextStart + pageSize) {
            setActiveImageIndex(nextActiveIndex);
        }
    };

    if (!activeImage) {
        return null;
    }

    return (
        <SectionWrapper padding="sm" appearanceTargetId="homepage.section.gallery.surface">
            <MotionSection>
                <SectionHeader
                    badge={isEn ? "Image essay" : "Hình ảnh"}
                    title={title || (isEn ? "A guided image essay, not a modal gallery" : "Một bài hình ảnh có điều hướng, không phải thư viện bật lớp")}
                    subtitle={subtitle || (isEn
                        ? "Use the thumbnail grid to move the main preview without leaving the homepage context."
                        : "Sử dụng lưới ảnh nhỏ để thay đổi hình chính mà không rời khỏi nhịp xem của trang chủ.")}
                    appearanceTargetId="homepage.section.gallery.header"
                />
            </MotionSection>

            <MotionGroup className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.62fr)]" stagger={0.08}>
                <MotionItem className="min-w-0">
                    <motion.div
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="group relative block w-full overflow-hidden rounded-[1.65rem] border border-[rgba(16,40,70,0.12)] text-left"
                    >
                        <div className="relative aspect-[4/3] min-h-[300px] sm:min-h-[360px] lg:min-h-[460px] xl:min-h-[520px]">
                            <Image
                                src={activeImage.url}
                                alt={activeImage.alt}
                                fill
                                unoptimized={activeImage.url.startsWith("data:")}
                                sizes="(max-width: 1280px) 100vw, 64vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,34,53,0.04),rgba(20,34,53,0.12),rgba(20,34,53,0.52))]" />
                        </div>
                        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 py-4 text-white">
                            <p className="max-w-[26rem] text-sm leading-7 text-white/84">
                                {activeImage.alt}
                            </p>
                            <span className="editorial-caption text-white/68">
                                {safeActiveIndex + 1}/{resolvedImages.length}
                            </span>
                        </div>
                    </motion.div>
                </MotionItem>

                <MotionItem className="min-w-0">
                    <motion.aside
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="border-t border-[rgba(16,40,70,0.12)] pt-5"
                    >
                        <div className="space-y-4">
                            {resolvedImages.length > pageSize ? (
                                <div className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-[var(--ink-soft)]">
                                            {isEn
                                            ? `Page ${safeCurrentPage + 1} of ${totalPages}`
                                            : `Trang ${safeCurrentPage + 1} / ${totalPages}`}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                            onClick={() => changePage(safeCurrentPage - 1)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[rgba(16,40,70,0.12)] bg-[rgba(248,251,253,0.62)] text-[var(--ink)] transition-colors hover:bg-[rgba(248,251,253,0.9)]"
                                                aria-label={isEn ? "Previous page" : "Trang trước"}
                                            >
                                            <CaretLeft className="h-4 w-4" weight="bold" />
                                        </button>
                                            <button
                                                type="button"
                                            onClick={() => changePage(safeCurrentPage + 1)}
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[rgba(16,40,70,0.12)] bg-[rgba(248,251,253,0.62)] text-[var(--ink)] transition-colors hover:bg-[rgba(248,251,253,0.9)]"
                                                aria-label={isEn ? "Next page" : "Trang kế"}
                                            >
                                            <CaretRight className="h-4 w-4" weight="bold" />
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            {pagedImages.map((image, index) => {
                                const globalIndex = pageStart + index;
                                const isActive = globalIndex === safeActiveIndex;

                                return (
                                <motion.button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setActiveImageIndex(globalIndex)}
                                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                                    transition={publicMotionTokens.hoverSpring}
                                    className={cn(
                                        "relative aspect-[4/3] min-h-0 overflow-hidden rounded-[1rem] border transition-colors",
                                        isActive
                                            ? "border-[rgba(16,40,70,0.28)] shadow-[0_18px_40px_-32px_rgba(8,20,33,0.35)]"
                                            : "border-[rgba(16,40,70,0.1)]"
                                    )}
                                    aria-pressed={isActive}
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.alt}
                                        fill
                                        unoptimized={image.url.startsWith("data:")}
                                        sizes="(max-width: 768px) 50vw, 24vw"
                                        className={cn(
                                            "object-cover transition-transform duration-300",
                                            isActive ? "scale-[1.02]" : ""
                                        )}
                                    />
                                    <div className={cn(
                                        "absolute inset-0 bg-[linear-gradient(180deg,rgba(20,34,53,0.02),rgba(20,34,53,0.42))]",
                                        isActive ? "ring-1 ring-inset ring-[rgba(248,251,253,0.54)]" : ""
                                    )} />
                                </motion.button>
                                );
                            })}
                        </div>
                    </motion.aside>
                </MotionItem>
            </MotionGroup>
        </SectionWrapper>
    );
}

export default GallerySection;
