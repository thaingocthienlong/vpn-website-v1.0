"use client";

import * as React from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    CheckCircle,
    MagnifyingGlass,
    PhoneCall,
} from "@phosphor-icons/react";
import { Footer, Header, Container } from "@/components/layout";
import {
    PublicBreadcrumbBar,
    PublicRouteFrame,
    PublicRouteHero,
    PublicStatePanel,
} from "@/components/route-shell";
import { Button } from "@/components/ui/Button";
import type { ServiceDetailContent } from "@/lib/content/service-pages";
import { serviceIconMap } from "./service-icons";
import type { HeaderProps, FooterProps } from "@/components/layout";

interface ServiceDetailLabels {
    allServicesLabel: string;
    notFoundTitle: string;
    viewAllLabel: string;
    workingProcessTitle: string;
    contactConsultationTitle: string;
    contactConsultationDescription: string;
    sendInquiryLabel: string;
    hotlineLabel: string;
    otherServicesTitle: string;
}

interface ServiceDetailPageTemplateProps {
    basePath: string;
    contactHref: string;
    service: ServiceDetailContent | null;
    otherServices: ServiceDetailContent[];
    labels: ServiceDetailLabels;
    headerProps?: HeaderProps;
    footerProps?: FooterProps;
}

function ServiceSectionCard({
    serviceIconKey,
    title,
    items,
}: {
    serviceIconKey: ServiceDetailContent["iconKey"];
    title: string;
    items: string[];
}) {
    const icon = React.createElement(serviceIconMap[serviceIconKey], {
        className: "h-6 w-6",
        weight: "duotone",
    });

    return (
        <section className="public-panel rounded-[2rem] p-6 md:p-7">
            <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.1)] text-[var(--accent-strong)]">
                    {icon}
                </div>
                <h2 className="text-[2rem] text-[var(--ink)]">{title}</h2>
            </div>
            <ul className="space-y-3">
                {items.map((item) => (
                    <li
                        key={item}
                        className="flex items-start gap-3 rounded-[1.2rem] border border-[rgba(26,72,164,0.08)] bg-white/70 px-4 py-3"
                    >
                        <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-strong)]" weight="duotone" />
                        <span className="text-sm leading-7 text-[var(--ink-soft)] md:text-[15px]">{item}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export function ServiceDetailPageTemplate({
    basePath,
    contactHref,
    service,
    otherServices,
    labels,
    headerProps,
    footerProps,
}: ServiceDetailPageTemplateProps) {
    if (!service) {
        return (
            <div className="min-h-screen public-shell">
                <Header {...headerProps} />
                <main id="main-content" className="flex-1 px-4 pb-20 pt-28 md:pt-32">
                    <Container size="md">
                        <PublicStatePanel
                            icon={MagnifyingGlass}
                            title={labels.notFoundTitle}
                            action={(
                                <Button asChild>
                                    <Link href={basePath}>{labels.viewAllLabel}</Link>
                                </Button>
                            )}
                        />
                    </Container>
                </main>
                <Footer {...footerProps} />
            </div>
        );
    }

    const heroIcon = React.createElement(serviceIconMap[service.iconKey], {
        className: "h-6 w-6",
        weight: "duotone",
    });

    const heroSecondaryPanel = service.sections.slice(0, 2).map((section) => (
        <div key={section.title} className="public-panel-muted rounded-[1.85rem] p-5">
            <p className="text-lg text-[var(--ink)]">{section.title}</p>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-[var(--ink-soft)]">
                {section.items.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    ));

    return (
        <div className="min-h-screen public-shell">
            <Header {...headerProps} />
            <main id="main-content" className="flex-1 pb-20 pt-24 md:pt-28">
                <Container className="space-y-8 md:space-y-10">
                    <PublicBreadcrumbBar
                        items={[
                            { label: labels.allServicesLabel, href: basePath },
                            { label: service.title },
                        ]}
                    />

                    <PublicRouteHero
                        badge={service.id}
                        title={service.title}
                        description={service.description}
                        secondaryPanel={heroSecondaryPanel}
                        actions={(
                            <div className="flex items-center gap-3 rounded-[1.3rem] border border-[rgba(26,72,164,0.1)] bg-white/72 px-4 py-3 text-[var(--ink)] shadow-[var(--shadow-xs)]">
                                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.12)] text-[var(--accent-strong)]">
                                    {heroIcon}
                                </div>
                                <span className="text-sm font-semibold tracking-[0.14em] text-[var(--ink-muted)] uppercase">
                                    {service.id}
                                </span>
                            </div>
                        )}
                    />
                </Container>

                <div className="mt-10 md:mt-12">
                    <PublicRouteFrame
                        asideSticky
                        main={(
                            <div className="space-y-6">
                                {service.sections.map((section) => (
                                    <ServiceSectionCard
                                        key={section.title}
                                        serviceIconKey={service.iconKey}
                                        title={section.title}
                                        items={section.items}
                                    />
                                ))}
                            </div>
                        )}
                        aside={(
                            <div className="space-y-6">
                                <section className="public-panel rounded-[2rem] p-5">
                                    <h2 className="text-[1.7rem] text-[var(--ink)]">
                                        {labels.workingProcessTitle}
                                    </h2>
                                    <div className="mt-5 space-y-4">
                                        {service.process.map((step, index) => (
                                            <div
                                                key={`${step.step}-${step.title}`}
                                                className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(26,72,164,0.08)] bg-white/75 p-4"
                                            >
                                                {index < service.process.length - 1 && (
                                                    <span className="absolute left-[1.45rem] top-[3.4rem] h-[calc(100%-2.2rem)] w-px bg-[linear-gradient(180deg,rgba(23,88,216,0.22),transparent)]" />
                                                )}
                                                <div className="flex gap-3">
                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-bold text-white">
                                                        {step.step}
                                                    </span>
                                                    <div className="space-y-1">
                                                        <p className="text-base text-[var(--ink)]">{step.title}</p>
                                                        <p className="text-sm leading-7 text-[var(--ink-soft)]">
                                                            {step.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="public-panel-contrast rounded-[2rem] p-5">
                                    <h2 className="text-[1.7rem] text-white">
                                        {labels.contactConsultationTitle}
                                    </h2>
                                    <p className="mt-4 text-sm leading-7 text-white/72">
                                        {labels.contactConsultationDescription}
                                    </p>
                                    <div className="mt-6 space-y-3">
                                        <Button asChild fullWidth size="lg">
                                            <Link href={contactHref}>
                                                {labels.sendInquiryLabel}
                                            </Link>
                                        </Button>
                                        <Button asChild fullWidth size="lg" variant="secondary">
                                            <a href="tel:19001234">
                                                <PhoneCall className="mr-2 h-4 w-4" weight="bold" />
                                                {labels.hotlineLabel}
                                            </a>
                                        </Button>
                                    </div>
                                </section>
                            </div>
                        )}
                    />
                </div>

                {otherServices.length > 0 && (
                    <section className="mt-12 md:mt-16">
                        <Container className="space-y-6">
                            <h2 className="text-[2.2rem] text-[var(--ink)]">{labels.otherServicesTitle}</h2>
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {otherServices.slice(0, 3).map((item) => {
                                    const relatedIcon = React.createElement(serviceIconMap[item.iconKey], {
                                        className: "h-6 w-6",
                                        weight: "duotone",
                                    });

                                    return (
                                        <Link
                                            key={item.slug}
                                            href={`${basePath}/${item.slug}`}
                                            className="group block"
                                        >
                                            <article className="interactive-card public-panel rounded-[2rem] p-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.1)] text-[var(--accent-strong)]">
                                                        {relatedIcon}
                                                    </div>
                                                    <ArrowUpRight className="h-5 w-5 text-[var(--accent-strong)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" weight="bold" />
                                                </div>
                                                <h3 className="mt-5 text-[1.7rem] text-[var(--ink)]">{item.title}</h3>
                                                <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--ink-soft)]">
                                                    {item.description}
                                                </p>
                                            </article>
                                        </Link>
                                    );
                                })}
                            </div>
                        </Container>
                    </section>
                )}
            </main>
            <Footer {...footerProps} />
        </div>
    );
}

export default ServiceDetailPageTemplate;
