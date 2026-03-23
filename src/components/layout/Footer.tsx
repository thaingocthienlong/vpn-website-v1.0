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
        phone: "1900 1234",
        email: "info@vienphuongnam.com",
        address: "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    },
    socialLinks = {
        facebook: "https://facebook.com",
        youtube: "https://youtube.com",
        linkedin: "https://linkedin.com",
    },
    quickLinks,
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
            ? "Southern Institute for Social Resources Development — Scientific research, technology transfer, training and high-quality human resources development."
            : "Viện Phát triển nguồn lực xã hội Phương Nam — Nghiên cứu khoa học, chuyển giao công nghệ, đào tạo và phát triển nguồn nhân lực chất lượng cao.");
    const resolvedCopyright =
        copyright ||
        `© ${new Date().getFullYear()} ${isEn ? "SISRD. All rights reserved." : "Viện Phương Nam. Tất cả quyền được bảo lưu."}`;
    const orgName = isEn ? "SISRD" : "Viện Phương Nam";

    return (
        <footer className="relative pb-8 pt-10">
            <Container>
                <MotionSection preset="footer">
                    <div className="section-shell relative overflow-hidden rounded-[3rem] border border-[rgba(96,148,255,0.2)] bg-[linear-gradient(155deg,rgba(30,82,186,0.96),rgba(51,106,224,0.93)_54%,rgba(133,181,255,0.86)_124%)] px-6 py-10 text-[#f5f9ff] shadow-[0_34px_96px_rgba(25,72,182,0.22)] md:px-10 md:py-12">
                    <FloatingAccent className="right-[8%] top-[10%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(116,170,255,0.2),transparent_72%)]" variant="halo" />
                    <FloatingAccent className="bottom-[12%] left-[8%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_70%)]" variant="orb" />
                    <div className="section-outline hidden md:block" />
                    <MotionGroup className="relative grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]" stagger={0.1}>
                        <MotionItem className="space-y-6">
                            <div className="space-y-3">
                                <div className="public-kicker border-white/16 bg-white/12 text-white/90">
                                    {orgName}
                                </div>
                                <h2
                                    className="max-w-xl font-heading text-[2.2rem] tracking-[-0.04em] !text-[#f7fbff] md:text-[3rem]"
                                    style={{ color: "#f7fbff" }}
                                >
                                    {orgName}
                                </h2>
                                <p className="max-w-xl text-sm leading-8 text-white/72 md:text-[15px]">
                                    {resolvedDescription}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {socialLinks.facebook ? (
                                    <motion.a
                                        href={socialLinks.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/12 bg-white/8 text-white/78 transition-colors hover:bg-white/16 hover:text-white"
                                        aria-label="Facebook"
                                        whileHover={{ y: -4, scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <FacebookLogo className="h-5 w-5" weight="fill" />
                                    </motion.a>
                                ) : null}
                                {socialLinks.youtube ? (
                                    <motion.a
                                        href={socialLinks.youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/12 bg-white/8 text-white/78 transition-colors hover:bg-white/16 hover:text-white"
                                        aria-label="Youtube"
                                        whileHover={{ y: -4, scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <YoutubeLogo className="h-5 w-5" weight="fill" />
                                    </motion.a>
                                ) : null}
                                {socialLinks.linkedin ? (
                                    <motion.a
                                        href={socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/12 bg-white/8 text-white/78 transition-colors hover:bg-white/16 hover:text-white"
                                        aria-label="LinkedIn"
                                        whileHover={{ y: -4, scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                    >
                                        <LinkedinLogo className="h-5 w-5" weight="fill" />
                                    </motion.a>
                                ) : null}
                            </div>
                        </MotionItem>

                        <MotionItem className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-[2rem] border border-white/14 bg-white/10 p-5 transition-colors duration-300 hover:bg-white/14">
                                <h3
                                    className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] !text-white/80"
                                    style={{ color: "rgba(247, 251, 255, 0.8)" }}
                                >
                                    {isEn ? "Quick Links" : "Liên kết"}
                                </h3>
                                <div className="grid gap-2">
                                    {resolvedQuickLinks.map((link) => (
                                        <Link
                                            key={link.url}
                                            href={link.url}
                                            className="rounded-[1rem] px-2 py-1.5 text-sm text-white/74 transition-colors hover:bg-white/8 hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[2rem] border border-white/14 bg-white/10 p-5 transition-colors duration-300 hover:bg-white/14">
                                <h3
                                    className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] !text-white/80"
                                    style={{ color: "rgba(247, 251, 255, 0.8)" }}
                                >
                                    {isEn ? "Contact" : "Liên hệ"}
                                </h3>
                                <div className="space-y-3">
                                    <a
                                        href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                                        className="flex gap-3 rounded-[1rem] px-1 py-1 text-sm text-white/78 transition-colors hover:text-white"
                                    >
                                        <Phone className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                                        <span>{contactInfo.phone}</span>
                                    </a>
                                    <a
                                        href={`mailto:${contactInfo.email}`}
                                        className="flex gap-3 rounded-[1rem] px-1 py-1 text-sm text-white/78 transition-colors hover:text-white"
                                    >
                                        <EnvelopeSimple className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                                        <span>{contactInfo.email}</span>
                                    </a>
                                    <div className="flex gap-3 rounded-[1rem] px-1 py-1 text-sm text-white/78">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" weight="bold" />
                                        <span>{contactInfo.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-white/14 bg-white/10 p-5 transition-colors duration-300 hover:bg-white/14">
                                <div className="space-y-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/56">
                                        {isEn ? "Institutional" : "Thông tin"}
                                    </p>
                                    <div className="space-y-2 text-sm leading-7 text-white/72">
                                        <p>{resolvedCopyright}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Link
                                        href={isEn ? "/en/privacy-policy" : "/chinh-sach-bao-mat"}
                                        className="block rounded-[1rem] px-1 py-1 text-sm text-white/72 transition-colors hover:text-white"
                                    >
                                        {isEn ? "Privacy Policy" : "Chính sách bảo mật"}
                                    </Link>
                                    <Link
                                        href={isEn ? "/en/terms" : "/dieu-khoan-su-dung"}
                                        className="block rounded-[1rem] px-1 py-1 text-sm text-white/72 transition-colors hover:text-white"
                                    >
                                        {isEn ? "Terms of Service" : "Điều khoản sử dụng"}
                                    </Link>
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
