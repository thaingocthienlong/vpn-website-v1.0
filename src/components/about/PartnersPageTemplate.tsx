"use client";

/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { Buildings } from "@phosphor-icons/react";
import { PublicPageShell, PublicStatePanel } from "@/components/route-shell";
import {
    getAppearanceSurfaceStyle,
    getAppearanceTargetProps,
    getAppearanceTextStyle,
} from "@/lib/appearance/runtime";

export interface PartnerCardItem {
    id: string;
    name: string;
    logo?: string | null;
    website?: string | null;
    description?: string | null;
}

export interface PartnersPageTemplateProps {
    title: string;
    description?: string;
    badge?: string;
    partners: PartnerCardItem[];
    loading?: boolean;
    emptyTitle: string;
}

export function PartnersPageTemplate({
    title,
    description,
    badge,
    partners,
    loading = false,
    emptyTitle,
}: PartnersPageTemplateProps) {
    const main = loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="public-panel h-[240px] animate-pulse rounded-[1.9rem]" />
            ))}
        </div>
    ) : partners.length === 0 ? (
        <PublicStatePanel icon={Buildings} title={emptyTitle} />
    ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner, index) => (
                <a
                    key={partner.id}
                    href={partner.website || "#"}
                    target={partner.website ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`public-panel interactive-card flex rounded-[1.9rem] p-6 ${
                        index % 3 === 1 ? "xl:translate-y-8" : ""
                    }`}
                    style={getAppearanceSurfaceStyle("linear-gradient(180deg,rgba(252,254,255,0.92),rgba(241,247,251,0.86))")}
                    {...getAppearanceTargetProps("card.partner.grid")}
                >
                    <div className="flex w-full flex-col">
                        <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.4rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(23,88,216,0.06)] text-[var(--accent-strong)]">
                            {partner.logo ? (
                                <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain" />
                            ) : (
                                <Buildings className="h-10 w-10" weight="duotone" />
                            )}
                        </div>
                        <h2
                            className="text-xl leading-tight text-[var(--ink)]"
                            style={getAppearanceTextStyle({
                                colorRole: "title",
                                colorFallback: "var(--ink)",
                                sizeRole: "title",
                                sizeFallback: "1.25rem",
                            })}
                        >
                            {partner.name}
                        </h2>
                        {partner.description && (
                            <p
                                className="mt-3 text-sm leading-7 text-[var(--ink-soft)]"
                                style={getAppearanceTextStyle({
                                    colorRole: "body",
                                    colorFallback: "var(--ink-soft)",
                                    sizeRole: "body",
                                    sizeFallback: "0.875rem",
                                })}
                            >
                                {partner.description}
                            </p>
                        )}
                    </div>
                </a>
            ))}
        </div>
    );

    return (
        <PublicPageShell
            badge={badge}
            title={title}
            description={description}
            main={main}
            asideSticky={false}
            heroAppearanceTargetId="page.hero.partners"
        />
    );
}

export default PartnersPageTemplate;
