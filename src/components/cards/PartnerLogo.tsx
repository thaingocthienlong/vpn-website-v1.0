"use client";

import Image from "next/image";
import Link from "next/link";

interface PartnerLogoProps {
    name: string;
    logo?: string | null;
    website?: string | null;
}

export function PartnerLogo({ name, logo, website }: PartnerLogoProps) {
    const content = (
        <div className="group relative w-full h-full flex items-center justify-center p-4">
            {logo ? (
                <Image
                    src={logo}
                    alt={name}
                    width={120}
                    height={60}
                    className="max-h-12 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                />
            ) : (
                <span className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                    {name}
                </span>
            )}
        </div>
    );

    if (website) {
        return (
            <Link
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                title={name}
                className="w-full h-full block"
            >
                {content}
            </Link>
        );
    }

    return <div title={name} className="w-full h-full block">{content}</div>;
}

export default PartnerLogo;
