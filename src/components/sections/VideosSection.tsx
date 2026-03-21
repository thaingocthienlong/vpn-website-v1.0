"use client";

import { SectionWrapper, type SectionWrapperProps } from "./SectionWrapper";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { motion, AnimatePresence } from "framer-motion";


interface Video {
    id: string;
    title: string;
    thumbnailUrl?: string | null;
    videoUrl: string;
}

interface VideosSectionProps {
    videos?: Video[];
    title?: string;
    subtitle?: string;
    background?: SectionWrapperProps["background"];
    textColor?: SectionWrapperProps["textColor"];
    backdropBlur?: SectionWrapperProps["backdropBlur"];
}

// Compute slide position styles based on offset from center
function getSlideStyle(offset: number) {
    // Main slide
    if (offset === 0) {
        return {
            x: "0%",
            scale: 1,
            opacity: 1,
            zIndex: 30,
        };
    }

    // Side ±1
    if (Math.abs(offset) === 1) {
        return {
            x: `${offset * 65}%`,
            scale: 0.78,
            opacity: 0.5,
            zIndex: 20,
        };
    }

    // Side ±2
    if (Math.abs(offset) === 2) {
        return {
            x: `${offset * 55}%`,
            scale: 0.6,
            opacity: 0.2,
            zIndex: 10,
        };
    }

    // Hidden (±3+)
    return {
        x: `${offset > 0 ? 80 : -80}%`,
        scale: 0.5,
        opacity: 0,
        zIndex: 0,
    };
}

export function VideosSection({
    videos,
    title,
    subtitle,
    background,
    textColor,
    backdropBlur,
}: VideosSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedVideos = videos || [];
    const resolvedTitle = title || (isEn ? "Introduction Videos" : "Video Giới Thiệu");
    const resolvedSubtitle = subtitle || (isEn
        ? "Learn more about us through our introduction videos"
        : "Tìm hiểu thêm về chúng tôi qua các video giới thiệu");

    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const total = resolvedVideos.length;

    const goNext = useCallback(() => {
        setActiveIndex((prev) => (prev + 1) % total);
    }, [total]);

    const goPrev = useCallback(() => {
        setActiveIndex((prev) => (prev - 1 + total) % total);
    }, [total]);

    const selectSlide = useCallback((index: number) => {
        if (index === activeIndex) return;
        setActiveIndex(index);
    }, [activeIndex]);

    const handlePlayMain = useCallback((index: number) => {
        setLightboxIndex(index);
    }, []);

    const closeLightbox = () => setLightboxIndex(null);

    // Prevent scrolling when lightbox is open
    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [lightboxIndex]);

    if (resolvedVideos.length === 0) return null;

    return (
        <SectionWrapper background={background || "slate"} textColor={textColor} backdropBlur={backdropBlur}>
            <div className="text-center mb-10">
                <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {resolvedTitle}
                </h2>
                {resolvedSubtitle && (
                    <p className="text-lg max-w-2xl mx-auto leading-relaxed opacity-90">
                        {resolvedSubtitle}
                    </p>
                )}
            </div>

            {/* Carousel container */}
            <div className="relative w-full max-w-4xl mx-auto" style={{ height: "clamp(240px, 45vw, 450px)" }}>

                {/* Left arrow */}
                {total > 1 && (
                    <button
                        onClick={goPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-40 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 backdrop-blur-sm border border-slate-200"
                        aria-label="Previous video"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-700" />
                    </button>
                )}

                {/* Right arrow */}
                {total > 1 && (
                    <button
                        onClick={goNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-40 w-11 h-11 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 backdrop-blur-sm border border-slate-200"
                        aria-label="Next video"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-700" />
                    </button>
                )}

                {/* Slides */}
                <AnimatePresence mode="popLayout">
                    {resolvedVideos.map((video, index) => {
                        // Calculate circular offset
                        let offset = index - activeIndex;
                        if (offset > total / 2) offset -= total;
                        if (offset < -total / 2) offset += total;

                        const isMain = offset === 0;
                        const isVisible = Math.abs(offset) <= 2;
                        const style = getSlideStyle(offset);

                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={video.id}
                                className="absolute inset-0 flex items-center justify-center"
                                animate={{
                                    x: style.x,
                                    scale: style.scale,
                                    opacity: style.opacity,
                                    zIndex: style.zIndex,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    mass: 0.8,
                                }}
                                style={{ zIndex: style.zIndex }}
                            >
                                <div
                                    className={`relative w-full aspect-video rounded-xl overflow-hidden shadow-xl ${isMain ? "cursor-pointer" : "cursor-pointer"
                                        }`}
                                    onClick={() =>
                                        isMain
                                            ? handlePlayMain(index)
                                            : selectSlide(index)
                                    }
                                >
                                    {/* Thumbnail bg */}
                                    <div className="absolute inset-0 bg-linear-to-br from-slate-700 to-slate-900">
                                        {video.thumbnailUrl ? (
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-white/40 text-sm font-medium">{video.title}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Play button — main only */}
                                    {isMain && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                                <Play className="w-7 h-7 text-slate-800 ml-1" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Title overlay */}
                                    <div className="absolute bottom-0 inset-x-0 p-3 bg-linear-to-t from-black/60 to-transparent">
                                        <p className="text-white text-sm font-medium truncate">{video.title}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Full-screen Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
                        onClick={closeLightbox}
                        aria-label="Close lightbox"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div 
                        className="relative w-[95%] max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <iframe
                            src={`${resolvedVideos[lightboxIndex].videoUrl}?autoplay=1`}
                            title={resolvedVideos[lightboxIndex].title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                    
                    <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 text-center pointer-events-none">
                        <h3 className="text-white text-lg font-medium drop-shadow-md">
                            {resolvedVideos[lightboxIndex].title}
                        </h3>
                    </div>
                </div>
            )}
        </SectionWrapper>
    );
}

export default VideosSection;
