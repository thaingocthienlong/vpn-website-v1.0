import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AboutDatabaseLandingPage from "@/components/about/AboutDatabaseLandingPage";
import { getVietnameseAboutLandingContent } from "@/lib/services/about-content";

export async function generateMetadata(): Promise<Metadata> {
    const content = await getVietnameseAboutLandingContent();

    return {
        title: content?.metaTitle || content?.badge || "Giới thiệu chung",
        description: content?.metaDescription || content?.description || "Giới thiệu chung",
    };
}

export default async function AboutPage() {
    const content = await getVietnameseAboutLandingContent();

    if (!content) {
        notFound();
    }

    return (
        <AboutDatabaseLandingPage
            {...content}
            hrefs={{
                visionMission: "/gioi-thieu/tam-nhin-su-menh",
                contact: "/lien-he",
            }}
        />
    );
}
