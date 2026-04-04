import StaffDirectoryPage, { type StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";
import { getAdvisoryBoardDirectoryModel } from "@/lib/services/advisory-board";

export const dynamic = "force-dynamic";

export default async function AdvisoryBoardPage() {
    let featuredMembers: StaffCardPerson[] = [];
    let groups: StaffDirectoryGroup[] = [];

    try {
        ({ featuredMembers, groups } = await getAdvisoryBoardDirectoryModel());
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
