"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, DotsThreeOutline, WarningCircle } from "@phosphor-icons/react";
import { Footer, Header, Container } from "@/components/layout";
import { PublicRouteHero, PublicStatePanel } from "@/components/route-shell";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
    getServiceIconKeyBySlug,
    type ServiceListSummary,
} from "@/lib/content/service-pages";
import { serviceIconMap } from "./service-icons";

interface RemoteService {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string | null;
}

interface ServicesListHeroCard {
    title: string;
    description: string;
}

interface ServicesListAction {
    href: string;
    label: string;
    variant?: ButtonProps["variant"];
}

interface ServicesListCta {
    title: string;
    description: string;
    actions: ServicesListAction[];
}

interface ServicesListPageProps {
    locale: "vi" | "en";
    basePath: string;
    heroBadge?: string;
    heroTitle: string;
    heroDescription: string;
    heroCards?: ServicesListHeroCard[];
    services?: ServiceListSummary[];
    fallbackServices?: ServiceListSummary[];
    fetchUrl?: string;
    detailLabel?: string;
    emptyTitle: string;
    emptyDescription?: string;
    errorTitle: string;
    errorDescription?: string;
    cta?: ServicesListCta;
}

interface ServiceCardData {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    iconKey: ReturnType<typeof getServiceIconKeyBySlug>;
    features: string[];
}

const cardSpanPattern = [
    "xl:col-span-7",
    "xl:col-span-5",
    "xl:col-span-5",
    "xl:col-span-7",
    "xl:col-span-4",
    "xl:col-span-8",
] as const;

function ServiceHighlightCard({ title, description }: ServicesListHeroCard) {
    return (
        <div className="public-panel-muted rounded-[1.9rem] p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.12)] text-[var(--accent-strong)]">
                <DotsThreeOutline className="h-5 w-5" weight="fill" />
            </div>
            <p className="text-lg text-[var(--ink)]">{title}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{description}</p>
        </div>
    );
}

function ServiceCard({
    service,
    href,
    detailLabel,
    index,
}: {
    service: ServiceCardData;
    href: string;
    detailLabel?: string;
    index: number;
}) {
    const spanClass = cardSpanPattern[index % cardSpanPattern.length];
    const icon = React.createElement(serviceIconMap[service.iconKey], {
        className: "h-8 w-8",
        weight: "duotone",
    });

    return (
        <Link href={href} className={cn("group block", spanClass)}>
            <article className="interactive-card public-panel flex h-full flex-col overflow-hidden rounded-[2.2rem] p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-15 w-15 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(145deg,rgba(23,88,216,0.12),rgba(90,151,255,0.08))] text-[var(--accent-strong)] shadow-[var(--shadow-xs)]">
                        {icon}
                    </div>
                    <span className="rounded-full border border-[rgba(26,72,164,0.1)] bg-white/80 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[var(--ink-muted)] uppercase">
                        {service.id}
                    </span>
                </div>

                <div className="mt-6 space-y-4">
                    <h2 className="font-heading text-[2rem] text-[var(--ink)]">{service.title}</h2>
                    <p className="max-w-[52ch] text-sm leading-8 text-[var(--ink-soft)] md:text-[15px]">
                        {service.excerpt}
                    </p>
                </div>

                {service.features.length > 0 && (
                    <ul className="mt-6 grid gap-2 text-sm text-[var(--ink)] md:grid-cols-2">
                        {service.features.map((feature) => (
                            <li
                                key={feature}
                                className="rounded-[1rem] border border-[rgba(26,72,164,0.08)] bg-white/70 px-3 py-2"
                            >
                                {feature}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-8 flex items-center justify-between border-t border-[rgba(26,72,164,0.1)] pt-4">
                    {detailLabel ? (
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]">
                            {detailLabel}
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                        </span>
                    ) : (
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(26,72,164,0.12)] bg-white text-[var(--accent-strong)]">
                            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" weight="bold" />
                        </span>
                    )}
                </div>
            </article>
        </Link>
    );
}

export function ServicesListPage({
    locale,
    basePath,
    heroBadge,
    heroTitle,
    heroDescription,
    heroCards = [],
    services,
    fallbackServices,
    fetchUrl,
    detailLabel,
    emptyTitle,
    emptyDescription,
    errorTitle,
    errorDescription,
    cta,
}: ServicesListPageProps) {
    const [remoteServices, setRemoteServices] = useState<RemoteService[]>([]);
    const [loading, setLoading] = useState(Boolean(fetchUrl));
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!fetchUrl) {
            return;
        }

        const requestUrl = fetchUrl;
        let ignore = false;

        async function fetchServices() {
            setLoading(true);
            setHasError(false);

            try {
                const response = await fetch(requestUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch services: ${response.status}`);
                }

                const payload = await response.json();

                if (!ignore) {
                    setRemoteServices(payload.data || []);
                }
            } catch (error) {
                if (!ignore) {
                    console.error("Error fetching services:", error);
                    setHasError(true);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchServices();

        return () => {
            ignore = true;
        };
    }, [fetchUrl]);

    const cardData = useMemo<ServiceCardData[]>(() => {
        if (services) {
            return services.map((service) => ({
                ...service,
                features: service.features ?? [],
            }));
        }

        if (remoteServices.length === 0 && fallbackServices) {
            return fallbackServices.map((service) => ({
                ...service,
                features: service.features ?? [],
            }));
        }

        return remoteServices.map((service) => ({
            id: service.id,
            slug: service.slug,
            title: service.title,
            excerpt: service.excerpt,
            iconKey: getServiceIconKeyBySlug(service.slug),
            features: [],
        }));
    }, [fallbackServices, remoteServices, services]);

    const secondaryPanel = heroCards.length > 0
        ? heroCards.slice(0, 2).map((card) => (
            <ServiceHighlightCard
                key={`${card.title}-${card.description}`}
                title={card.title}
                description={card.description}
            />
        ))
        : null;

    return (
        <div className="min-h-screen public-shell" data-locale={locale}>
            <Header />
            <main id="main-content" className="public-main-offset flex-1 pb-20">
                <Container className="space-y-10 md:space-y-12">
                    <PublicRouteHero
                        badge={heroBadge}
                        title={heroTitle}
                        description={heroDescription}
                        secondaryPanel={secondaryPanel}
                    />

                    <section aria-live="polite">
                        {loading ? (
                            <div className="grid gap-5 xl:grid-cols-12">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            "public-panel h-[300px] animate-pulse rounded-[2.2rem]",
                                            cardSpanPattern[index % cardSpanPattern.length]
                                        )}
                                    />
                                ))}
                            </div>
                        ) : hasError && cardData.length === 0 ? (
                            <PublicStatePanel
                                icon={WarningCircle}
                                title={errorTitle}
                                description={errorDescription}
                            />
                        ) : cardData.length === 0 ? (
                            <PublicStatePanel
                                icon={WarningCircle}
                                title={emptyTitle}
                                description={emptyDescription}
                            />
                        ) : (
                            <div className="grid gap-5 xl:grid-cols-12">
                                {cardData.map((service, index) => (
                                    <ServiceCard
                                        key={service.slug}
                                        service={service}
                                        href={`${basePath}/${service.slug}`}
                                        detailLabel={detailLabel}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {cta && (
                        <section className="public-panel-contrast public-band overflow-hidden rounded-[2.5rem] p-7 md:p-10">
                            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                                <div className="space-y-4">
                                    <h2 className="font-heading text-[2.5rem] text-white md:text-[3.3rem]">
                                        {cta.title}
                                    </h2>
                                    <p className="max-w-[54ch] text-base leading-8 text-white/74 md:text-lg">
                                        {cta.description}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {cta.actions.map((action) => (
                                        <Button
                                            key={`${action.href}-${action.label}`}
                                            asChild
                                            size="lg"
                                            variant={action.variant ?? "secondary"}
                                        >
                                            <Link href={action.href}>{action.label}</Link>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </Container>
            </main>
            <Footer />
        </div>
    );
}

export default ServicesListPage;
