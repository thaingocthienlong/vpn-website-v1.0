import * as React from "react";
import { cn } from "@/lib/utils";
import type { AppearanceTargetId } from "@/lib/appearance/schema";
import {
    getAppearanceSurfaceStyle,
    getAppearanceTargetProps,
    getAppearanceTextStyle,
} from "@/lib/appearance/runtime";

export interface PublicRouteHeroProps {
    badge?: string;
    title?: string;
    description?: string;
    actions?: React.ReactNode;
    secondaryPanel?: React.ReactNode;
    variant?: "light" | "dark";
    className?: string;
    appearanceTargetId?: AppearanceTargetId;
}

export function PublicRouteHero({
    badge,
    title,
    description,
    actions,
    secondaryPanel,
    variant = "light",
    className,
    appearanceTargetId,
}: PublicRouteHeroProps) {
    const isDark = variant === "dark";
    const hasSecondaryPanel = Boolean(secondaryPanel);
    const splitDescription = Boolean(description && !secondaryPanel);
    const surfaceFallback = isDark
        ? "linear-gradient(180deg,rgba(16,33,52,0.92),rgba(13,27,43,0.94))"
        : "linear-gradient(180deg,rgba(252,254,255,0.96),rgba(235,243,249,0.88))";

    return (
        <section
            className={cn(
                "public-band overflow-hidden rounded-[2.8rem] p-6 md:p-8 lg:p-10",
                isDark ? "public-panel-contrast" : "public-panel",
                className
            )}
            style={getAppearanceSurfaceStyle(surfaceFallback)}
            {...getAppearanceTargetProps(appearanceTargetId)}
        >
            <div
                className={cn(
                    "grid gap-8 md:gap-10",
                    hasSecondaryPanel && "lg:grid-cols-[1.04fr_0.96fr]",
                    !hasSecondaryPanel && splitDescription && "lg:grid-cols-[1.02fr_0.98fr] lg:items-end"
                )}
            >
                <div className={cn("space-y-4 md:space-y-5", !hasSecondaryPanel && !splitDescription && "max-w-4xl")}>
                    {badge && (
                        <div
                            className={cn("public-kicker", isDark && "border-white/12 bg-white/10 text-white/86")}
                            style={getAppearanceTextStyle({
                                colorRole: "badge",
                                colorFallback: isDark ? "rgba(255,255,255,0.86)" : "var(--ink-muted)",
                            })}
                        >
                            {badge}
                        </div>
                    )}

                    {title && (
                        <h1
                            className={cn(
                                "max-w-[14ch] font-heading text-[2.35rem] leading-[0.92] tracking-[-0.05em] md:text-[3.2rem] lg:text-[3.85rem]",
                                isDark ? "text-white" : "text-[var(--ink)]"
                            )}
                            style={getAppearanceTextStyle({
                                colorRole: "title",
                                colorFallback: isDark ? "#ffffff" : "var(--ink)",
                                sizeRole: "title",
                                sizeFallback: "clamp(2.35rem,6vw,3.85rem)",
                            })}
                        >
                            {title}
                        </h1>
                    )}

                    {description && !splitDescription && (
                        <p
                            className={cn(
                                "max-w-[60ch] text-base leading-8 md:text-[1.02rem]",
                                isDark ? "text-white/76" : "text-[var(--ink-soft)]"
                            )}
                            style={getAppearanceTextStyle({
                                colorRole: "body",
                                colorFallback: isDark ? "rgba(255,255,255,0.76)" : "var(--ink-soft)",
                                sizeRole: "body",
                                sizeFallback: "clamp(0.98rem,1vw,1.02rem)",
                            })}
                        >
                            {description}
                        </p>
                    )}

                    {actions && <div className="flex flex-wrap gap-3 pt-1">{actions}</div>}
                </div>

                {splitDescription && (
                    <div className="flex items-start gap-4 lg:justify-start">
                        <div className={cn("mt-2 h-14 w-px shrink-0 md:h-16", isDark ? "bg-white/18" : "bg-[rgba(23,88,216,0.22)]")} />
                        <p
                            className={cn(
                                "max-w-[36rem] text-[0.98rem] leading-8 md:text-[1.02rem]",
                                isDark ? "text-white/76" : "text-[var(--ink-soft)]"
                            )}
                            style={getAppearanceTextStyle({
                                colorRole: "body",
                                colorFallback: isDark ? "rgba(255,255,255,0.76)" : "var(--ink-soft)",
                                sizeRole: "body",
                                sizeFallback: "clamp(0.98rem,1vw,1.02rem)",
                            })}
                        >
                            {description}
                        </p>
                    </div>
                )}

                {hasSecondaryPanel && <div className="grid gap-4">{secondaryPanel}</div>}
            </div>
        </section>
    );
}

export default PublicRouteHero;
