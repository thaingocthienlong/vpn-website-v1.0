import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout";

export interface PublicRouteFrameProps {
    main: React.ReactNode;
    aside?: React.ReactNode;
    asideSticky?: boolean;
    className?: string;
    mainClassName?: string;
    asideClassName?: string;
}

export function PublicRouteFrame({
    main,
    aside,
    asideSticky = false,
    className,
    mainClassName,
    asideClassName,
}: PublicRouteFrameProps) {
    const hasAside = Boolean(aside);

    return (
        <Container>
            <div className={cn("grid gap-8", hasAside ? "lg:grid-cols-[minmax(0,1fr)_320px]" : "grid-cols-1", className)}>
                <div className={cn("min-w-0", mainClassName)}>{main}</div>
                {hasAside && (
                    <aside className={cn(asideSticky && "lg:sticky lg:top-28 lg:self-start", asideClassName)}>
                        {aside}
                    </aside>
                )}
            </div>
        </Container>
    );
}

export default PublicRouteFrame;
