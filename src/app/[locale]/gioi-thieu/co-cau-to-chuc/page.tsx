import { getTranslations, setRequestLocale } from "next-intl/server";
import StaffDirectoryPage, { type StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";
import { getOrgStructureDirectoryModel } from "@/lib/services/org-structure";

export const dynamic = "force-dynamic";

interface MetadataProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: MetadataProps) {
    const { locale } = await params;

    if (locale === "en") {
        const t = await getTranslations({ locale, namespace: "about.structure" });

        return {
            title: t("title"),
            description: t("description"),
        };
    }

    const t = await getTranslations({ locale: "vi", namespace: "OrgStructure" });

    return {
        title: t("metaTitle", { default: "Cơ cấu tổ chức - Viện Phương Nam" }),
        description: t("metaDescription", {
            default: "Cơ cấu tổ chức và ban lãnh đạo Viện Nghiên cứu Khoa học và Phát triển Phương Nam.",
        }),
    };
}

export default async function OrgStructurePage({ params }: MetadataProps) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    let featuredMembers: StaffCardPerson[] = [];
    let groups: StaffDirectoryGroup[] = [];

    try {
        ({ featuredMembers, groups } = await getOrgStructureDirectoryModel(resolvedLocale));
    } catch (error) {
        console.error("Failed to load localized org structure page data:", error);
    }

    if (resolvedLocale === "en") {
        const [t, tCommon] = await Promise.all([
            getTranslations({ locale, namespace: "about.structure" }),
            getTranslations({ locale, namespace: "common" }),
        ]);

        return (
            <StaffDirectoryPage
                badge={t("title")}
                title={t("title")}
                description={t("description")}
                featuredTitle={featuredMembers.length > 0 ? "Institute Leadership" : undefined}
                featuredMembers={featuredMembers}
                groups={groups}
                emptyTitle={tCommon("updateSoon")}
            />
        );
    }

    return (
        <StaffDirectoryPage
            badge="Cơ cấu tổ chức"
            title="Cơ cấu tổ chức"
            description="Đội ngũ cán bộ, nhân viên Viện Phương Nam."
            featuredTitle={featuredMembers.length > 0 ? "Lãnh đạo viện" : undefined}
            featuredMembers={featuredMembers}
            groups={groups}
            emptyTitle="Nội dung đang được cập nhật"
        />
    );
}
