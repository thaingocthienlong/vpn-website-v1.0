"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Eye, Star, Target } from "@phosphor-icons/react";
import { PublicPageShell } from "@/components/route-shell";
import { Button } from "@/components/ui";

type ValueIcon = "star" | "target" | "eye";

interface ValueItem {
    icon: ValueIcon;
    title: string;
    description: string;
}

interface LinkItem {
    href: string;
    label: string;
}

export interface VisionMissionPageTemplateProps {
    title: string;
    visionTitle: string;
    visionText: string;
    missionTitle: string;
    missionText: string;
    coreValuesTitle: string;
    values: ValueItem[];
    learnMoreTitle: string;
    links: LinkItem[];
}

const valueIconMap: Record<ValueIcon, React.ElementType> = {
    star: Star,
    target: Target,
    eye: Eye,
};

export function VisionMissionPageTemplate({
    title,
    visionTitle,
    visionText,
    missionTitle,
    missionText,
    coreValuesTitle,
    values,
    learnMoreTitle,
    links,
}: VisionMissionPageTemplateProps) {
    const main = (
        <div className="space-y-10 md:space-y-12">
            <section className="grid gap-5 lg:grid-cols-2">
                <article className="public-panel rounded-[2rem] p-6 md:p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                        {React.createElement(valueIconMap[values[0]?.icon || "eye"], {
                            className: "h-7 w-7",
                            weight: "duotone",
                        })}
                    </div>
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                        {visionTitle}
                    </h2>
                    <p className="mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                        {visionText}
                    </p>
                </article>

                <article className="public-panel rounded-[2rem] p-6 md:p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                        {React.createElement(valueIconMap[values[1]?.icon || "target"], {
                            className: "h-7 w-7",
                            weight: "duotone",
                        })}
                    </div>
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                        {missionTitle}
                    </h2>
                    <p className="mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                        {missionText}
                    </p>
                </article>
            </section>

            <section className="space-y-6">
                <div className="public-divider" />
                <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                    {coreValuesTitle}
                </h2>
                <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                    {values[0] && (
                        <article className="public-panel interactive-card rounded-[2rem] p-7 md:p-8">
                                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                                {React.createElement(valueIconMap[values[0].icon], {
                                    className: "h-7 w-7",
                                    weight: "duotone",
                                })}
                            </div>
                            <h3 className="text-2xl leading-tight text-[var(--ink)]">{values[0].title}</h3>
                            <p className="mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                                {values[0].description}
                            </p>
                        </article>
                    )}

                    <div className="grid gap-5">
                        {values.slice(1).map((value) => (
                            <article key={value.title} className="public-panel interactive-card rounded-[2rem] p-6">
                                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                                    {React.createElement(valueIconMap[value.icon], {
                                        className: "h-6 w-6",
                                        weight: "duotone",
                                    })}
                                </div>
                                <h3 className="text-xl leading-tight text-[var(--ink)]">{value.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                                    {value.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="public-panel rounded-[2rem] p-6 text-center md:p-8">
                <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.1rem]">
                    {learnMoreTitle}
                </h2>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {links.map((link) => (
                        <Button key={link.href} asChild variant="outline">
                            <Link href={link.href}>
                                {link.label}
                                <ArrowRight className="h-4 w-4" weight="bold" />
                            </Link>
                        </Button>
                    ))}
                </div>
            </section>
        </div>
    );

    return <PublicPageShell title={title} main={main} asideSticky={false} />;
}

export default VisionMissionPageTemplate;
