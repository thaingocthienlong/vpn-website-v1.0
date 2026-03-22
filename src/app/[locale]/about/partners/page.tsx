"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import PartnersPageTemplate from "@/components/about/PartnersPageTemplate";

interface Partner {
    id: string;
    name: string;
    logo: string | null;
    website: string | null;
    description: string | null;
}

export default function PartnersPage() {
    const t = useTranslations("about.partners");
    const tCommon = useTranslations("common");
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPartners() {
            try {
                const res = await fetch("/api/partners?locale=en");
                if (res.ok) {
                    const data = await res.json();
                    setPartners(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching partners:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchPartners();
    }, []);

    return (
        <PartnersPageTemplate
            badge={t("title")}
            title={t("title")}
            description={t("description")}
            partners={partners.map((partner) => ({
                id: partner.id,
                name: partner.name,
                logo: partner.logo,
                website: partner.website,
                description: partner.description,
            }))}
            loading={loading}
            emptyTitle={tCommon("updateSoon")}
        />
    );
}
