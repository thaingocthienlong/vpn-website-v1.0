import StaffDirectoryPage, { type StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";
import { getOrgStructureDirectoryModel } from "@/lib/services/org-structure";

export const dynamic = "force-dynamic";

export default async function OrgStructurePage() {
    let featuredMembers: StaffCardPerson[] = [];
    let groups: StaffDirectoryGroup[] = [];

    try {
        ({ featuredMembers, groups } = await getOrgStructureDirectoryModel("vi"));
    } catch (error) {
        console.error("Failed to load org structure page data:", error);
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
