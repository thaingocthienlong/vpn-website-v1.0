import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { normalizePlainText } from "@/lib/preview-text";

/**
 * GET /api/staff
 * Get all active staff members grouped by department
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);
        const departmentSlug = searchParams.get("department");
        const isAdvisory = searchParams.get("advisory") === "true";

        // Build where clause
        const where: Record<string, unknown> = {
            isActive: true,
        };

        if (departmentSlug) {
            where.department = { slug: departmentSlug };
        }

        if (isAdvisory) {
            where.staffType = { isAdvisory: true };
        }

        const staff = await prisma.staff.findMany({
            where,
            orderBy: [
                { staffType: { level: "asc" } },
                { sortOrder: "asc" },
            ],
            include: {
                department: {
                    select: { id: true, name: true, name_en: true, slug: true },
                },
                staffType: {
                    select: { id: true, name: true, name_en: true, level: true, isAdvisory: true },
                },
                avatar: {
                    select: { url: true, alt: true },
                },
            },
        });

        // Transform staff based on locale
        const transformedStaff = staff.map((member) => ({
            id: member.id,
            name: normalizePlainText(member.name) || member.name,
            title: normalizePlainText(locale === "en" && member.title_en ? member.title_en : member.title),
            bio: locale === "en" && member.bio_en ? member.bio_en : member.bio,
            avatar: member.avatar?.url || null,
            email: member.email,
            department: member.department ? {
                id: member.department.id,
                name: normalizePlainText(
                    locale === "en" && member.department.name_en
                        ? member.department.name_en
                        : member.department.name
                ) || member.department.name,
                slug: member.department.slug,
            } : null,
            staffType: {
                id: member.staffType.id,
                name: normalizePlainText(
                    locale === "en" && member.staffType.name_en
                        ? member.staffType.name_en
                        : member.staffType.name
                ) || member.staffType.name,
                level: member.staffType.level,
                isAdvisory: member.staffType.isAdvisory,
            },
        }));

        return successResponse(transformedStaff);
    } catch (error) {
        console.error("Error fetching staff:", error);
        return errors.serverError("Không thể tải danh sách nhân sự");
    }
}
