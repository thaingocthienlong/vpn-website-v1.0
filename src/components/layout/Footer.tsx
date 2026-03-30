"use client";

import Link from "next/link";
import {
    EnvelopeSimple,
    FacebookLogo,
    LinkedinLogo,
    MapPin,
    Phone,
    YoutubeLogo,
} from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { detectLocaleFromPath } from "@/lib/routes";
import { motion } from "framer-motion";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection } from "@/components/motion/PublicMotion";

export interface FooterProps {
    logo?: string;
    description?: string;
    contactInfo?: {
        phone: string;
        email: string;
        address: string;
    };
    socialLinks?: {
        facebook?: string;
        youtube?: string;
        linkedin?: string;
    };
    quickLinks?: { label: string; url: string }[];
    legalLinks?: { label: string; url: string }[];
    copyright?: string;
}

const viQuickLinks = [
    { label: "Giới thiệu", url: "/gioi-thieu/tam-nhin-su-menh" },
    { label: "Đào tạo", url: "/dao-tao" },
    { label: "Dịch vụ", url: "/dich-vu" },
    { label: "Tin tức", url: "/tin-tuc" },
    { label: "Liên hệ", url: "/lien-he" },
];

const enQuickLinks = [
    { label: "About", url: "/en/about/vision-mission" },
    { label: "Training", url: "/en/training" },
    { label: "Services", url: "/en/services" },
    { label: "News", url: "/en/news" },
    { label: "Contact", url: "/en/contact" },
];

export function Footer({
    contactInfo = {
        phone: "0912 114 511",
        email: "vanphong@vienphuongnam.com.vn",
        address: "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM",
    },
    socialLinks = {
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        linkedin: "https://linkedin.com",
    },
    quickLinks,
    legalLinks,
    copyright,
    description,
}: FooterProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const resolvedQuickLinks = quickLinks || (isEn ? enQuickLinks : viQuickLinks);
    const resolvedDescription =
        description ||
        (isEn
            ? "Vien Phuong Nam Institute for social resource development, training, research, and community connection."
            : "Viện Phát triển nguồn lực xã hội Phương Nam, kết nối đào tạo, nghiên cứu và phát triển nguồn lực xã hội.");
    const resolvedCopyright =
        copyright ||
        `© ${new Date().getFullYear()} ${isEn ? "Vien Phuong Nam. All rights reserved." : "Viện Phương Nam. Tất cả quyền được bảo lưu."}`;
    const orgName = isEn ? "Vien Phuong Nam" : "Viện Phương Nam";
    const resolvedLegalLinks = legalLinks || [
        {
            label: isEn ? "Privacy Policy" : "Chính sách bảo mật",
            url: isEn ? "/en/privacy-policy" : "/chinh-sach-bao-mat",
        },
        {
            label: isEn ? "Terms of Service" : "Điều khoản sử dụng",
            url: isEn ? "/en/terms" : "/dieu-khoan-su-dung",
        },
    ];

    return (
        <footer className="relative overflow-hidden pb-8 pt-8 md:pb-10 md:pt-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_16%_12%,rgba(77,111,147,0.08),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.44),transparent_18%),linear-gradient(180deg,rgba(248,251,253,0.42),rgba(228,235,241,0.14))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-[0.2]" style={{ backgroundImage: "linear-gradient(rgba(77,111,147,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(77,111,147,0.08) 1px, transparent 1px)", backgroundSize: "34px 34px", maskImage: "linear-gradient(180deg, rgba(0,0,0,0.28), transparent 92%)" }} />
            <Container>
                <MotionSection preset="footer">
                    <div className="relative overflow-hidden rounded-[2.7rem] border border-[rgba(16,36,56,0.1)] bg-[linear-gradient(180deg,rgba(248,251,253,0.28),rgba(242,245,247,0.18)_46%,rgba(228,235,241,0.08)_100%)] px-6 py-8 text-[var(--ink)] shadow-[0_22px_54px_-44px_rgba(8,20,33,0.16)] backdrop-blur-[10px] md:px-10 md:py-10">
                        <FloatingAccent className="right-[8%] top-[10%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(77,111,147,0.12),transparent_72%)]" variant="halo" />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.28),transparent_38%)]" />

                        <MotionGroup className="relative grid gap-10 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]" stagger={0.1}>
                            <MotionItem className="space-y-6">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-3">
                                        <span className="h-px w-10 bg-[rgba(16,36,56,0.12)]" />
                                        <span className="editorial-caption text-[var(--ink-muted)]">
                                            {orgName}
                                        </span>
                                    </div>
                                    <h2 className="max-w-[11ch] font-heading text-[2.35rem] tracking-[-0.05em] !text-[var(--ink)] md:text-[3.1rem]">
                                        {orgName}
                                    </h2>
                                    <p className="max-w-[38rem] text-sm leading-8 text-[var(--ink-soft)] md:text-[15px]">
                                        {resolvedDescription}
                                    </p>
                                </div>

                                <div className="border-t border-[rgba(16,36,56,0.08)] pt-5">
                                    <p className="editorial-caption text-[var(--ink-muted)]">
                                        {isEn ? "Institutional profile" : "Hồ sơ đơn vị"}
                                    </p>
                                    <p className="mt-3 max-w-[34rem] text-sm leading-7 text-[var(--ink-soft)]">
                                        {isEn
                                            ? "Training, research, and service programs designed to connect academic depth with practical community development."
                                            : "Các chương trình đào tạo, nghiên cứu và dịch vụ được thiết kế để kết nối chiều sâu học thuật với nhu cầu phát triển cộng đồng."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-1">
                                    {socialLinks.facebook ? (
                                        <motion.a
                                            href={socialLinks.facebook}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(252,254,255,0.42)] text-[var(--ink-soft)] transition-colors hover:bg-[rgba(248,251,253,0.78)] hover:text-[var(--accent-strong)]"
                                            aria-label="Facebook"
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <FacebookLogo className="h-5 w-5" weight="fill" />
                                        </motion.a>
                                    ) : null}
                                    {socialLinks.youtube ? (
                                        <motion.a
                                            href={socialLinks.youtube}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(252,254,255,0.42)] text-[var(--ink-soft)] transition-colors hover:bg-[rgba(248,251,253,0.78)] hover:text-[var(--accent-strong)]"
                                            aria-label="Youtube"
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <YoutubeLogo className="h-5 w-5" weight="fill" />
                                        </motion.a>
                                    ) : null}
                                    {socialLinks.linkedin ? (
                                        <motion.a
                                            href={socialLinks.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(252,254,255,0.42)] text-[var(--ink-soft)] transition-colors hover:bg-[rgba(248,251,253,0.78)] hover:text-[var(--accent-strong)]"
                                            aria-label="LinkedIn"
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <LinkedinLogo className="h-5 w-5" weight="fill" />
                                        </motion.a>
                                    ) : null}
                                </div>
                            </MotionItem>

                            <MotionItem className="space-y-6">
                                <div className="grid gap-8 border-t border-[rgba(16,36,56,0.08)] pt-5 md:grid-cols-[0.82fr_1.18fr]">
                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                            {isEn ? "Quick Links" : "Liên kết"}
                                        </h3>
                                        <div className="grid gap-2">
                                            {resolvedQuickLinks.map((link, index) => (
                                                <Link
                                                    key={`${link.url}-${link.label}-${index}`}
                                                    href={link.url}
                                                    className="rounded-[0.9rem] px-1 py-1.5 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-strong)]"
                                                >
                                                    {link.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                            {isEn ? "Contact" : "Liên hệ"}
                                        </h3>
                                        <div className="space-y-3">
                                            <a
                                                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                                                className="flex gap-3 rounded-[0.9rem] px-1 py-1 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-strong)]"
                                            >
                                                <Phone className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                                                <span>{contactInfo.phone}</span>
                                            </a>
                                            <a
                                                href={`mailto:${contactInfo.email}`}
                                                className="flex gap-3 rounded-[0.9rem] px-1 py-1 text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-strong)]"
                                            >
                                                <EnvelopeSimple className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                                                <span>{contactInfo.email}</span>
                                            </a>
                                            <div className="flex gap-3 rounded-[0.9rem] px-1 py-1 text-sm text-[var(--ink-soft)]">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                                                <span>{contactInfo.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5 border-t border-[rgba(16,36,56,0.08)] pt-5 md:flex-row md:items-end md:justify-between">
                                    <div className="space-y-3">
                                        <p className="editorial-caption text-[var(--ink-muted)]">
                                            {isEn ? "Institutional" : "Thông tin"}
                                        </p>
                                        <p className="max-w-[28rem] text-sm leading-7 text-[var(--ink-soft)]">
                                            {resolvedCopyright}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {resolvedLegalLinks.map((link, index) => (
                                            <Link
                                                key={`${link.url}-${link.label}-${index}`}
                                                href={link.url}
                                                className="text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--accent-strong)]"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </MotionItem>
                        </MotionGroup>
                    </div>
                </MotionSection>
            </Container>
        </footer>
    );
}

Footer.displayName = "Footer";
