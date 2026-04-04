import { getTranslations, setRequestLocale } from "next-intl/server";
import StaffDirectoryPage, { type StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";
import { getOrgStructureDirectoryModel } from "@/lib/services/org-structure";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function OrgStructurePage({ params }: PageProps) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    const [tStructure, tCommon] = await Promise.all([
        getTranslations({ locale, namespace: "about.structure" }),
        getTranslations({ locale, namespace: "common" }),
    ]);

    let featuredMembers: StaffCardPerson[] = [];
    let groups: StaffDirectoryGroup[] = [];

    try {
        ({ featuredMembers, groups } = await getOrgStructureDirectoryModel(resolvedLocale));
    } catch (error) {
        console.error("Failed to load about structure page data:", error);
    }

    return (
        <StaffDirectoryPage
            badge={tStructure("title")}
            title={tStructure("title")}
            description={tStructure("description")}
            featuredTitle={featuredMembers.length > 0 ? (resolvedLocale === "en" ? "Institute Leadership" : "Lãnh đạo viện") : undefined}
            featuredMembers={featuredMembers}
            groups={groups}
            emptyTitle={tCommon("updateSoon")}
        />
    );
}
