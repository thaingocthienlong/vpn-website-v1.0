"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Medal, Target, UsersThree } from "@phosphor-icons/react";
import { Button } from "@/components/ui";
import { PublicPageShell } from "@/components/route-shell";

const statsValues = ["5,000+", "15+", "100+", "50+"];
const statsIcons = [UsersThree, Medal, Target, BookOpen];

export interface AboutLandingMilestone {
    year: string;
    title: string;
    description: string;
}

export interface AboutLandingPageProps {
    badge: string;
    title: string;
    titleHighlight: string;
    description: string;
    statsLabels: [string, string, string, string];
    timelineTitle: string;
    timelineDescription: string;
    milestones: AboutLandingMilestone[];
    ctaTitle: string;
    ctaDescription: string;
    ctaButtonLabel: string;
    visionButtonLabel: string;
    hrefs: {
        visionMission: string;
        contact: string;
    };
}

export function AboutLandingPage({
    badge,
    title,
    titleHighlight,
    description,
    statsLabels,
    timelineTitle,
    timelineDescription,
    milestones,
    ctaTitle,
    ctaDescription,
    ctaButtonLabel,
    visionButtonLabel,
    hrefs,
}: AboutLandingPageProps) {
    const heroActions = (
        <>
            <Button asChild size="lg">
                <Link href={hrefs.visionMission}>
                    {visionButtonLabel}
                    <ArrowRight className="h-4 w-4" weight="bold" />
                </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                <Link href={hrefs.contact}>{ctaButtonLabel}</Link>
            </Button>
        </>
    );

    const heroPanel = (
        <div className="grid gap-3">
            {statsValues.slice(0, 2).map((value, index) => {
                const Icon = statsIcons[index];

                return (
                    <div key={value} className="public-panel-muted rounded-[1.6rem] p-4">
                        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                            <Icon className="h-5 w-5" weight="duotone" />
                        </div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                            {statsLabels[index]}
                        </p>
                        <p className="mt-2 text-3xl leading-none text-[var(--ink)]">{value}</p>
                    </div>
                );
            })}
        </div>
    );

    const main = (
        <div className="space-y-10 md:space-y-12">
            <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
                {statsValues.map((value, index) => {
                    const Icon = statsIcons[index];
                    const className = index === 0 ? "lg:col-span-1 lg:row-span-2" : "";

                    return (
                        <article
                            key={value}
                            className={`public-panel interactive-card rounded-[2rem] p-6 md:p-7 ${className}`}
                        >
                            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                                <Icon className="h-6 w-6" weight="duotone" />
                            </div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                {statsLabels[index]}
                            </p>
                            <p className="mt-3 text-4xl leading-none text-[var(--ink)] md:text-[3.2rem]">
                                {value}
                            </p>
                        </article>
                    );
                })}
            </section>

            <section className="public-panel rounded-[2.2rem] p-6 md:p-8">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <div className="space-y-4">
                        <div className="glass-badge">{timelineTitle}</div>
                        <h2 className="text-3xl leading-[0.95] text-[var(--ink)] md:text-[3.2rem]">
                            {timelineTitle}
                        </h2>
                        <p className="max-w-[36rem] text-base leading-8 text-[var(--ink-soft)]">
                            {timelineDescription}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {milestones.map((milestone, index) => (
                            <div key={milestone.year} className="grid gap-4 sm:grid-cols-[88px_1fr]">
                                <div className="text-left sm:text-right">
                                    <span className="text-2xl leading-none text-[var(--accent-strong)]">
                                        {milestone.year}
                                    </span>
                                </div>
                                <div className="rounded-[1.6rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.62)] p-5">
                                    <h3 className="text-lg leading-tight text-[var(--ink)]">{milestone.title}</h3>
                                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                                        {milestone.description}
                                    </p>
                                    {index < milestones.length - 1 && <div className="mt-5 public-divider" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="public-panel public-band rounded-[2.2rem] p-6 text-center md:p-8">
                <h2 className="text-3xl leading-[0.95] text-[var(--ink)] md:text-[3.2rem]">
                    {ctaTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                    {ctaDescription}
                </p>
                <div className="mt-6 flex justify-center">
                    <Button asChild size="lg">
                        <Link href={hrefs.contact}>
                            {ctaButtonLabel}
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );

    return (
        <PublicPageShell
            badge={badge}
            title={`${title} ${titleHighlight}`}
            description={description}
            actions={heroActions}
            secondaryPanel={heroPanel}
            main={main}
            asideSticky={false}
        />
    );
}

export default AboutLandingPage;
