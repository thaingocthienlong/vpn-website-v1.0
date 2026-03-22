"use client";

import * as React from "react";
import { Footer, Header, Container } from "@/components/layout";
import {
    PublicBreadcrumbBar,
    PublicRouteFrame,
    PublicRouteHero,
    type BreadcrumbItem,
} from "@/components/route-shell";

interface NewsPageShellProps {
    breadcrumbs?: BreadcrumbItem[];
    badge?: string;
    title?: string;
    description?: string;
    secondaryPanel?: React.ReactNode;
    controls?: React.ReactNode;
    main: React.ReactNode;
    aside?: React.ReactNode;
    asideSticky?: boolean;
}

export function NewsPageShell({
    breadcrumbs = [],
    badge,
    title,
    description,
    secondaryPanel,
    controls,
    main,
    aside,
    asideSticky = true,
}: NewsPageShellProps) {
    const hasHero = Boolean(badge || title || description || secondaryPanel);

    return (
        <div className="min-h-screen public-shell">
            <Header />
            <main id="main-content" className="flex-1 pb-20 pt-24 md:pt-28">
                <Container className="space-y-6 md:space-y-8">
                    {breadcrumbs.length > 0 && <PublicBreadcrumbBar items={breadcrumbs} />}
                    {hasHero && (
                        <PublicRouteHero
                            badge={badge}
                            title={title}
                            description={description}
                            secondaryPanel={secondaryPanel}
                        />
                    )}
                    {controls}
                </Container>

                <div className="mt-8 md:mt-10">
                    <PublicRouteFrame main={main} aside={aside} asideSticky={asideSticky} />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default NewsPageShell;
