export const APPEARANCE_CONFIG_GROUP = "appearance";

export const APPEARANCE_TOKEN_GROUPS = [
    "surfaceBackground",
    "titleColor",
    "bodyColor",
    "badgeColor",
    "accentColor",
    "titleSize",
    "bodySize",
] as const;

export type AppearanceTokenGroup = (typeof APPEARANCE_TOKEN_GROUPS)[number];

export type AppearanceTokens = Record<AppearanceTokenGroup, Record<string, string>>;

export interface AppearancePreset {
    id: string;
    label: string;
    surfaceBackground?: string;
    titleColor?: string;
    bodyColor?: string;
    badgeColor?: string;
    accentColor?: string;
    titleSize?: string;
    bodySize?: string;
}

export type AppearancePresetMap = Record<string, AppearancePreset>;

export const APPEARANCE_TARGET_IDS = [
    "homepage.section.hero.surface",
    "homepage.section.hero.content",
    "homepage.section.training.surface",
    "homepage.section.training.header",
    "homepage.section.services.surface",
    "homepage.section.services.header",
    "homepage.section.partners.surface",
    "homepage.section.partners.header",
    "homepage.section.news.surface",
    "homepage.section.news.header",
    "homepage.section.gallery.surface",
    "homepage.section.gallery.header",
    "homepage.endcap.surface",
    "homepage.endcap.header",
    "page.hero.default",
    "page.hero.news-listing",
    "page.hero.services-listing",
    "page.hero.training-listing",
    "page.hero.course-detail",
    "page.hero.course-registration",
    "page.hero.staff-directory",
    "page.hero.partners",
    "card.news.default",
    "card.news.feature",
    "card.service.default",
    "card.service.listing",
    "card.staff.default",
    "card.staff.large",
    "card.review.default",
    "card.review.feature",
    "card.course.default",
    "card.course.feature",
    "card.course.compact",
    "card.partner.logo",
    "card.partner.grid",
    "panel.public-state.default",
    "panel.public-state.compact",
] as const;

export type AppearanceTargetId = (typeof APPEARANCE_TARGET_IDS)[number];

export type AppearanceAssignments = Partial<Record<AppearanceTargetId, string>>;

export interface AppearanceTargetDefinition {
    id: AppearanceTargetId;
    family: string;
    label: string;
    description: string;
    defaultPresetId: string;
}

export interface AppearanceRuntimeConfig {
    tokens: AppearanceTokens;
    presets: AppearancePresetMap;
    assignments: AppearanceAssignments;
}

export interface AppearanceAdminPayload extends AppearanceRuntimeConfig {
    tokenGroups: AppearanceTokenGroupDefinition[];
    targets: AppearanceTargetDefinition[];
}

export interface AppearanceTokenGroupDefinition {
    id: AppearanceTokenGroup;
    label: string;
    description: string;
    input: "color" | "background" | "size";
}

export const APPEARANCE_TOKEN_GROUP_DEFINITIONS: AppearanceTokenGroupDefinition[] = [
    {
        id: "surfaceBackground",
        label: "Surface Background",
        description: "Solid fills or gradients used for cards, bands, and page heroes.",
        input: "background",
    },
    {
        id: "titleColor",
        label: "Title Color",
        description: "Headline text color.",
        input: "color",
    },
    {
        id: "bodyColor",
        label: "Body Color",
        description: "Subtitle and supporting copy color.",
        input: "color",
    },
    {
        id: "badgeColor",
        label: "Badge Color",
        description: "Kicker, eyebrow, and small meta text color.",
        input: "color",
    },
    {
        id: "accentColor",
        label: "Accent Color",
        description: "Icon, divider, and CTA accent color.",
        input: "color",
    },
    {
        id: "titleSize",
        label: "Title Size",
        description: "Headline size. Prefer rem values or clamp() for responsiveness.",
        input: "size",
    },
    {
        id: "bodySize",
        label: "Body Size",
        description: "Subtitle and body size. Prefer rem values or clamp() for responsiveness.",
        input: "size",
    },
];

export const DEFAULT_APPEARANCE_TOKENS: AppearanceTokens = {
    surfaceBackground: {
        transparent: "transparent",
        sectionBlue: "linear-gradient(180deg,rgba(245,249,252,0.32),rgba(229,238,245,0.14))",
        sectionDark: "linear-gradient(180deg,#163049 0%,#0f2135 100%)",
        panelLight: "linear-gradient(180deg,rgba(252,254,255,0.92),rgba(241,247,251,0.86))",
        panelBlue: "linear-gradient(180deg,rgba(255,255,255,0.92),rgba(234,243,255,0.84))",
        panelDark: "linear-gradient(180deg,rgba(16,33,52,0.92),rgba(13,27,43,0.94))",
        heroLight: "linear-gradient(180deg,rgba(252,254,255,0.96),rgba(235,243,249,0.88))",
        mutedPanel: "rgba(237,243,249,0.96)",
    },
    titleColor: {
        ink: "var(--ink)",
        onDark: "var(--on-dark-heading)",
        accent: "var(--accent-strong)",
        white: "#ffffff",
    },
    bodyColor: {
        inkSoft: "var(--ink-soft)",
        inkMuted: "var(--ink-muted)",
        onDark: "var(--on-dark-body)",
        onDarkStrong: "rgba(244,248,252,0.86)",
        whiteSoft: "rgba(255,255,255,0.76)",
    },
    badgeColor: {
        inkMuted: "var(--ink-muted)",
        accent: "var(--accent-strong)",
        onDark: "var(--on-dark-meta)",
        whiteSoft: "rgba(255,255,255,0.86)",
    },
    accentColor: {
        accent: "var(--accent-strong)",
        accentBase: "var(--accent)",
        accentSoft: "rgba(23,88,216,0.28)",
        onDark: "var(--on-dark-meta)",
        white: "rgba(255,255,255,0.9)",
    },
    titleSize: {
        section: "clamp(2rem,4vw,3.05rem)",
        hero: "clamp(2.35rem,6vw,3.85rem)",
        homeHero: "clamp(3.15rem,10vw,4.9rem)",
        card: "1.8rem",
        cardFeature: "2.15rem",
        cardCompact: "1.35rem",
        state: "2rem",
        stateCompact: "1.45rem",
        partner: "1.25rem",
        staff: "1.25rem",
        staffLarge: "1.75rem",
        servicesListing: "2rem",
        newsFeature: "1.08rem",
        endcap: "clamp(2.65rem,6vw,3.5rem)",
    },
    bodySize: {
        section: "clamp(0.96rem,1vw,1rem)",
        hero: "clamp(0.98rem,1vw,1.02rem)",
        card: "0.96rem",
        cardCompact: "0.875rem",
        state: "1rem",
        stateCompact: "0.95rem",
        partner: "0.875rem",
        endcap: "1rem",
    },
};

export const DEFAULT_APPEARANCE_PRESETS: AppearancePresetMap = {
    "homepage-hero": {
        id: "homepage-hero",
        label: "Homepage Hero",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.homeHero",
        bodySize: "bodySize.hero",
    },
    "section-light": {
        id: "section-light",
        label: "Section / Light",
        surfaceBackground: "surfaceBackground.transparent",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.section",
        bodySize: "bodySize.section",
    },
    "section-dark": {
        id: "section-dark",
        label: "Section / Dark",
        surfaceBackground: "surfaceBackground.sectionDark",
        titleColor: "titleColor.onDark",
        bodyColor: "bodyColor.onDark",
        badgeColor: "badgeColor.onDark",
        accentColor: "accentColor.white",
        titleSize: "titleSize.section",
        bodySize: "bodySize.section",
    },
    "page-hero-light": {
        id: "page-hero-light",
        label: "Page Hero / Light",
        surfaceBackground: "surfaceBackground.heroLight",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.hero",
        bodySize: "bodySize.hero",
    },
    "card-light": {
        id: "card-light",
        label: "Card / Light",
        surfaceBackground: "surfaceBackground.panelBlue",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.card",
        bodySize: "bodySize.card",
    },
    "card-light-feature": {
        id: "card-light-feature",
        label: "Card / Light Feature",
        surfaceBackground: "surfaceBackground.panelBlue",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.cardFeature",
        bodySize: "bodySize.card",
    },
    "card-light-compact": {
        id: "card-light-compact",
        label: "Card / Compact",
        surfaceBackground: "surfaceBackground.panelBlue",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.cardCompact",
        bodySize: "bodySize.cardCompact",
    },
    "card-dark": {
        id: "card-dark",
        label: "Card / Dark",
        surfaceBackground: "surfaceBackground.panelDark",
        titleColor: "titleColor.onDark",
        bodyColor: "bodyColor.onDark",
        badgeColor: "badgeColor.onDark",
        accentColor: "accentColor.white",
        titleSize: "titleSize.servicesListing",
        bodySize: "bodySize.card",
    },
    "staff-default": {
        id: "staff-default",
        label: "Staff / Default",
        surfaceBackground: "surfaceBackground.panelLight",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.staff",
        bodySize: "bodySize.card",
    },
    "staff-large": {
        id: "staff-large",
        label: "Staff / Large",
        surfaceBackground: "surfaceBackground.panelLight",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.staffLarge",
        bodySize: "bodySize.card",
    },
    "partner-logo": {
        id: "partner-logo",
        label: "Partner Logo",
        surfaceBackground: "surfaceBackground.panelLight",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.partner",
        bodySize: "bodySize.partner",
    },
    "state-default": {
        id: "state-default",
        label: "State Panel / Default",
        surfaceBackground: "surfaceBackground.mutedPanel",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.state",
        bodySize: "bodySize.state",
    },
    "state-compact": {
        id: "state-compact",
        label: "State Panel / Compact",
        surfaceBackground: "surfaceBackground.mutedPanel",
        titleColor: "titleColor.ink",
        bodyColor: "bodyColor.inkSoft",
        badgeColor: "badgeColor.inkMuted",
        accentColor: "accentColor.accent",
        titleSize: "titleSize.stateCompact",
        bodySize: "bodySize.stateCompact",
    },
    "homepage-endcap": {
        id: "homepage-endcap",
        label: "Homepage Endcap",
        surfaceBackground: "surfaceBackground.sectionDark",
        titleColor: "titleColor.onDark",
        bodyColor: "bodyColor.onDarkStrong",
        badgeColor: "badgeColor.onDark",
        accentColor: "accentColor.white",
        titleSize: "titleSize.endcap",
        bodySize: "bodySize.endcap",
    },
};

export const APPEARANCE_TARGETS: AppearanceTargetDefinition[] = [
    {
        id: "homepage.section.hero.surface",
        family: "Homepage",
        label: "Hero / Surface",
        description: "Main homepage hero background.",
        defaultPresetId: "homepage-hero",
    },
    {
        id: "homepage.section.hero.content",
        family: "Homepage",
        label: "Hero / Title & Subtitle",
        description: "Homepage hero heading copy.",
        defaultPresetId: "homepage-hero",
    },
    {
        id: "homepage.section.training.surface",
        family: "Homepage",
        label: "Training / Surface",
        description: "Training section wrapper.",
        defaultPresetId: "section-light",
    },
    {
        id: "homepage.section.training.header",
        family: "Homepage",
        label: "Training / Header",
        description: "Training section badge, title, and subtitle.",
        defaultPresetId: "section-light",
    },
    {
        id: "homepage.section.services.surface",
        family: "Homepage",
        label: "Services / Surface",
        description: "Services section wrapper.",
        defaultPresetId: "section-dark",
    },
    {
        id: "homepage.section.services.header",
        family: "Homepage",
        label: "Services / Header",
        description: "Services section badge, title, and subtitle.",
        defaultPresetId: "section-dark",
    },
    {
        id: "homepage.section.partners.surface",
        family: "Homepage",
        label: "Partners / Surface",
        description: "Partners section wrapper.",
        defaultPresetId: "section-light",
    },
    {
        id: "homepage.section.partners.header",
        family: "Homepage",
        label: "Partners / Header",
        description: "Partners section badge, title, and subtitle.",
        defaultPresetId: "section-light",
    },
    {
        id: "homepage.section.news.surface",
        family: "Homepage",
        label: "News / Surface",
        description: "News section wrapper.",
        defaultPresetId: "section-light",
    },
    {
        id: "homepage.section.news.header",
        family: "Homepage",
        label: "News / Header",
        description: "News section badge, title, and subtitle.",
        defaultPresetId: "section-light",
    },
    {
        id: "homepage.section.gallery.surface",
        family: "Homepage",
        label: "Gallery / Surface",
        description: "Gallery section wrapper.",
        defaultPresetId: "section-light",
    },
    {
        id: "homepage.section.gallery.header",
        family: "Homepage",
        label: "Gallery / Header",
        description: "Gallery section badge, title, and subtitle.",
        defaultPresetId: "section-light",
    },
    {
        id: "homepage.endcap.surface",
        family: "Homepage",
        label: "Endcap / Surface",
        description: "Homepage contact and CTA band background.",
        defaultPresetId: "homepage-endcap",
    },
    {
        id: "homepage.endcap.header",
        family: "Homepage",
        label: "Endcap / Header",
        description: "Homepage CTA headline and subtitle.",
        defaultPresetId: "homepage-endcap",
    },
    {
        id: "page.hero.default",
        family: "Page Heroes",
        label: "Default Hero",
        description: "Shared default for public page hero bands.",
        defaultPresetId: "page-hero-light",
    },
    {
        id: "page.hero.news-listing",
        family: "Page Heroes",
        label: "News Listing Hero",
        description: "Top hero on /tin-tuc and /en/news.",
        defaultPresetId: "page-hero-light",
    },
    {
        id: "page.hero.services-listing",
        family: "Page Heroes",
        label: "Services Listing Hero",
        description: "Top hero on /dich-vu and /en/services.",
        defaultPresetId: "page-hero-light",
    },
    {
        id: "page.hero.training-listing",
        family: "Page Heroes",
        label: "Training Listing Hero",
        description: "Top hero on /dao-tao and /en/training.",
        defaultPresetId: "page-hero-light",
    },
    {
        id: "page.hero.course-detail",
        family: "Page Heroes",
        label: "Course Detail Hero",
        description: "Hero on individual training pages.",
        defaultPresetId: "page-hero-light",
    },
    {
        id: "page.hero.course-registration",
        family: "Page Heroes",
        label: "Course Registration Hero",
        description: "Hero on course registration pages.",
        defaultPresetId: "page-hero-light",
    },
    {
        id: "page.hero.staff-directory",
        family: "Page Heroes",
        label: "Staff Directory Hero",
        description: "Hero for about/staff directory pages.",
        defaultPresetId: "page-hero-light",
    },
    {
        id: "page.hero.partners",
        family: "Page Heroes",
        label: "Partners Hero",
        description: "Hero for partner listing pages.",
        defaultPresetId: "page-hero-light",
    },
    {
        id: "card.news.default",
        family: "Cards",
        label: "News Card / Default",
        description: "Standard news cards.",
        defaultPresetId: "card-light",
    },
    {
        id: "card.news.feature",
        family: "Cards",
        label: "News Card / Feature",
        description: "Featured or larger news cards.",
        defaultPresetId: "card-light-feature",
    },
    {
        id: "card.service.default",
        family: "Cards",
        label: "Service Card / Default",
        description: "Shared service cards.",
        defaultPresetId: "card-light",
    },
    {
        id: "card.service.listing",
        family: "Cards",
        label: "Service Card / Listing",
        description: "Large cards on the services listing page.",
        defaultPresetId: "card-light-feature",
    },
    {
        id: "card.staff.default",
        family: "Cards",
        label: "Staff Card / Default",
        description: "Default staff cards.",
        defaultPresetId: "staff-default",
    },
    {
        id: "card.staff.large",
        family: "Cards",
        label: "Staff Card / Large",
        description: "Featured staff cards.",
        defaultPresetId: "staff-large",
    },
    {
        id: "card.review.default",
        family: "Cards",
        label: "Review Card / Default",
        description: "Default testimonial cards.",
        defaultPresetId: "card-light",
    },
    {
        id: "card.review.feature",
        family: "Cards",
        label: "Review Card / Feature",
        description: "Featured testimonial cards.",
        defaultPresetId: "card-light-feature",
    },
    {
        id: "card.course.default",
        family: "Cards",
        label: "Course Card / Default",
        description: "Default course cards.",
        defaultPresetId: "card-light",
    },
    {
        id: "card.course.feature",
        family: "Cards",
        label: "Course Card / Feature",
        description: "Featured course cards.",
        defaultPresetId: "card-light-feature",
    },
    {
        id: "card.course.compact",
        family: "Cards",
        label: "Course Card / Compact",
        description: "Compact course cards.",
        defaultPresetId: "card-light-compact",
    },
    {
        id: "card.partner.logo",
        family: "Cards",
        label: "Partner Logo Card",
        description: "Reusable partner logo cards.",
        defaultPresetId: "partner-logo",
    },
    {
        id: "card.partner.grid",
        family: "Cards",
        label: "Partner Grid Card",
        description: "Partner cards inside the public partner listing page.",
        defaultPresetId: "partner-logo",
    },
    {
        id: "panel.public-state.default",
        family: "Panels",
        label: "State Panel / Default",
        description: "Generic public state panel.",
        defaultPresetId: "state-default",
    },
    {
        id: "panel.public-state.compact",
        family: "Panels",
        label: "State Panel / Compact",
        description: "Compact public state panel.",
        defaultPresetId: "state-compact",
    },
];

export const DEFAULT_APPEARANCE_ASSIGNMENTS: AppearanceAssignments = Object.fromEntries(
    APPEARANCE_TARGETS.map((target) => [target.id, target.defaultPresetId]),
) as AppearanceAssignments;

const COLOR_TOKEN_PATTERN = /^(#([0-9a-fA-F]{3,8})|rgba?\([^<>]+\)|hsla?\([^<>]+\)|var\(--[\w-]+\)|transparent|currentColor)$/;
const BACKGROUND_TOKEN_PATTERN = /^(transparent|none|#([0-9a-fA-F]{3,8})|rgba?\([^<>]+\)|hsla?\([^<>]+\)|var\(--[\w-]+\)|linear-gradient\([^<>]+\)|radial-gradient\([^<>]+\))$/;
const SIZE_TOKEN_PATTERN = /^(clamp\([^<>]+\)|min\([^<>]+\)|max\([^<>]+\)|calc\([^<>]+\)|-?\d*\.?\d+(px|rem|em|vw|vh|%)?)$/;

const PRESET_FIELD_GROUPS: Record<Exclude<keyof AppearancePreset, "id" | "label">, AppearanceTokenGroup> = {
    surfaceBackground: "surfaceBackground",
    titleColor: "titleColor",
    bodyColor: "bodyColor",
    badgeColor: "badgeColor",
    accentColor: "accentColor",
    titleSize: "titleSize",
    bodySize: "bodySize",
};

function validateTokenValue(group: AppearanceTokenGroup, value: string) {
    const normalized = value.trim();
    if (!normalized) {
        return false;
    }

    if (group === "surfaceBackground") {
        return BACKGROUND_TOKEN_PATTERN.test(normalized);
    }

    if (group === "titleSize" || group === "bodySize") {
        return SIZE_TOKEN_PATTERN.test(normalized);
    }

    return COLOR_TOKEN_PATTERN.test(normalized);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

export function createDefaultAppearanceConfig(): AppearanceRuntimeConfig {
    return {
        tokens: structuredClone(DEFAULT_APPEARANCE_TOKENS),
        presets: structuredClone(DEFAULT_APPEARANCE_PRESETS),
        assignments: structuredClone(DEFAULT_APPEARANCE_ASSIGNMENTS),
    };
}

export function sanitizeAppearanceTokens(candidate: unknown): AppearanceTokens {
    const defaults = createDefaultAppearanceConfig().tokens;
    if (!isRecord(candidate)) {
        return defaults;
    }

    const nextTokens = structuredClone(defaults);

    for (const group of APPEARANCE_TOKEN_GROUPS) {
        const incomingGroup = candidate[group];
        if (!isRecord(incomingGroup)) {
            continue;
        }

        for (const [tokenId, tokenValue] of Object.entries(incomingGroup)) {
            const normalizedId = cleanString(tokenId);
            const normalizedValue = cleanString(tokenValue);

            if (!normalizedId || !validateTokenValue(group, normalizedValue)) {
                continue;
            }

            nextTokens[group][normalizedId] = normalizedValue;
        }
    }

    return nextTokens;
}

export function sanitizeAppearancePresets(candidate: unknown, tokens: AppearanceTokens): AppearancePresetMap {
    const defaults = createDefaultAppearanceConfig().presets;
    if (!isRecord(candidate)) {
        return defaults;
    }

    const nextPresets: AppearancePresetMap = structuredClone(defaults);

    for (const [presetId, presetValue] of Object.entries(candidate)) {
        if (!isRecord(presetValue)) {
            continue;
        }

        const normalizedId = cleanString(presetId);
        const label = cleanString(presetValue.label) || normalizedId;

        if (!normalizedId) {
            continue;
        }

        const nextPreset: AppearancePreset = {
            id: normalizedId,
            label,
        };

        (Object.entries(PRESET_FIELD_GROUPS) as [Exclude<keyof AppearancePreset, "id" | "label">, AppearanceTokenGroup][]).forEach(
            ([field, group]) => {
                const tokenRef = cleanString(presetValue[field]);
                if (!tokenRef) {
                    return;
                }

                const [tokenGroup, tokenId] = tokenRef.split(".");
                if (tokenGroup !== group || !tokenId || !tokens[group][tokenId]) {
                    return;
                }

                nextPreset[field] = tokenRef;
            },
        );

        nextPresets[normalizedId] = nextPreset;
    }

    return nextPresets;
}

export function sanitizeAppearanceAssignments(
    candidate: unknown,
    presets: AppearancePresetMap,
): AppearanceAssignments {
    const defaults = createDefaultAppearanceConfig().assignments;
    if (!isRecord(candidate)) {
        return defaults;
    }

    const nextAssignments: AppearanceAssignments = structuredClone(defaults);
    const validTargetIds = new Set<string>(APPEARANCE_TARGET_IDS);

    for (const [targetId, presetId] of Object.entries(candidate)) {
        if (!validTargetIds.has(targetId)) {
            continue;
        }

        const normalizedPresetId = cleanString(presetId);
        if (!normalizedPresetId || !presets[normalizedPresetId]) {
            continue;
        }

        nextAssignments[targetId as AppearanceTargetId] = normalizedPresetId;
    }

    return nextAssignments;
}

export function sanitizeAppearanceConfig(candidate: Partial<AppearanceRuntimeConfig> | null | undefined): AppearanceRuntimeConfig {
    const tokens = sanitizeAppearanceTokens(candidate?.tokens);
    const presets = sanitizeAppearancePresets(candidate?.presets, tokens);
    const assignments = sanitizeAppearanceAssignments(candidate?.assignments, presets);

    return {
        tokens,
        presets,
        assignments,
    };
}

export function getAppearanceAdminPayload(config: AppearanceRuntimeConfig): AppearanceAdminPayload {
    return {
        ...config,
        tokenGroups: APPEARANCE_TOKEN_GROUP_DEFINITIONS,
        targets: APPEARANCE_TARGETS,
    };
}
