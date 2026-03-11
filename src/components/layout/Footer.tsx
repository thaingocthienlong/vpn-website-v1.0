"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "./Container";
import {
    Phone,
    Mail,
    MapPin,
    Facebook,
    Youtube,
    Linkedin,
    ChevronRight
} from "lucide-react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

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

const Footer: React.FC<FooterProps> = ({
    logo = "/logo.png",
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
}) => {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedQuickLinks = quickLinks || (isEn ? enQuickLinks : viQuickLinks);
    const resolvedDescription = description || (isEn
        ? "Southern Institute for Social Resources Development — Scientific research, technology transfer, training and high-quality human resources development."
        : "Viện Phát triển nguồn lực xã hội Phương Nam — Nghiên cứu khoa học, chuyển giao công nghệ, đào tạo và phát triển nguồn nhân lực chất lượng cao."
    );
    const resolvedCopyright = copyright || `© ${new Date().getFullYear()} ${isEn ? "SISRD. All rights reserved." : "Viện Phương Nam. Tất cả quyền được bảo lưu."}`;
    const orgName = isEn ? "SISRD" : "Viện Phương Nam";
    const linksTitle = isEn ? "Quick Links" : "Liên kết";
    const contactTitle = isEn ? "Contact" : "Liên hệ";
    const homeUrl = isEn ? "/en" : "/";

    return (
        <footer className="bg-slate-900 text-slate-300">
            {/* Main Footer */}
            <Container className="py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {/* Column 1: Logo & Description */}
                    <div className="lg:col-span-2">
                        <Link href={homeUrl} className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(0,38,255,0.46)]">
                                <span className="text-[#0D2B6B] font-bold text-xl">S</span>
                            </div>
                            <span className="font-heading font-bold text-xl text-white">
                                {orgName}
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            {resolvedDescription}
                        </p>
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.facebook && (
                                <a
                                    href={socialLinks.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-slate-800 hover:bg-primary transition-colors border border-slate-700 text-slate-400 hover:text-white"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {socialLinks.youtube && (
                                <a
                                    href={socialLinks.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-slate-800 hover:bg-red-600 transition-colors border border-slate-700 text-slate-400 hover:text-white"
                                    aria-label="Youtube"
                                >
                                    <Youtube className="h-5 w-5" />
                                </a>
                            )}
                            {socialLinks.linkedin && (
                                <a
                                    href={socialLinks.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full bg-slate-800 hover:bg-blue-700 transition-colors border border-slate-700 text-slate-400 hover:text-white"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-6 text-white">{linksTitle}</h3>
                        <ul className="space-y-3">
                            {resolvedQuickLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={link.url}
                                        className="flex items-center text-slate-400 hover:text-white transition-colors group"
                                    >
                                        <ChevronRight className="h-4 w-4 mr-2 text-slate-600 group-hover:text-white transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="font-heading font-bold text-lg mb-6 text-white">{contactTitle}</h3>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                                    className="flex items-start text-slate-400 hover:text-white transition-colors"
                                >
                                    <Phone className="h-5 w-5 mr-3 mt-0.5 text-blue-500 shrink-0" />
                                    <span>{contactInfo.phone}</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`mailto:${contactInfo.email}`}
                                    className="flex items-start text-slate-400 hover:text-white transition-colors"
                                >
                                    <Mail className="h-5 w-5 mr-3 mt-0.5 text-blue-500 shrink-0" />
                                    <span>{contactInfo.email}</span>
                                </a>
                            </li>
                            <li className="flex items-start text-slate-400">
                                <MapPin className="h-5 w-5 mr-3 mt-0.5 text-blue-500 shrink-0" />
                                <span>{contactInfo.address}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </Container>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800">
                <Container className="py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                        <p>{resolvedCopyright}</p>
                        <div className="flex items-center gap-6">
                            <Link href={isEn ? "/en/privacy-policy" : "/chinh-sach-bao-mat"} className="hover:text-white transition-colors">
                                {isEn ? "Privacy Policy" : "Chính sách bảo mật"}
                            </Link>
                            <Link href={isEn ? "/en/terms" : "/dieu-khoan-su-dung"} className="hover:text-white transition-colors">
                                {isEn ? "Terms of Service" : "Điều khoản sử dụng"}
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>
        </footer>
    );
};

Footer.displayName = "Footer";

export { Footer };
