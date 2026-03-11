"use client";

import * as React from "react";
import TopStickyBar from '@/components/lightswind/top-sticky-bar';
import { Navbar, MenuItem } from './Navbar';
import Link from 'next/link';

export interface HeaderProps {
    logo?: string;
    hotline?: string;
    ctaText?: string;
    ctaUrl?: string;
    isSticky?: boolean;
    menuItems?: MenuItem[];
}

const Header: React.FC<HeaderProps> = () => {
    return (
        <TopStickyBar>
            <Link href="/" className="flex items-center justify-center px-4 py-1.5 transition-all duration-300 ease-in-out hover:-translate-y-[2px]" title="Viện Phương Nam">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png" alt="Viện Phương Nam" className="h-[53px] w-auto max-w-[220px] object-contain transition-all duration-300" />
            </Link>

            <Navbar />

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                Liên hệ ngay
            </button>
        </TopStickyBar>
    );
};

Header.displayName = "Header";

export { Header };
