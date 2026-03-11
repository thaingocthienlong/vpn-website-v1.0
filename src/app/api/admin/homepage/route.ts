import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/homepage - Get all homepage sections
 */
export async function GET() {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const sections = await prisma.homepageSection.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return jsonSuccess(sections);
    } catch (error) {
        console.error("Error fetching homepage sections:", error);
        return jsonError("Failed to fetch homepage sections", 500);
    }
}

/**
 * PUT /api/admin/homepage - Update a homepage section
 */
export async function PUT(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { id, sectionKey, locale, isEnabled, sortOrder, config, title, subtitle } = body;

        if (id) {
            const section = await prisma.homepageSection.update({
                where: { id },
                data: {
                    ...(isEnabled !== undefined && { isEnabled }),
                    ...(sortOrder !== undefined && { sortOrder }),
                    ...(config !== undefined && { config: typeof config === "string" ? config : JSON.stringify(config) }),
                    ...(title !== undefined && { title }),
                    ...(subtitle !== undefined && { subtitle }),
                },
            });
            return jsonSuccess(section);
        }

        if (sectionKey && locale) {
            const section = await prisma.homepageSection.upsert({
                where: { sectionKey_locale: { sectionKey, locale } },
                update: {
                    ...(isEnabled !== undefined && { isEnabled }),
                    ...(sortOrder !== undefined && { sortOrder }),
                    ...(config !== undefined && { config: typeof config === "string" ? config : JSON.stringify(config) }),
                    ...(title !== undefined && { title }),
                    ...(subtitle !== undefined && { subtitle }),
                },
                create: {
                    sectionKey,
                    locale,
                    title: title || sectionKey,
                    isEnabled: isEnabled ?? true,
                    sortOrder: sortOrder ?? 0,
                    config: config ? (typeof config === "string" ? config : JSON.stringify(config)) : null,
                },
            });
            return jsonSuccess(section);
        }

        return jsonError("Either id or sectionKey+locale is required", 422);
    } catch (error) {
        console.error("Error updating homepage section:", error);
        return jsonError("Failed to update homepage section", 500);
    }
}
