"use client";

import * as React from "react";
import { Footer, Header, Container } from "@/components/layout";
import {
    PublicBreadcrumbBar,
    PublicRouteFrame,
    PublicRouteHero,
    type BreadcrumbItem,
} from "@/components/route-shell";

export interface PublicPageShellProps {
    breadcrumbs?: BreadcrumbItem[];
    badge?: string;
    title?: string;
    description?: string;
    actions?: React.ReactNode;
    secondaryPanel?: React.ReactNode;
    heroVariant?: "light" | "dark";
    controls?: React.ReactNode;
    main: React.ReactNode;
    aside?: React.ReactNode;
    asideSticky?: boolean;
    mainClassName?: string;
    asideClassName?: string;
}

export function PublicPageShell({
    breadcrumbs = [],
    badge,
    title,
    description,
    actions,
    secondaryPanel,
    heroVariant = "light",
    controls,
    main,
    aside,
    asideSticky = true,
    mainClassName,
    asideClassName,
}: PublicPageShellProps) {
    const hasHero = Boolean(badge || title || description || actions || secondaryPanel);

    return (
        <div className="min-h-screen public-shell flex flex-col">
            <Header />
            <main id="main-content" className="public-main-offset flex-1 pb-20">
                <Container className="space-y-6 md:space-y-8">
                    {breadcrumbs.length > 0 && <PublicBreadcrumbBar items={breadcrumbs} />}
                    {hasHero && (
                        <PublicRouteHero
                            badge={badge}
                            title={title}
                            description={description}
                            actions={actions}
                            secondaryPanel={secondaryPanel}
                            variant={heroVariant}
                        />
                    )}
                    {controls}
                </Container>

                <div className="mt-8 md:mt-10">
                    {aside ? (
                        <PublicRouteFrame
                            main={main}
                            aside={aside}
                            asideSticky={asideSticky}
                            mainClassName={mainClassName}
                            asideClassName={asideClassName}
                        />
                    ) : (
                        <Container className={mainClassName}>{main}</Container>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default PublicPageShell;
