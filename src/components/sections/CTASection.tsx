"use client";

import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { SectionWrapper, type SectionWrapperProps } from "./SectionWrapper";

interface CTASectionProps {
    title?: string;
    subtitle?: string;
    background?: SectionWrapperProps["background"];
    textColor?: SectionWrapperProps["textColor"];
    backdropBlur?: SectionWrapperProps["backdropBlur"];
    primaryCTA?: {
        text: string;
        href: string;
    };
    secondaryCTA?: {
        text: string;
        href: string;
    };
    phone?: string;
    email?: string;
}

export function CTASection({
    title,
    subtitle,
    background,
    textColor,
    backdropBlur,
    primaryCTA,
    secondaryCTA,
    phone = "028 1234 5678",
    email = "info@sisrd.edu.vn",
}: CTASectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedTitle = title || (isEn
        ? "Ready to Start Your Learning Journey?"
        : "Sẵn Sàng Bắt Đầu Hành Trình Học Tập?");
    const resolvedSubtitle = subtitle || (isEn
        ? "Contact us today for a free consultation on the training programs best suited for you."
        : "Liên hệ ngay với chúng tôi để được tư vấn miễn phí về các chương trình đào tạo phù hợp nhất với bạn.");
    const resolvedPrimaryCTA = primaryCTA || (isEn
        ? { text: "Register for Consultation", href: "/en/contact" }
        : { text: "Đăng ký tư vấn", href: "/lien-he" });
    const resolvedSecondaryCTA = secondaryCTA || (isEn
        ? { text: "View Courses", href: "/en/training" }
        : { text: "Xem khóa học", href: "/dao-tao" });

    return (
        <SectionWrapper background={background || "sky-950"} textColor={textColor} backdropBlur={backdropBlur} className="relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                {/* Enclosed Vibrant Card */}
                <div className="relative max-w-6xl mx-auto rounded-3xl sm:rounded-[3rem] overflow-hidden bg-gradient-to-br from-blue-600 to-blue-500 shadow-2xl">
                    
                    {/* Background pattern inside the card */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:24px_24px] opacity-30 z-0" />
                    
                     {/* Decorative glow inside */}
                    <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10 p-8 sm:p-12 lg:p-16">
                    
                        {/* Left side: Text & Actions */}
                        <ScrollReveal>
                            <div className="text-left space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-semibold tracking-wide border border-white/20 shadow-sm">
                                    <span className="relative flex h-2.5 w-2.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                                    </span>
                                    {isEn ? "Enrollment Open" : "Đang Tuyển Sinh"}
                                </div>
                                
                                <h2 className="font-heading text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                                    {resolvedTitle}
                                </h2>
                                <p className="text-blue-50 text-lg md:text-xl font-medium max-w-xl">
                                    {resolvedSubtitle}
                                </p>

                                {/* CTAs */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full sm:w-auto min-w-[200px] h-14 bg-white hover:bg-slate-50 text-blue-600 font-semibold text-lg shadow-xl"
                                    >
                                        <Link href={resolvedPrimaryCTA.href} className="inline-flex items-center justify-center">
                                            <span>{resolvedPrimaryCTA.text}</span>
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="w-full sm:w-auto min-w-[200px] h-14 border-2 border-white/30 hover:bg-white/10 hover:border-white text-white font-semibold text-lg hover:text-white">
                                        <Link href={resolvedSecondaryCTA.href}>
                                            {resolvedSecondaryCTA.text}
                                        </Link>
                                    </Button>
                                </div>

                                {/* Contact info */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-blue-50 font-medium pt-4">
                                    {phone && (
                                        <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                                <Phone className="w-4 h-4 text-white" />
                                            </div>
                                            <span>{phone}</span>
                                        </a>
                                    )}
                                    {email && (
                                        <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                                <Mail className="w-4 h-4 text-white" />
                                            </div>
                                            <span>{email}</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Right side: Interactive Visual/Mockup */}
                        <ScrollReveal delay={0.2}>
                            <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none lg:aspect-auto lg:h-[450px]">
                                {/* Interactive Floating Card */}
                                <div className="absolute inset-4 sm:inset-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden group transition-transform duration-500 hover:scale-[1.02]">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <div className="flex flex-col h-full p-8 md:p-10 justify-between relative z-10">
                                        <div className="space-y-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-lg relative overflow-hidden flex items-center justify-center">
                                                <div className="w-8 h-8 bg-blue-500 rounded-lg shrink-0" />
                                            </div>
                                            <div className="w-3/4 h-6 rounded-lg bg-white/40 animate-pulse" />
                                            <div className="w-1/2 h-6 rounded-lg bg-white/20 animate-pulse" />
                                        </div>
                                        
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <div className="w-full h-4 rounded-md bg-white/30" />
                                                <div className="w-5/6 h-4 rounded-md bg-white/30" />
                                                <div className="w-4/6 h-4 rounded-md bg-white/30" />
                                            </div>
                                            
                                            <div className="flex gap-3 pt-4">
                                                <div className="w-10 h-10 rounded-full bg-white/40 border-2 border-white/20 shadow-sm" />
                                                <div className="w-10 h-10 rounded-full bg-white/40 border-2 border-white/20 shadow-sm -ml-4" />
                                                <div className="w-10 h-10 rounded-full bg-white/40 border-2 border-white/20 shadow-sm -ml-4" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>

                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}

export default CTASection;
