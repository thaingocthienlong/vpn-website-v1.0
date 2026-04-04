import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LandingCampaignClient } from "@/components/landing-page/LandingCampaignClient";
import { LandingSelectorPage } from "@/components/landing-page/LandingSelectorPage";
import {
    getPublishedLandingCampaigns,
    getPublishedSelectorLandingCampaignBySlug,
} from "@/lib/services/landing-pages";
import { getSiteLayout } from "@/lib/services/site-content";
import {
    LANDING_SELECTION_COOKIE,
    isDirectLandingCampaign,
    parseLandingPageSelection,
} from "@/lib/landing-page/selection";

const defaultMetadata: Metadata = {
    title: "Landing Page | Viện Phương Nam",
    description: "Chọn landing campaign phù hợp với chương trình đào tạo và tư vấn của Viện Phương Nam.",
};

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const selection = parseLandingPageSelection(cookieStore.get(LANDING_SELECTION_COOKIE)?.value);

    if (!selection || isDirectLandingCampaign(selection.campaignSlug)) {
        return defaultMetadata;
    }

    const data = await getPublishedSelectorLandingCampaignBySlug(selection.campaignSlug, selection.programSlug);
    if (!data) {
        return defaultMetadata;
    }

    return {
        title: data.campaign.seoTitle || `${data.campaign.name} | Landing Page`,
        description: data.campaign.seoDescription || data.activeProgram.subtitle || data.campaign.selectorDescription || defaultMetadata.description,
        keywords: data.campaign.seoKeywords || undefined,
    };
}

export default async function LandingSelectorRoute() {
    const cookieStore = await cookies();
    const selection = parseLandingPageSelection(cookieStore.get(LANDING_SELECTION_COOKIE)?.value);
    const [siteLayout, selectedData] = await Promise.all([
        getSiteLayout("vi"),
        selection && !isDirectLandingCampaign(selection.campaignSlug)
            ? getPublishedSelectorLandingCampaignBySlug(selection.campaignSlug, selection.programSlug)
            : Promise.resolve(null),
    ]);

    if (selectedData) {
        return (
            <LandingCampaignClient
                data={selectedData}
                siteLayout={siteLayout}
                mode="selector"
                homeHref="/landing-page"
            />
        );
    }

    const campaigns = await getPublishedLandingCampaigns();

    return (
        <LandingSelectorPage
            campaigns={campaigns}
            siteLayout={siteLayout}
            clearSelectionOnLoad={!!selection}
        />
    );
}
