import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import StaffDirectoryPage, { type StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";

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
    let groups: StaffDirectoryGroup[] = [];

    try {
        const staffList = await prisma.staff.findMany({
            where: {
                isActive: true,
                staffType: {
                    name: "Hội đồng Cố vấn Khoa học",
                },
            },
            include: {
                staffType: true,
                department: true,
                avatar: true,
            },
            orderBy: [{ sortOrder: "asc" }],
        });

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
        console.error("Failed to load advisory board page data:", error);
    }

    return (
        <StaffDirectoryPage
            badge="Hội đồng Cố vấn Khoa học"
            title="Hội đồng Cố vấn Khoa học"
            description="Tập hợp các Giáo sư, Tiến sĩ, chuyên gia đầu ngành đồng hành cùng sự phát triển của Viện Phương Nam."
            groups={groups}
            emptyTitle="Nội dung đang được cập nhật"
        />
    );
}
