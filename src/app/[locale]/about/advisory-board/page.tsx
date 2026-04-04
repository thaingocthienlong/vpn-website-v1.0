"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import StaffDirectoryPage, { type StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";

interface StaffMember {
    id: string;
    name: string;
    title: string | null;
    bio: string | null;
    avatar: string | null;
    staffType: { id: string; name: string; level: number; isAdvisory: boolean };
}

export default function AdvisoryBoardPage() {
    const t = useTranslations("about.advisory");
    const tCommon = useTranslations("common");
    const [advisors, setAdvisors] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAdvisors() {
            try {
                const res = await fetch("/api/staff?advisory=true&locale=en");
                if (res.ok) {
                    const data = await res.json();
                    setAdvisors(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching advisors:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAdvisors();
    }, []);

    const groups = useMemo<StaffDirectoryGroup[]>(() => {
        const members: StaffCardPerson[] = advisors.map((advisor) => ({
            id: advisor.id,
            name: advisor.name,
            title: advisor.title,
            position: null,
            bio: advisor.bio,
            avatar: advisor.avatar ? { url: advisor.avatar, secureUrl: advisor.avatar } : null,
        }));

        return members.length > 0 ? [{ title: t("title"), members }] : [];
    }, [advisors, t]);

    return (
        <StaffDirectoryPage
            badge={t("title")}
            title={t("title")}
            description={t("description")}
            groups={groups}
            loading={loading}
            emptyTitle={tCommon("updateSoon")}
        />
    );
}
