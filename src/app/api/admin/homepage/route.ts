import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";
import {
    createDefaultHomepageSections,
    toAdminHomepageSections,
    toHomepageSectionUpserts,
    type AdminHomepageSectionInput,
} from "@/lib/admin/homepage-sections";
import { revalidateHomepage } from "@/lib/admin/revalidation";

/**
 * GET /api/admin/homepage - Get all homepage sections
 */
export async function GET() {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const rows = await prisma.homepageSection.findMany({
            orderBy: { sortOrder: "asc" },
        });
        const sections = toAdminHomepageSections(rows);
        const defaults = createDefaultHomepageSections();
        const missingDefaults = defaults.filter(
            (candidate) => !sections.some((section) => section.sectionKey === candidate.sectionKey),
        );

        return jsonSuccess({
            sections: [...sections, ...missingDefaults],
        });
    } catch (error) {
        console.error("Error fetching homepage sections:", error);
        return jsonError("Failed to fetch homepage sections", 500);
    }
}

/**
 * PUT /api/admin/homepage - Update homepage sections in logical pairs
 */
export async function PUT(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const sections = Array.isArray(body?.sections)
            ? body.sections as AdminHomepageSectionInput[]
            : [];

        if (sections.length === 0) {
            return jsonError("sections array is required", 422);
        }

        const upserts = toHomepageSectionUpserts(sections);

        await prisma.$transaction(
            upserts.flatMap((pair) => [
                prisma.homepageSection.upsert(pair.vi),
                prisma.homepageSection.upsert(pair.en),
            ]),
        );

        revalidateHomepage();

        return jsonSuccess({ updated: true });
    } catch (error) {
        console.error("Error updating homepage section:", error);
        return jsonError("Failed to update homepage section", 500);
    }
}
