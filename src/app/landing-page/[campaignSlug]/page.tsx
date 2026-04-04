import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LandingSelectionRedirect } from "@/components/landing-page/LandingSelectionRedirect";
import { getDirectLandingPath } from "@/lib/landing-page/selection";
import { getPublishedSelectorLandingCampaignBySlug } from "@/lib/services/landing-pages";

interface PageProps {
    params: Promise<{ campaignSlug: string }>;
    searchParams: Promise<{ program?: string | string[] }>;
}

function getRequestedProgramSlug(value?: string | string[]) {
    return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
    const { campaignSlug } = await params;
    const query = await searchParams;

    if (getDirectLandingPath(campaignSlug)) {
        return {
            title: "Redirecting | Viện Phương Nam",
        };
    }

    const data = await getPublishedSelectorLandingCampaignBySlug(campaignSlug, getRequestedProgramSlug(query.program));

    if (!data) {
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

export default async function LandingCampaignRoute({ params, searchParams }: PageProps) {
    const { campaignSlug } = await params;
    const query = await searchParams;
    const directLandingPath = getDirectLandingPath(campaignSlug);

    if (directLandingPath) {
        redirect(directLandingPath);
    }

    const data = await getPublishedSelectorLandingCampaignBySlug(campaignSlug, getRequestedProgramSlug(query.program));

    if (!data) {
        notFound();
    }

    return (
        <LandingSelectionRedirect
            campaignSlug={campaignSlug}
            programSlug={data.activeProgramKey}
        />
    );
}
