"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Medal, Target, UsersThree } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { PublicPageShell } from "@/components/route-shell";

const statsValues = ["5,000+", "15+", "100+", "50+"];
const statsIcons = [UsersThree, Medal, Target, BookOpen];

const milestones = [
    { year: "2009", title: "Establishment", description: "Beginning the journey with a mission to develop human resources" },
    { year: "2012", title: "Expansion", description: "Developing research and technology transfer services" },
    { year: "2016", title: "ISO 9001 Certification", description: "Achieving international quality management certification" },
    { year: "2020", title: "International Cooperation", description: "Expanding partnerships with international organizations" },
    { year: "2024", title: "Digital Transformation", description: "Applying new technology in training and research" },
];

export default function AboutPage() {
    const t = useTranslations("about");

    const statsLabels = [
        t("stats.students"),
        t("stats.experience"),
        t("stats.projects"),
        t("stats.courses"),
    ];

    const heroActions = (
        <>
            <Button asChild size="lg">
                <Link href="/en/about/vision-mission">
                    {t("visionMission.vision")}
                    <ArrowRight className="h-4 w-4" weight="bold" />
                </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                <Link href="/en/contact">{t("cta.button")}</Link>
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
                    const className =
                        index === 0
                            ? "lg:col-span-1 lg:row-span-2"
                            : "";

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
                        <div className="glass-badge">{t("timeline.title")}</div>
                        <h2 className="text-3xl leading-[0.95] text-[var(--ink)] md:text-[3.2rem]">
                            {t("timeline.title")}
                        </h2>
                        <p className="max-w-[36rem] text-base leading-8 text-[var(--ink-soft)]">
                            {t("timeline.description")}
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
                    {t("cta.title")}
                </h2>
                <p className="mx-auto mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                    {t("cta.description")}
                </p>
                <div className="mt-6 flex justify-center">
                    <Button asChild size="lg">
                        <Link href="/en/contact">
                            {t("cta.button")}
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );

    return (
        <PublicPageShell
            badge={t("hero.badge")}
            title={`${t("hero.title")} ${t("hero.titleHighlight")}`}
            description={t("hero.description")}
            actions={heroActions}
            secondaryPanel={heroPanel}
            main={main}
            asideSticky={false}
        />
    );
}
