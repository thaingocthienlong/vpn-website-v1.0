"use client";

import { Button } from "@/components/ui";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { ArrowRight, Phone, Mail } from "lucide-react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

interface CTASectionProps {
    title?: string;
    subtitle?: string;
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
        <section className="relative py-20 overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#1E40AF]">

            <div className="container mx-auto px-4 relative z-10">
                <ScrollReveal>
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">
                            {resolvedTitle}
                        </h2>
                        <p className="text-white/80 text-lg mb-8">
                            {resolvedSubtitle}
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                            <Button asChild size="lg" variant="secondary" className="min-w-[200px] bg-white text-primary hover:bg-slate-100">
                                <Link href={resolvedPrimaryCTA.href} className="inline-flex items-center">
                                    <span>{resolvedPrimaryCTA.text}</span>
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="ghost" className="min-w-[200px] border-2 border-white/60 text-white hover:bg-white/10 hover:border-white">
                                <Link href={resolvedSecondaryCTA.href}>
                                    {resolvedSecondaryCTA.text}
                                </Link>
                            </Button>
                        </div>

                        {/* Contact info */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/70">
                            {phone && (
                                <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                    <Phone className="w-5 h-5" />
                                    <span>{phone}</span>
                                </a>
                            )}
                            {email && (
                                <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                                    <Mail className="w-5 h-5" />
                                    <span>{email}</span>
                                </a>
                            )}
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

export default CTASection;
