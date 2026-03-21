import { NextRequest } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/homepage - Get all homepage sections
 */
export async function GET() {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const defaultKeys = ["hero", "reviews", "partners", "services", "videos", "training", "news", "gallery", "cta", "contact"];
        
        let sections = await prisma.homepageSection.findMany({
            orderBy: { sortOrder: "asc" },
        });

        // Auto-reconciliation
        const existingKeysEn = new Set(sections.filter(s => s.locale === "en").map(s => s.sectionKey));
        const existingKeysVi = new Set(sections.filter(s => s.locale === "vi").map(s => s.sectionKey));
                let needsReFetch = false;

        // 1. Delete invalid keys
        const keysToDelete = sections.filter(s => !defaultKeys.includes(s.sectionKey)).map(s => s.sectionKey);
        if (keysToDelete.length > 0) {
            console.log("Removing deprecated homepage sections:", keysToDelete);
            await prisma.homepageSection.deleteMany({
                where: { sectionKey: { in: keysToDelete } }
            });
            needsReFetch = true;
        }

        // 2. Add missing keys
        const rowsToAdd = [];
        for (let i = 0; i < defaultKeys.length; i++) {
            const key = defaultKeys[i];
            
            if (!existingKeysVi.has(key)) {
                rowsToAdd.push({
                    sectionKey: key,
                    locale: "vi",
                    title: key,
                    isEnabled: true,
                    sortOrder: i,
                    config: JSON.stringify({}),
                });
            }
            if (!existingKeysEn.has(key)) {
                rowsToAdd.push({
                    sectionKey: key,
                    locale: "en",
                    title: key,
                    isEnabled: true,
                    sortOrder: i,
                    config: JSON.stringify({}),
                });
            }
        }

        if (rowsToAdd.length > 0) {
            console.log("Adding missing homepage sections:", rowsToAdd.map(r => r.sectionKey));
            await prisma.homepageSection.createMany({ data: rowsToAdd });
            needsReFetch = true;
        }

        if (needsReFetch) {
            sections = await prisma.homepageSection.findMany({
                orderBy: { sortOrder: "asc" },
            });
        }

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
        const { id, sectionKey, locale, isEnabled, sortOrder, config, title, title_en, subtitle, subtitle_en } = body;

        if (id) {
            const section = await prisma.homepageSection.update({
                where: { id },
                data: {
                    ...(isEnabled !== undefined && { isEnabled }),
                    ...(sortOrder !== undefined && { sortOrder }),
                    ...(config !== undefined && { config: typeof config === "string" ? config : JSON.stringify(config) }),
                    ...(title !== undefined && { title }),
                    ...(title_en !== undefined && { title_en }),
                    ...(subtitle !== undefined && { subtitle }),
                    ...(subtitle_en !== undefined && { subtitle_en }),
                },
            });
            revalidateTag("homepage_sections");
            revalidatePath("/", "layout");
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
                    ...(title_en !== undefined && { title_en }),
                    ...(subtitle !== undefined && { subtitle }),
                    ...(subtitle_en !== undefined && { subtitle_en }),
                },
                create: {
                    sectionKey,
                    locale,
                    title: title || sectionKey,
                    title_en,
                    subtitle,
                    subtitle_en,
                    isEnabled: isEnabled ?? true,
                    sortOrder: sortOrder ?? 0,
                    config: config ? (typeof config === "string" ? config : JSON.stringify(config)) : null,
                },
            });
            revalidateTag("homepage_sections");
            revalidatePath("/", "layout");
            return jsonSuccess(section);
        }

        return jsonError("Either id or sectionKey+locale is required", 422);
    } catch (error) {
        console.error("Error updating homepage section:", error);
        return jsonError("Failed to update homepage section", 500);
    }
}
