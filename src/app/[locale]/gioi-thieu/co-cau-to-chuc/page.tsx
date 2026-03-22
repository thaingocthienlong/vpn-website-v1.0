import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import StaffDirectoryPage, { type StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: "OrgStructure" });

    return {
        title: t("metaTitle", { default: "Cơ cấu tổ chức - Viện Phương Nam" }),
        description: t("metaDescription", {
            default: "Cơ cấu tổ chức và ban lãnh đạo Viện Nghiên cứu Khoa học và Phát triển Phương Nam.",
        }),
    };
}

export default async function OrgStructurePage() {
    let featuredMembers: StaffCardPerson[] = [];
    let groups: StaffDirectoryGroup[] = [];

    try {
        const staffList = await prisma.staff.findMany({
            where: {
                isActive: true,
                staffType: {
                    name: { in: ["Ban Lãnh Đạo Viện", "Cán Bộ Quản Lý", "Chuyên viên"] },
                },
            },
            include: {
                staffType: true,
                department: true,
                avatar: true,
            },
            orderBy: [{ sortOrder: "asc" }],
        });

        featuredMembers = staffList
            .filter((staffMember) => !staffMember.departmentId)
            .map<StaffCardPerson>((person) => ({
                id: person.id,
                name: person.name,
                title: person.title,
                position: person.staffType?.name || null,
                bio: person.bio,
                avatar: person.avatar
                    ? { url: person.avatar.url, secureUrl: person.avatar.secureUrl }
                    : null,
            }));

        const departmentIds = [
            ...new Set(staffList.map((staffMember) => staffMember.departmentId).filter((id): id is string => id !== null)),
        ];

        const departments = await prisma.department.findMany({
            where: { id: { in: departmentIds } },
            orderBy: { sortOrder: "asc" },
        });

        groups = departments
            .map((department) => ({
                title: department.name,
                members: staffList
                    .filter((staffMember) => staffMember.departmentId === department.id)
                    .map<StaffCardPerson>((person) => ({
                        id: person.id,
                        name: person.name,
                        title: person.title,
                        position: person.staffType?.name || null,
                        bio: person.bio,
                        avatar: person.avatar
                            ? { url: person.avatar.url, secureUrl: person.avatar.secureUrl }
                            : null,
                    })),
            }))
            .filter((group) => group.members.length > 0);
    } catch (error) {
        console.error("Failed to load org structure page data:", error);
    }

    return (
        <StaffDirectoryPage
            badge="Cơ cấu tổ chức"
            title="Cơ cấu tổ chức"
            description="Đội ngũ cán bộ, nhân viên Viện Phương Nam."
            featuredTitle="Lãnh Đạo Viện"
            featuredMembers={featuredMembers}
            groups={groups}
            emptyTitle="Nội dung đang được cập nhật"
        />
    );
}
