import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { normalizePlainText, normalizePreviewText } from "@/lib/preview-text";

/**
 * GET /api/partners
 * Get all active partners (for homepage carousel, partner page)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);

        const partners = await prisma.partner.findMany({
            where: {
                isActive: true,
            },
            orderBy: { sortOrder: "asc" },
            include: {
                logo: {
                    select: { url: true, alt: true },
                },
            },
        });

        // Transform partners based on locale
        const transformedPartners = partners.map((partner) => ({
            id: partner.id,
            name: normalizePlainText(locale === "en" && partner.name_en ? partner.name_en : partner.name) || partner.name,
            logo: partner.logo?.url || null,
            website: partner.website,
            description: normalizePreviewText(
                locale === "en" && partner.description_en
                    ? partner.description_en
                    : partner.description
            ),
        }));

        return successResponse(transformedPartners);
    } catch (error) {
        console.error("Error fetching partners:", error);
        return errors.serverError("Không thể tải danh sách đối tác");
    }
}
