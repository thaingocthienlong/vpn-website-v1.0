import { getTranslations } from "next-intl/server";
import StaffDirectoryPage, { type StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";
import { getAdvisoryBoardDirectoryModel } from "@/lib/services/advisory-board";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "AdvisoryBoard" });

    return {
        title: t("metaTitle", { default: "Hội đồng Cố vấn Khoa học - Viện Phương Nam" }),
        description: t("metaDescription", {
            default: "Hội đồng Cố vấn Khoa học Viện Nghiên cứu Khoa học và Phát triển Phương Nam gồm các chuyên gia đầu ngành.",
        }),
    };
}

export default async function AdvisoryBoardPage() {
    let featuredMembers: StaffCardPerson[] = [];
    let groups: StaffDirectoryGroup[] = [];

    try {
        const advisoryModel = await getAdvisoryBoardDirectoryModel();
        featuredMembers = advisoryModel.featuredMembers;
        groups = advisoryModel.groups;
    } catch (error) {
        console.error("Failed to load advisory board page data:", error);
    }

    return (
        <StaffDirectoryPage
            badge="Hội đồng Cố vấn Khoa học"
            title="Hội đồng Cố vấn Khoa học"
            description="Tập hợp các Giáo sư, Tiến sĩ, chuyên gia đầu ngành đồng hành cùng sự phát triển của Viện Phương Nam."
            featuredTitle={featuredMembers.length > 0 ? "Thường trực hội đồng" : undefined}
            featuredMembers={featuredMembers}
            groups={groups}
            emptyTitle="Nội dung đang được cập nhật"
        />
    );
}
