"use client";

import Image from "next/image";
import { useState } from "react";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

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

const viImages: GalleryImage[] = [
    { id: "1", url: "/images/gallery-1.jpg", alt: "Lớp học" },
    { id: "2", url: "/images/gallery-2.jpg", alt: "Sự kiện" },
    { id: "3", url: "/images/gallery-3.jpg", alt: "Tốt nghiệp" },
    { id: "4", url: "/images/gallery-4.jpg", alt: "Hoạt động" },
    { id: "5", url: "/images/gallery-5.jpg", alt: "Hội thảo" },
    { id: "6", url: "/images/gallery-6.jpg", alt: "Đào tạo" },
    { id: "7", url: "/images/gallery-7.jpg", alt: "Thực hành" },
    { id: "8", url: "/images/gallery-8.jpg", alt: "Kỷ niệm" },
];

const enImages: GalleryImage[] = [
    { id: "1", url: "/images/gallery-1.jpg", alt: "Classroom" },
    { id: "2", url: "/images/gallery-2.jpg", alt: "Event" },
    { id: "3", url: "/images/gallery-3.jpg", alt: "Graduation" },
    { id: "4", url: "/images/gallery-4.jpg", alt: "Activity" },
    { id: "5", url: "/images/gallery-5.jpg", alt: "Seminar" },
    { id: "6", url: "/images/gallery-6.jpg", alt: "Training" },
    { id: "7", url: "/images/gallery-7.jpg", alt: "Practice" },
    { id: "8", url: "/images/gallery-8.jpg", alt: "Celebration" },
];

const galleryThemes = [
    ["#133b7a", "#e6f0ff", "#a9c8ff"],
    ["#234d97", "#eef5ff", "#c7dcff"],
    ["#0f315f", "#e8f2ff", "#93b6ff"],
    ["#1f4e91", "#eff5ff", "#cfe0ff"],
    ["#173f7c", "#edf4ff", "#b4cdff"],
    ["#3059aa", "#f4f8ff", "#d8e5ff"],
    ["#0f3a75", "#e9f3ff", "#a6c3ff"],
    ["#1d477f", "#eef5ff", "#c4d9ff"],
] as const;

function createGalleryFallback(_label: string, index: number) {
    const [ink, paper, accent] = galleryThemes[index % galleryThemes.length];
    const encoded = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
            <defs>
                <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stop-color="${paper}" />
                    <stop offset="100%" stop-color="${accent}" />
                </linearGradient>
                <radialGradient id="orbA" cx="18%" cy="22%" r="58%">
                    <stop offset="0%" stop-color="rgba(255,255,255,0.78)" />
                    <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                </linearGradient>
                <radialGradient id="orbB" cx="82%" cy="78%" r="52%">
                    <stop offset="0%" stop-color="rgba(16,44,92,0.18)" />
                    <stop offset="100%" stop-color="rgba(16,44,92,0)" />
                </radialGradient>
            </defs>
            <rect width="1200" height="900" fill="url(#bg)" rx="56" />
            <rect width="1200" height="900" fill="url(#orbA)" />
            <rect width="1200" height="900" fill="url(#orbB)" />
            <circle cx="962" cy="154" r="166" fill="rgba(255,255,255,0.16)" />
            <circle cx="280" cy="692" r="248" fill="rgba(255,255,255,0.12)" />
            <path d="M-120 756C70 636 248 560 420 560c175 0 348 82 560 82 120 0 250-32 340-88v346H-120Z" fill="rgba(12,38,80,0.18)" />
            <path d="M-80 230C168 132 336 124 514 182c176 58 330 168 532 170 74 1 165-14 262-56v-296H-80Z" fill="rgba(255,255,255,0.18)" />
            <path d="M124 136h268" stroke="${ink}" stroke-opacity="0.16" stroke-width="20" stroke-linecap="round" />
            <path d="M124 774h368" stroke="rgba(255,255,255,0.36)" stroke-width="18" stroke-linecap="round" />
            <path d="M124 814h252" stroke="rgba(255,255,255,0.28)" stroke-width="18" stroke-linecap="round" />
        </svg>`
    );

    return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}

function normalizeGalleryImages(images: GalleryImage[]) {
    return images.map((image, index) => ({
        ...image,
        url:
            !image.url || image.url.startsWith("/images/gallery-")
                ? createGalleryFallback(image.alt, index)
                : image.url,
    }));
}

export function GallerySection({
    images,
    title,
    subtitle,
}: GallerySectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const shouldReduceMotion = useReducedMotion();

    const resolvedImages = normalizeGalleryImages(images || (isEn ? enImages : viImages));
    const resolvedTitle = title || (isEn ? "Photo Gallery" : "Thư Viện Ảnh");
    const resolvedSubtitle = subtitle || (
        isEn
            ? "Memorable moments from our training activities"
            : "Những khoảnh khắc đáng nhớ trong các hoạt động đào tạo"
    );

    const closeLightbox = () => setLightboxIndex(null);
    const goNext = () => {
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex + 1) % resolvedImages.length);
    };
    const goPrev = () => {
        if (lightboxIndex === null) return;
        setLightboxIndex((lightboxIndex - 1 + resolvedImages.length) % resolvedImages.length);
    };

    return (
        <SectionWrapper>
            <MotionSection>
                <SectionHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
            </MotionSection>

            <div className="public-panel public-band relative overflow-hidden rounded-[2.6rem] p-4 md:p-5">
                <FloatingAccent className="left-[7%] top-[8%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.12),transparent_70%)]" variant="halo" />
                <FloatingAccent className="right-[8%] bottom-[10%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(94,146,236,0.12),transparent_74%)]" variant="orb" />

                <MotionGroup className="relative grid gap-4 xl:grid-cols-[1.06fr_0.94fr]" stagger={0.08}>
                    <MotionItem>
                        <motion.button
                            type="button"
                            onClick={() => setLightboxIndex(0)}
                            whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.01 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                            transition={publicMotionTokens.hoverSpring}
                            className="group relative min-h-[440px] overflow-hidden rounded-[2rem] text-left"
                        >
                            <motion.div
                                className="absolute inset-0"
                                whileHover={shouldReduceMotion ? undefined : { scale: 1.05, x: 8, y: -6 }}
                                transition={publicMotionTokens.hoverSpring}
                            >
                                <Image
                                    src={resolvedImages[0].url}
                                    alt={resolvedImages[0].alt}
                                    fill
                                    unoptimized={resolvedImages[0].url.startsWith("data:")}
                                    sizes="(max-width: 1280px) 100vw, 58vw"
                                    className="object-cover"
                                />
                            </motion.div>
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,23,47,0.06),rgba(8,23,47,0.66))]" />
                            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                                <motion.div
                                    className="inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs tracking-[0.18em] text-white/82 backdrop-blur-sm"
                                    animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                    transition={shouldReduceMotion ? undefined : { duration: 4.8, ease: "easeInOut", repeat: Infinity }}
                                >
                                    {resolvedImages[0].alt}
                                </motion.div>
                            </div>
                        </motion.button>
                    </MotionItem>

                    <MotionGroup className="grid gap-4" stagger={0.08}>
                        <MotionItem>
                            <motion.button
                                type="button"
                                onClick={() => setLightboxIndex(1)}
                                whileHover={shouldReduceMotion ? undefined : { y: -7, scale: 1.01 }}
                                whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                                transition={publicMotionTokens.hoverSpring}
                                className="group relative min-h-[232px] overflow-hidden rounded-[1.9rem] text-left"
                            >
                                <motion.div
                                    className="absolute inset-0"
                                    whileHover={shouldReduceMotion ? undefined : { scale: 1.05, x: -6, y: -4 }}
                                    transition={publicMotionTokens.hoverSpring}
                                >
                                    <Image
                                        src={resolvedImages[1].url}
                                        alt={resolvedImages[1].alt}
                                        fill
                                        unoptimized={resolvedImages[1].url.startsWith("data:")}
                                        sizes="(max-width: 1280px) 100vw, 38vw"
                                        className="object-cover"
                                    />
                                </motion.div>
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,23,47,0.04),rgba(8,23,47,0.58))]" />
                                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                                    <div className="inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs tracking-[0.18em] text-white/82 backdrop-blur-sm">
                                        {resolvedImages[1].alt}
                                    </div>
                                </div>
                            </motion.button>
                        </MotionItem>

                        <MotionGroup className="grid gap-4 md:grid-cols-2" stagger={0.08}>
                            {resolvedImages.slice(2, 4).map((image, index) => (
                                <MotionItem key={image.id}>
                                    <motion.button
                                        type="button"
                                        onClick={() => setLightboxIndex(index + 2)}
                                        whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
                                        whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        className="group relative min-h-[182px] overflow-hidden rounded-[1.75rem] text-left"
                                    >
                                        <motion.div
                                            className="absolute inset-0"
                                            whileHover={shouldReduceMotion ? undefined : { scale: 1.06, y: -6 }}
                                            transition={publicMotionTokens.hoverSpring}
                                        >
                                            <Image
                                                src={image.url}
                                                alt={image.alt}
                                                fill
                                                unoptimized={image.url.startsWith("data:")}
                                                sizes="(max-width: 768px) 100vw, 24vw"
                                                className="object-cover"
                                            />
                                        </motion.div>
                                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,23,47,0.04),rgba(8,23,47,0.58))]" />
                                        <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                                            <div className="inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs tracking-[0.18em] text-white/82 backdrop-blur-sm">
                                                {image.alt}
                                            </div>
                                        </div>
                                    </motion.button>
                                </MotionItem>
                            ))}
                        </MotionGroup>
                    </MotionGroup>
                </MotionGroup>

                <MotionGroup className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
                    {resolvedImages.slice(4).map((image, index) => (
                        <MotionItem key={image.id}>
                            <motion.button
                                type="button"
                                onClick={() => setLightboxIndex(index + 4)}
                                whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
                                whileTap={shouldReduceMotion ? undefined : { scale: 0.995 }}
                                transition={publicMotionTokens.hoverSpring}
                                className="group relative min-h-[198px] overflow-hidden rounded-[1.8rem] text-left"
                            >
                                <motion.div
                                    className="absolute inset-0"
                                    whileHover={shouldReduceMotion ? undefined : { scale: 1.06, x: 6, y: -4 }}
                                    transition={publicMotionTokens.hoverSpring}
                                >
                                    <Image
                                        src={image.url}
                                        alt={image.alt}
                                        fill
                                        unoptimized={image.url.startsWith("data:")}
                                        sizes="(max-width: 768px) 100vw, 25vw"
                                        className="object-cover"
                                    />
                                </motion.div>
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,23,47,0.04),rgba(8,23,47,0.58))]" />
                                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                                    <div className="inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-xs tracking-[0.18em] text-white/82 backdrop-blur-sm">
                                        {image.alt}
                                    </div>
                                </div>
                            </motion.button>
                        </MotionItem>
                    ))}
                </MotionGroup>
            </div>

            <AnimatePresence>
                {lightboxIndex !== null ? (
                    <motion.div
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,23,47,0.88)] px-4 py-8 backdrop-blur-md"
                        onClick={closeLightbox}
                        initial={shouldReduceMotion ? false : { opacity: 0 }}
                        animate={shouldReduceMotion ? undefined : { opacity: 1 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                    >
                        <motion.div
                            className="public-panel-contrast relative flex w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] p-3 text-white md:p-4"
                            onClick={(event) => event.stopPropagation()}
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.985 }}
                            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.99 }}
                            transition={publicMotionTokens.sectionSpring}
                        >
                            <button
                                type="button"
                                onClick={closeLightbox}
                                className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white transition-colors hover:bg-white/14"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" weight="bold" />
                            </button>

                            <div className="relative min-h-[72vh] overflow-hidden rounded-[1.6rem]">
                                <Image
                                    src={resolvedImages[lightboxIndex].url}
                                    alt={resolvedImages[lightboxIndex].alt}
                                    fill
                                    unoptimized={resolvedImages[lightboxIndex].url.startsWith("data:")}
                                    sizes="100vw"
                                    className="object-contain"
                                />
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-4 px-2 pb-1">
                                <p className="text-sm leading-7 text-white/78">
                                    {resolvedImages[lightboxIndex].alt}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={goPrev}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white transition-colors hover:bg-white/14"
                                        aria-label="Previous"
                                    >
                                        <CaretLeft className="h-5 w-5" weight="bold" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={goNext}
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white transition-colors hover:bg-white/14"
                                        aria-label="Next"
                                    >
                                        <CaretRight className="h-5 w-5" weight="bold" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </SectionWrapper>
    );
}

export default GallerySection;
