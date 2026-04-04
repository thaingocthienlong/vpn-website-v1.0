import type { StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";
import { prisma } from "@/lib/prisma";

const ADVISORY_DEPARTMENT_SLUG = "ban-co-van";
const GENERIC_HEADINGS = new Set([
    "HỘI ĐỒNG",
    "CÁC BAN CHUYÊN MÔN CỦA HỘI ĐỒNG",
]);
const FEATURED_TITLES = new Set([
    "CHỦ TỊCH HỘI ĐỒNG",
    "PHÓ CHỦ TỊCH HỘI ĐỒNG",
]);
const FALLBACK_GROUP_TITLE = "Thành viên hội đồng";

type AdvisoryStaffRow = Awaited<ReturnType<typeof loadAdvisoryBoardStaff>>[number];

function normalizeWhitespace(value: string | null | undefined): string {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function stripHtml(value: string | null | undefined): string {
    return String(value || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function isUppercaseHeadingText(value: string): boolean {
    const compact = normalizeWhitespace(value).replace(/[^\p{L}\p{N}]+/gu, "");
    if (!compact) return false;
    return compact === compact.toUpperCase();
}

function isHeadingMarker(member: AdvisoryStaffRow): boolean {
    const name = normalizeWhitespace(member.name);
    const hasTitle = Boolean(normalizeWhitespace(member.title));
    const hasBio = Boolean(stripHtml(member.bio));
    const hasAvatar = Boolean(member.avatar?.url || member.avatar?.secureUrl);

    return isUppercaseHeadingText(name) && !hasTitle && !hasBio && !hasAvatar;
}

function isFeaturedLeadership(member: AdvisoryStaffRow): boolean {
    return FEATURED_TITLES.has(normalizeWhitespace(member.title).toUpperCase());
}

function toStaffCardPerson(member: AdvisoryStaffRow): StaffCardPerson {
    return {
        id: member.id,
        name: member.name,
        title: member.title,
        position: null,
        bio: member.bio,
        avatar: member.avatar
            ? {
                  url: member.avatar.url,
                  secureUrl: member.avatar.secureUrl,
              }
            : null,
    };
}

async function loadAdvisoryBoardStaff() {
    return prisma.staff.findMany({
        where: {
            isActive: true,
            department: {
                slug: ADVISORY_DEPARTMENT_SLUG,
            },
        },
        include: {
            avatar: true,
            department: true,
            staffType: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
}

export function buildAdvisoryBoardDirectoryModel(staffList: AdvisoryStaffRow[]): {
    featuredMembers: StaffCardPerson[];
    groups: StaffDirectoryGroup[];
} {
    const featuredMembers: StaffCardPerson[] = [];
    const groups: StaffDirectoryGroup[] = [];
    let currentGroup: StaffDirectoryGroup | null = null;

    for (const member of staffList) {
        if (isHeadingMarker(member)) {
            const headingName = normalizeWhitespace(member.name);
            if (GENERIC_HEADINGS.has(headingName)) {
                currentGroup = null;
                continue;
            }

            currentGroup = {
                title: headingName,
                members: [],
            };
            groups.push(currentGroup);
            continue;
        }

        const person = toStaffCardPerson(member);

        if (isFeaturedLeadership(member)) {
            featuredMembers.push(person);
            continue;
        }

        if (!currentGroup) {
            currentGroup = {
                title: FALLBACK_GROUP_TITLE,
                members: [],
            };
            groups.push(currentGroup);
        }

        currentGroup.members.push(person);
    }

    return {
        featuredMembers,
        groups: groups.filter((group) => group.members.length > 0),
    };
}

export async function getAdvisoryBoardDirectoryModel() {
    const staffList = await loadAdvisoryBoardStaff();
    return buildAdvisoryBoardDirectoryModel(staffList);
}
