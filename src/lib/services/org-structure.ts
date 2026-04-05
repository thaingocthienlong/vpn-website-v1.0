import type { StaffDirectoryGroup } from "@/components/about/StaffDirectoryPage";
import type { StaffCardPerson } from "@/components/cards/StaffCard";
import { decodeHtmlEntities, normalizePlainText } from "@/lib/preview-text";
import { prisma } from "@/lib/prisma";

const ORG_STRUCTURE_DEPARTMENT_SLUG = "ban-lanh-dao-vien";

export type OrgStructureLocale = "vi" | "en";

type OrgStructureStaffRow = Awaited<ReturnType<typeof loadOrgStructureStaff>>[number];

function normalizeWhitespace(value: string | null | undefined): string {
    return normalizePlainText(value) || "";
}

function stripHtml(value: string | null | undefined): string {
    return decodeHtmlEntities(String(value || ""))
        .replace(/<[^>]*>/g, " ")
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function isUppercaseHeadingText(value: string): boolean {
    const compact = normalizeWhitespace(value).replace(/[^\p{L}\p{N}]+/gu, "");
    if (!compact) return false;
    return compact === compact.toUpperCase();
}

function normalizeTitleKey(value: string): string {
    return normalizeWhitespace(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .toUpperCase();
}

function getLocalizedValue(primary: string | null | undefined, secondary: string | null | undefined, locale: OrgStructureLocale) {
    if (locale === "en" && normalizeWhitespace(secondary)) {
        return secondary || null;
    }

    return primary || secondary || null;
}

function getLocalizedAvatar(member: OrgStructureStaffRow, locale: OrgStructureLocale) {
    const avatar = locale === "en" && member.avatar_en ? member.avatar_en : member.avatar;

    return avatar
        ? {
              url: avatar.url,
              secureUrl: avatar.secureUrl,
          }
        : null;
}

function isHeadingMarker(member: OrgStructureStaffRow): boolean {
    const name = normalizeWhitespace(member.name);
    const hasTitle = Boolean(normalizeWhitespace(member.title));
    const hasBio = Boolean(stripHtml(member.bio));
    const hasAvatar = Boolean(member.avatar?.url || member.avatar?.secureUrl || member.avatar_en?.url || member.avatar_en?.secureUrl);

    return isUppercaseHeadingText(name) && !hasTitle && !hasBio && !hasAvatar;
}

function isFeaturedLeadership(member: OrgStructureStaffRow): boolean {
    const normalizedTitle = normalizeTitleKey(member.title || "");
    return normalizedTitle === "VIEN TRUONG";
}

function toStaffCardPerson(member: OrgStructureStaffRow, locale: OrgStructureLocale): StaffCardPerson {
    return {
        id: member.id,
        name: normalizePlainText(getLocalizedValue(member.name, member.name_en, locale)) || member.name,
        title: normalizePlainText(getLocalizedValue(member.title, member.title_en, locale)),
        position: null,
        bio: getLocalizedValue(member.bio, member.bio_en, locale),
        avatar: getLocalizedAvatar(member, locale),
    };
}

async function loadOrgStructureStaff() {
    return prisma.staff.findMany({
        where: {
            isActive: true,
            department: {
                slug: ORG_STRUCTURE_DEPARTMENT_SLUG,
            },
        },
        include: {
            avatar: true,
            avatar_en: true,
            department: true,
            staffType: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
}

export function buildOrgStructureDirectoryModel(
    staffList: OrgStructureStaffRow[],
    locale: OrgStructureLocale = "vi"
): {
    featuredMembers: StaffCardPerson[];
    groups: StaffDirectoryGroup[];
} {
    const featuredMembers: StaffCardPerson[] = [];
    const groups: StaffDirectoryGroup[] = [];
    let currentGroup: StaffDirectoryGroup | null = null;
    const fallbackGroupTitle = locale === "en" ? "Institute team" : "Nhân sự Viện";

    for (const member of staffList) {
        if (isHeadingMarker(member)) {
            currentGroup = {
                title: normalizePlainText(getLocalizedValue(member.name, member.name_en, locale)) || member.name,
                members: [],
            };
            groups.push(currentGroup);
            continue;
        }

        const person = toStaffCardPerson(member, locale);

        if (isFeaturedLeadership(member)) {
            featuredMembers.push(person);
            continue;
        }

        if (!currentGroup) {
            currentGroup = {
                title: fallbackGroupTitle,
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

export async function getOrgStructureDirectoryModel(locale: OrgStructureLocale = "vi") {
    const staffList = await loadOrgStructureStaff();
    return buildOrgStructureDirectoryModel(staffList, locale);
}
