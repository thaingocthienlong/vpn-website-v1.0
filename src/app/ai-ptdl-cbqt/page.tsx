import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LandingCampaignClient } from "@/components/landing-page/LandingCampaignClient";
import { getPublishedLandingCampaignBySlug } from "@/lib/services/landing-pages";
import { getSiteLayout } from "@/lib/services/site-content";

const DIRECT_CAMPAIGN_SLUG = "AICBQT05-26";
const DIRECT_PROGRAM_SLUG = "AICBQT05.26";

async function getDirectLandingPageData() {
    return getPublishedLandingCampaignBySlug(DIRECT_CAMPAIGN_SLUG, DIRECT_PROGRAM_SLUG);
}

export async function generateMetadata(): Promise<Metadata> {
    const data = await getDirectLandingPageData();

    if (!data || data.activeProgramKey !== DIRECT_PROGRAM_SLUG) {
        return {
            title: "Landing Page | Viện Phương Nam",
        };
    }

    return {
        title: data.campaign.seoTitle || `${data.campaign.name} | Landing Page`,
        description: data.campaign.seoDescription || data.activeProgram.subtitle || data.campaign.selectorDescription || undefined,
        keywords: data.campaign.seoKeywords || undefined,
    };
}

export default async function DirectLandingCampaignRoute() {
    const [data, siteLayout] = await Promise.all([
        getDirectLandingPageData(),
        getSiteLayout("vi"),
    ]);

    if (!data || data.activeProgramKey !== DIRECT_PROGRAM_SLUG) {
        notFound();
    }

    return (
        <LandingCampaignClient
            data={data}
            siteLayout={siteLayout}
            mode="single"
            homeHref="/ai-ptdl-cbqt"
        />
    );
}
