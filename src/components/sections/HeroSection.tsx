"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Play, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { BentoGrid } from "../lightswind/bento-grid";
import { BorderBeam } from "../lightswind/border-beam";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

interface Course {
    id: string;
    title: string;
    title_en?: string;
    slug: string;
    excerpt?: string | null;
    excerpt_en?: string | null;
}

interface HeroSectionProps {
    ctaPrimary?: {
        text: string;
        href: string;
    };
    ctaSecondary?: {
        text: string;
        href: string;
    };
    featuredPrograms?: Course[];
}

export function HeroSection({
    ctaPrimary,
    ctaSecondary,
    featuredPrograms = [], // We'll pass courses here from page.tsx!
}: HeroSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const ctaMain = ctaPrimary || (isEn ? { text: "Our Services", href: "/en/services" } : { text: "Khám phá dịch vụ", href: "/dich-vu" });
    const ctaContact = ctaSecondary || (isEn ? { text: "Contact Us", href: "/en/contact" } : { text: "Liên hệ tư vấn", href: "/lien-he" });

    // High-quality placeholder programs for UI testing
    const displayPrograms = [
        {
            title: isEn ? "Master of Science in Information Technology" : "Thạc sĩ Khoa học Công nghệ Thông tin",
            desc: isEn ? "Advanced degree program for IT professionals." : "Chương trình đào tạo thạc sĩ chuyên sâu dành cho chuyên gia IT.",
            slug: "#"
        },
        {
            title: isEn ? "Bidding Profession Certificate" : "Chứng chỉ Nghiệp vụ Đấu thầu",
            desc: isEn ? "Short-term certification for procurement and bidding." : "Chứng chỉ nghiệp vụ ngắn hạn về đấu thầu và mua sắm.",
            slug: "#"
        },
        {
            title: isEn ? "Safety Inspection Training" : "Đào tạo Kiểm định An toàn",
            desc: isEn ? "Professional skills training for safety inspectors." : "Đào tạo kỹ năng chuyên nghiệp cho kiểm định viên an toàn.",
            slug: "#"
        }
    ];

    return (
        <section className="relative w-full pt-8 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
            <BentoGrid
                columns={3}
                className="auto-rows-[16rem]"
                cards={[
                    // 1. The Video Anchor (2x2)
                    {
                        title: "Video",
                        description: "",
                        icon: Play,
                        className: "md:col-span-2 md:row-span-2 shadow-xl border-sky-100/20",
                        background: (
                            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                {/* Placeholder for the raw video element */}
                                <div className="text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
                                    <Play className="w-12 h-12" />
                                    <span className="font-medium">Video Placeholder</span>
                                </div>
                            </div>
                        ),
                        content: null // Removed per user request so the video stands alone
                    },
                    // 2. Program 1
                    {
                        title: displayPrograms[0].title,
                        description: displayPrograms[0].desc,
                        icon: GraduationCap,
                        className: "bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg cursor-pointer",
                        href: displayPrograms[0].slug
                    },
                    // 3. Program 2
                    {
                        title: displayPrograms[1].title,
                        description: displayPrograms[1].desc,
                        icon: BookOpen,
                        className: "bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg cursor-pointer",
                        href: displayPrograms[1].slug
                    },
                    // 4. Program 3
                    {
                        title: displayPrograms[2].title,
                        description: displayPrograms[2].desc,
                        icon: Building2,
                        className: "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:shadow-lg cursor-pointer",
                        href: displayPrograms[2].slug
                    },
                    // 5. The Master CTA
                    {
                        title: "CTA",
                        description: "",
                        icon: ArrowRight,
                        className: "md:col-span-2 bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white border-0 overflow-hidden",
                        content: (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full h-full relative z-10 px-4">
                                <div>
                                    <h3 className="text-2xl font-semibold mb-2">{isEn ? "Ready to begin?" : "Liên hệ tư vấn"}</h3>
                                    <p className="text-white/70">{isEn ? "Join our growing network of professionals." : "Kết nối với mạng lưới chuyên gia của chúng tôi."}</p>
                                </div>
                                <div className="flex gap-4 mt-6 sm:mt-0">
                                    <Link href={ctaMain.href} className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-sky-50 transition-colors">
                                        {ctaContact.text}
                                    </Link>
                                </div>
                            </div>
                        ),
                        overlay: (
                            <BorderBeam
                                size={200}
                                duration={6}
                                colorFrom="#38bdf8"
                                colorTo="#38bdf8"
                                glowIntensity={1}
                            />
                        )
                    }
                ]}
            />
        </section>
    );
}

export default HeroSection;
