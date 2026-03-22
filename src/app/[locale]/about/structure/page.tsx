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
    email: string | null;
    department: { id: string; name: string; slug: string } | null;
    staffType: { id: string; name: string; level: number; isAdvisory: boolean };
}

export default function OrgStructurePage() {
    const t = useTranslations("about.structure");
    const tCommon = useTranslations("common");
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStaff() {
            try {
                const res = await fetch("/api/staff?locale=en");
                if (res.ok) {
                    const data = await res.json();
                    setStaff(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStaff();
    }, []);

    const groups = useMemo<StaffDirectoryGroup[]>(() => {
        const mapped = staff.reduce<Record<string, StaffCardPerson[]>>((accumulator, member) => {
            const departmentName = member.department?.name || "Leadership";
            if (!accumulator[departmentName]) {
                accumulator[departmentName] = [];
            }

            accumulator[departmentName].push({
                id: member.id,
                name: member.name,
                title: member.title,
                position: member.staffType.name,
                bio: member.bio,
                avatar: member.avatar ? { url: member.avatar, secureUrl: member.avatar } : null,
            });

            return accumulator;
        }, {});

        return Object.entries(mapped).map(([title, members]) => ({ title, members }));
    }, [staff]);

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
