"use client";

import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { BentoGrid } from "@/components/lightswind/bento-grid";
import Image from "next/image";

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

const bentoPatterns = [
    "lg:col-span-2 lg:row-span-2", // 1
    "lg:col-span-1 lg:row-span-1", // 2
    "lg:col-span-1 lg:row-span-1", // 3
    "lg:col-span-2 lg:row-span-1", // 4
    "lg:col-span-1 lg:row-span-1", // 5
    "lg:col-span-2 lg:row-span-1", // 6
    "lg:col-span-1 lg:row-span-2", // 7
    "lg:col-span-3 lg:row-span-1", // 8
];

export function GallerySection({
    images,
    title,
    subtitle,
}: GallerySectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const resolvedImages = images || (isEn ? enImages : viImages);
    const resolvedTitle = title || (isEn ? "Photo Gallery" : "Thư Viện Ảnh");
    const resolvedSubtitle = subtitle || (isEn
        ? "Memorable moments from our training activities"
        : "Những khoảnh khắc đáng nhớ trong các hoạt động đào tạo");

    const openLightbox = (index: number) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const nextImage = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % resolvedImages.length);
        }
    };
    const prevImage = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + resolvedImages.length) % resolvedImages.length);
        }
    };

    const bentoCards = resolvedImages.map((image, index) => ({
        title: image.alt,
        description: isEn ? "Click to view" : "Nhấn để xem",
        icon: ImageIcon,
        className: `cursor-pointer ${bentoPatterns[index % bentoPatterns.length]}`,
        href: "#",
        background: (
            <div
                className="absolute inset-0 w-full h-full cursor-pointer hover:scale-105 transition-transform duration-500 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                onClick={(e) => {
                    e.preventDefault();
                    openLightbox(index);
                }}
            >
                <span className="text-slate-500 text-lg font-medium">{image.alt}</span>
            </div>
        ),
    }));

    return (
        <SectionWrapper>
            <ScrollReveal>
                <SectionHeader
                    title={resolvedTitle}
                    subtitle={resolvedSubtitle}
                    centered
                />
            </ScrollReveal>

            {/* Gallery Bento Grid */}
            <ScrollReveal delay={1}>
                {/* 
                    Wrap with pointer-events-auto inside background to allow click to pass to lightbox 
                    The BentoGrid uses "group" for hover effects
                */}
                <div onClick={(e) => {
                    // Prevent default link behavior if clicking inside grid
                    e.preventDefault();
                }}>
                    <BentoGrid
                        cards={bentoCards}
                        columns={4}
                        className="auto-rows-[250px]"
                    />
                </div>
            </ScrollReveal>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-default"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute top-4 right-4 p-2 text-white hover:text-white/80 transition-colors"
                        onClick={closeLightbox}
                        aria-label="Close"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        className="absolute left-4 p-2 text-white hover:text-white/80 transition-colors"
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        aria-label="Previous"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <div className="relative w-full max-w-5xl h-[80vh] p-4 flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <div className="relative w-full h-full bg-black">
                            <Image
                                src={resolvedImages[lightboxIndex].url}
                                alt={resolvedImages[lightboxIndex].alt}
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="absolute bottom-6 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                            <span className="text-white text-sm font-medium">{resolvedImages[lightboxIndex].alt}</span>
                        </div>
                    </div>

                    <button
                        className="absolute right-4 p-2 text-white hover:text-white/80 transition-colors"
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        aria-label="Next"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </div>
            )}
        </SectionWrapper>
    );
}

export default GallerySection;
