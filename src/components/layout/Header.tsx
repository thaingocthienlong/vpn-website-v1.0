"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import TopStickyBar from '@/components/lightswind/top-sticky-bar';
import { Navbar, MenuItem } from './Navbar';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useLocale } from 'next-intl';

export interface HeaderProps {
    logo?: string;
    hotline?: string;
    ctaText?: string;
    ctaUrl?: string;
    isSticky?: boolean;
    menuItems?: MenuItem[];
}

const Header: React.FC<HeaderProps> = ({ menuItems: initialMenuItems }) => {
    const locale = useLocale();
    const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems || []);

    useEffect(() => {
        const fetchMenu = async () => {
            if (initialMenuItems && initialMenuItems.length > 0) return;
            
            try {
                const res = await fetch(`/api/homepage?locale=${locale}`);
                if (!res.ok) return;
                const sections = await res.json();
                
                // Find Header menu
                const headerSection = sections.find((s: any) => s.type === 'HEADER');
                if (headerSection && headerSection.content?.menuItems) {
                    setMenuItems(headerSection.content.menuItems);
                }
            } catch (error) {
                console.error("Failed to fetch menu:", error);
            }
        };
        fetchMenu();
    }, [locale, initialMenuItems]);

    return (
        <TopStickyBar>
            <Link href="/" className="flex items-center justify-center px-4 py-1.5 transition-all duration-300 ease-in-out hover:-translate-y-[2px]" title="Viện Phương Nam">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png" alt="Viện Phương Nam" className="h-[53px] w-auto max-w-[220px] object-contain transition-all duration-300" />
            </Link>

            <Navbar items={menuItems.length > 0 ? menuItems : undefined} />

            <div className="flex items-center gap-4">
                <LanguageSwitcher variant="desktop" />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    Liên hệ ngay
                </button>
            </div>
        </TopStickyBar>
    );
};

Header.displayName = "Header";

export { Header };
