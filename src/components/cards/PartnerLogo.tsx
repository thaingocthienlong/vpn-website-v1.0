"use client";

import Image from "next/image";
import Link from "next/link";
import {
    getAppearanceSurfaceStyle,
    getAppearanceTargetProps,
    getAppearanceTextStyle,
} from "@/lib/appearance/runtime";

interface PartnerLogoProps {
    name: string;
    logo?: string | null;
    website?: string | null;
}

export function PartnerLogo({ name, logo, website }: PartnerLogoProps) {
    const content = (
        <div
            className="group relative flex min-h-[104px] w-full items-center justify-center overflow-hidden rounded-[1.2rem] border border-[rgba(173,187,201,0.58)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,253,255,0.92))] px-5 py-4 shadow-[0_18px_30px_-28px_rgba(8,20,33,0.18)] backdrop-blur-[10px] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(157,173,190,0.76)] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(253,254,255,0.95))] hover:shadow-[0_22px_34px_-28px_rgba(8,20,33,0.22)]"
            style={getAppearanceSurfaceStyle("linear-gradient(180deg,rgba(255,255,255,0.96),rgba(251,253,255,0.92))")}
            {...getAppearanceTargetProps("card.partner.logo")}
        >
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.2rem-1px)] border border-white/90" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.78),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02)_52%,rgba(220,229,238,0.08))]" />
            {logo ? (
                <Image
                    src={logo}
                    alt={name}
                    width={160}
                    height={80}
                    className="relative z-10 max-h-[56px] w-auto max-w-full object-contain opacity-[0.98] transition-all duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
                />
            ) : (
                <span
                    className="relative z-10 text-center text-sm font-medium leading-6 text-[var(--ink-soft)] transition-colors duration-300 group-hover:text-[var(--ink)]"
                    style={getAppearanceTextStyle({
                        colorRole: "body",
                        colorFallback: "var(--ink-soft)",
                        sizeRole: "body",
                        sizeFallback: "0.875rem",
                    })}
                >
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
