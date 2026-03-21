"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { BentoGrid } from "../lightswind/bento-grid";
import { BorderBeam } from "../lightswind/border-beam";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

import { SectionWrapper, type SectionWrapperProps } from "./SectionWrapper";

interface Course {
    id: string;
    title: string;
    title_en?: string;
    slug: string;
    excerpt?: string | null;
    excerpt_en?: string | null;
    featuredImage?: string | null;
}

interface HeroSectionProps {
    title?: string;
    subtitle?: string;
    videoUrl?: string;
    ctaPrimary?: {
        text: string;
        href: string;
    };
    ctaSecondary?: {
        text: string;
        href: string;
    };
    featuredPrograms?: Course[];
    background?: SectionWrapperProps["background"];
    textColor?: SectionWrapperProps["textColor"];
    backdropBlur?: SectionWrapperProps["backdropBlur"];
}

export function HeroSection({
    title,
    subtitle,
    videoUrl,
    ctaPrimary,
    ctaSecondary,
    featuredPrograms = [],
    background,
    textColor,
    backdropBlur,
}: HeroSectionProps) {
    // ... existing constants ...
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const ctaMain = ctaPrimary || (isEn ? { text: "Our Services", href: "/en/services" } : { text: "Khám phá dịch vụ", href: "/dich-vu" });
    const ctaContact = ctaSecondary || (isEn ? { text: "Contact Us", href: "/en/contact" } : { text: "Liên hệ tư vấn", href: "/lien-he" });

    const displayedVideoUrl = videoUrl || "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4";

    const isYoutube = displayedVideoUrl.includes('youtube.com') || displayedVideoUrl.includes('youtu.be');
    let youtubeId = '';
    if (isYoutube) {
        try {
            const urlString = displayedVideoUrl.startsWith('http') ? displayedVideoUrl : `https://${displayedVideoUrl}`;
            const url = new URL(urlString);
            if (urlString.includes('youtu.be')) {
                youtubeId = url.pathname.slice(1);
            } else if (url.pathname.includes('/embed/')) {
                youtubeId = url.pathname.split('/embed/')[1];
            } else {
                youtubeId = url.searchParams.get('v') || '';
            }
        } catch (e) {
            // silent fallback
        }
    }

    // Fallback to placeholders if no featured programs are provided
    const displayPrograms = featuredPrograms.length > 0 ? featuredPrograms.slice(0, 2).map(p => ({
        title: (isEn && p.title_en) ? p.title_en : p.title,
        desc: (isEn && p.excerpt_en) ? p.excerpt_en : (p.excerpt || ""),
        slug: `/${isEn ? 'en' : ''}/training/${p.slug}`,
        image: p.featuredImage || "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop"
    })) : [
        {
            title: isEn ? "Master of Science in Information Technology" : "Thạc sĩ Khoa học Công nghệ Thông tin",
            desc: isEn ? "Advanced degree program for IT professionals." : "Chương trình đào tạo thạc sĩ chuyên sâu dành cho chuyên gia IT.",
            slug: "#",
            image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1000&auto=format&fit=crop"
        },
        {
            title: isEn ? "Bidding Profession Certificate" : "Chứng chỉ Nghiệp vụ Đấu thầu",
            desc: isEn ? "Short-term certification for procurement and bidding." : "Chứng chỉ nghiệp vụ ngắn hạn về đấu thầu và mua sắm.",
            slug: "#",
            image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop"
        }
    ];

    const heroCards: any[] = [
        // 1. The Video Anchor (2x2)
        {
            title: "",
            description: "",
            icon: Play,
            className: "md:col-span-2 md:row-span-2 shadow-xl border-sky-100/20 p-0 overflow-hidden aspect-video md:aspect-auto",
            href: displayedVideoUrl,
            background: (
                <div className="absolute inset-0 bg-slate-900 group">
                    {isYoutube && youtubeId ? (
                        <div className="absolute inset-0 w-full h-full overflow-hidden transition-opacity duration-500 group-hover:opacity-90 bg-black">
                            <iframe
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1`}
                                allow="autoplay; encrypted-media"
                                title="Hero Video"
                            />
                        </div>
                    ) : (
                        <video
                            key={displayedVideoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-500 group-hover:opacity-90"
                        >
                            <source src={displayedVideoUrl} type="video/mp4" />
                        </video>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-0 group-hover:opacity-100 group-hover:bg-black/20 transition-all duration-500">
                        <div className="flex flex-col items-center gap-3 text-white transition-transform duration-500 scale-95 group-hover:scale-110">
                            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/40 shadow-2xl transition-all duration-300 group-hover:bg-white/30">
                                <Play className="w-10 h-10 ml-1 text-white opacity-100 drop-shadow-lg" />
                            </div>
                            <span className="font-semibold text-lg tracking-wide uppercase drop-shadow-lg">
                                {isEn ? "Watch Demo" : "Xem Video"}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    if (displayPrograms[0]) {
        heroCards.push({
            title: displayPrograms[0].title,
            description: displayPrograms[0].desc,
            icon: GraduationCap,
            className: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-pointer group hover:border-blue-500/50 transition-colors duration-300 aspect-[20/9] md:aspect-auto",
            href: displayPrograms[0].slug,
            background: (
                <div className="absolute inset-0 z-0 bg-slate-900">
                    <img
                        src={displayPrograms[0].image}
                        alt={displayPrograms[0].title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-80 dark:group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
            ),
            content: (
                <div className="flex flex-col justify-between h-full relative z-10 text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex justify-between items-start">
                        <div className="p-2 rounded-xl bg-blue-500/30 backdrop-blur-md text-blue-100 border border-blue-400/30">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2 drop-shadow-md text-white">{displayPrograms[0].title}</h3>
                        <p className="text-sm text-white/80 line-clamp-2 drop-shadow">
                            {displayPrograms[0].desc}
                        </p>
                    </div>
                </div>
            )
        });
    }

    if (displayPrograms[1]) {
        heroCards.push({
            title: displayPrograms[1].title,
            description: displayPrograms[1].desc,
            icon: BookOpen,
            className: "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 cursor-pointer group hover:border-emerald-500/50 transition-colors duration-300 aspect-[20/9] md:aspect-auto",
            href: displayPrograms[1].slug,
            background: (
                <div className="absolute inset-0 z-0 bg-slate-900">
                    <img
                        src={displayPrograms[1].image}
                        alt={displayPrograms[1].title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-80 dark:group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
                </div>
            ),
            content: (
                <div className="flex flex-col justify-between h-full relative z-10 text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <div className="flex justify-between items-start">
                        <div className="p-2 rounded-xl bg-emerald-500/30 backdrop-blur-md text-emerald-100 border border-emerald-400/30">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                            <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2 drop-shadow-md text-white">{displayPrograms[1].title}</h3>
                        <p className="text-sm text-white/80 line-clamp-2 drop-shadow">
                            {displayPrograms[1].desc}
                        </p>
                    </div>
                </div>
            )
        });
    }

    // const titleColorClass = background === 'gradient-dark' || background === 'sky-950' ? 'text-white' : 'text-slate-900 dark:text-white';
    // const subtitleColorClass = background === 'gradient-dark' || background === 'sky-950' ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400';

    return (
        <SectionWrapper background={background || "transparent"} textColor={textColor} backdropBlur={backdropBlur} padding="sm">
            {/* {title && (
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'inherit' }}>{title}</h1>
                    {subtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: textColor ? 'inherit' : 'var(--tw-prose-body, inherit)' }}>{subtitle}</p>}
                </div>
            )} */}
            <ScrollReveal delay={0.2} repeat={true}>
                <BentoGrid
                    columns={3}
                    className="md:auto-rows-fr"
                    cards={heroCards}
                />
            </ScrollReveal>
        </SectionWrapper>
    );
}

export default HeroSection;
