export interface LandingPageSelection {
    campaignSlug: string;
    programSlug?: string | null;
}

export const LANDING_SELECTION_COOKIE = "landing_page_selection";

const DIRECT_LANDING_ROUTE_BY_CAMPAIGN: Record<string, string> = {
    "AICBQT05-26": "/ai-ptdl-cbqt",
};

export const landingSelectionCookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/landing-page",
    maxAge: 60 * 60 * 24 * 30,
};

export function getDirectLandingPath(campaignSlug: string) {
    return DIRECT_LANDING_ROUTE_BY_CAMPAIGN[campaignSlug] || null;
}

export function isDirectLandingCampaign(campaignSlug: string) {
    return !!getDirectLandingPath(campaignSlug);
}

export function parseLandingPageSelection(value?: string | null): LandingPageSelection | null {
    if (!value?.trim()) {
        return null;
    }

    try {
        const parsed = JSON.parse(value) as Partial<LandingPageSelection>;
        if (typeof parsed.campaignSlug !== "string" || !parsed.campaignSlug.trim()) {
            return null;
        }

        return {
            campaignSlug: parsed.campaignSlug.trim(),
            programSlug: typeof parsed.programSlug === "string" && parsed.programSlug.trim()
                ? parsed.programSlug.trim()
                : undefined,
        };
    } catch {
        return null;
    }
}

export function serializeLandingPageSelection(selection: LandingPageSelection) {
    return JSON.stringify({
        campaignSlug: selection.campaignSlug.trim(),
        programSlug: selection.programSlug?.trim() || undefined,
    });
}
