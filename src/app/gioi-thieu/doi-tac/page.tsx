import { getTranslations } from "next-intl/server";
import PartnersPageTemplate from "@/components/about/PartnersPageTemplate";

export default async function PartnersPage() {
    const t = await getTranslations({ locale: "vi", namespace: "about.partners" });
    const tCommon = await getTranslations({ locale: "vi", namespace: "common" });
    const { prisma } = await import("@/lib/prisma");

    const partnerTable = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
        "partners"
    ).catch(() => []);

    const partners = partnerTable.length > 0
        ? await prisma.partner.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            include: { logo: true },
        }).catch(() => [])
        : [];

    return (
        <PartnersPageTemplate
            badge={t("title")}
            title={t("title")}
            description={t("description")}
            partners={partners.map((partner) => ({
                id: partner.id,
                name: partner.name,
                logo: partner.logo?.secureUrl || partner.logo?.url || null,
                website: partner.website,
                description: partner.description,
            }))}
            emptyTitle={tCommon("updateSoon")}
        />
    );
}
