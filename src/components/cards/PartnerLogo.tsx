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
        <div className="group relative flex h-24 min-w-[210px] items-center justify-center rounded-[1.6rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.72)] px-6 transition-all duration-300 hover:-translate-y-1 hover:bg-[rgba(255,255,255,0.9)]">
            {logo ? (
                <Image
                    src={logo}
                    alt={name}
                    width={132}
                    height={64}
                    className="max-h-14 w-auto object-contain opacity-80 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                />
            ) : (
                <span className="text-sm font-medium text-[var(--ink-soft)] transition-colors duration-300 group-hover:text-[var(--ink)]">
                    {name}
                </span>
            )}
        </div>
    );

    if (website) {
        return (
            <Link href={website} target="_blank" rel="noopener noreferrer" title={name} className="block h-full w-full">
                {content}
            </Link>
        );
    }

    return (
        <div title={name} className="block h-full w-full">
            {content}
        </div>
    );
}

export default PartnerLogo;
