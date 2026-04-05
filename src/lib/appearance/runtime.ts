import type { CSSProperties } from "react";
import type { AppearanceTargetId } from "@/lib/appearance/schema";

const APPEARANCE_CSS_VARIABLES = {
    surfaceBackground: "--appearance-surface-background",
    titleColor: "--appearance-title-color",
    bodyColor: "--appearance-body-color",
    badgeColor: "--appearance-badge-color",
    accentColor: "--appearance-accent-color",
    titleSize: "--appearance-title-size",
    bodySize: "--appearance-body-size",
} as const;

type AppearanceColorRole = "title" | "body" | "badge" | "accent";
type AppearanceSizeRole = "title" | "body";

function cssVar(variable: string, fallback: string) {
    return `var(${variable}, ${fallback})`;
}

export function getAppearanceCssValue(
    role: "surfaceBackground" | "titleColor" | "bodyColor" | "badgeColor" | "accentColor" | "titleSize" | "bodySize",
    fallback: string,
) {
    return cssVar(APPEARANCE_CSS_VARIABLES[role], fallback);
}

export function getAppearanceTargetProps(targetId?: AppearanceTargetId) {
    if (!targetId) {
        return {};
    }

    return {
        "data-appearance-target": targetId,
    } as const;
}

export function mergeAppearanceStyles(
    ...styles: Array<CSSProperties | undefined | null>
): CSSProperties | undefined {
    const merged = Object.assign({}, ...styles.filter(Boolean));
    return Object.keys(merged).length > 0 ? merged : undefined;
}

export function getAppearanceSurfaceStyle(fallbackBackground?: string): CSSProperties | undefined {
    if (!fallbackBackground) {
        return undefined;
    }

    return {
        background: cssVar(APPEARANCE_CSS_VARIABLES.surfaceBackground, fallbackBackground),
    };
}

export function getAppearanceTextStyle(options: {
    colorRole?: AppearanceColorRole;
    colorFallback?: string;
    sizeRole?: AppearanceSizeRole;
    sizeFallback?: string;
}): CSSProperties | undefined {
    const style: CSSProperties = {};

    if (options.colorRole && options.colorFallback) {
        const variable = {
            title: APPEARANCE_CSS_VARIABLES.titleColor,
            body: APPEARANCE_CSS_VARIABLES.bodyColor,
            badge: APPEARANCE_CSS_VARIABLES.badgeColor,
            accent: APPEARANCE_CSS_VARIABLES.accentColor,
        }[options.colorRole];

        style.color = cssVar(variable, options.colorFallback);
    }

    if (options.sizeRole && options.sizeFallback) {
        const variable = options.sizeRole === "title"
            ? APPEARANCE_CSS_VARIABLES.titleSize
            : APPEARANCE_CSS_VARIABLES.bodySize;

        style.fontSize = cssVar(variable, options.sizeFallback);
    }

    return Object.keys(style).length > 0 ? style : undefined;
}
