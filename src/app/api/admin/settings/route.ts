import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";
import { revalidateSiteConfig } from "@/lib/admin/revalidation";

/**
 * GET /api/admin/settings
 * Get all configurations
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const configs = await prisma.configuration.findMany();

        // Transform to a simple key-value object for frontend
        const settings: Record<string, any> = {};
        configs.forEach(conf => {
            try {
                // Parse JSON if type is JSON, otherwise string/number/boolean based on type
                if (conf.type === "JSON") {
                    settings[conf.key] = JSON.parse(conf.value);
                } else if (conf.type === "BOOLEAN") {
                    settings[conf.key] = conf.value === "true";
                } else if (conf.type === "NUMBER") {
                    settings[conf.key] = Number(conf.value);
                } else {
                    settings[conf.key] = conf.value;
                }
            } catch (e) {
                settings[conf.key] = conf.value;
            }
        });

        return jsonSuccess(settings);
    } catch (error) {
        console.error("Error fetching settings:", error);
        return jsonError("Failed to fetch settings", 500);
    }
}

/**
 * POST /api/admin/settings
 * Update configurations
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { settings } = body; // Expect { key: value, ... }

        if (!settings || typeof settings !== "object") {
            return jsonError("Invalid settings data", 400);
        }

        const updates = [];
        for (const [key, value] of Object.entries(settings)) {
            // Determine type
            let type = "STRING";
            let stringValue = String(value);

            if (typeof value === "boolean") {
                type = "BOOLEAN";
                stringValue = String(value);
            } else if (typeof value === "number") {
                type = "NUMBER";
                stringValue = String(value);
            } else if (typeof value === "object" && value !== null) {
                type = "JSON";
                stringValue = JSON.stringify(value);
            }

            updates.push(
                prisma.configuration.upsert({
                    where: { key },
                    update: { value: stringValue, type },
                    create: { key, value: stringValue, type, group: "general" }, // Default group
                })
            );
        }

        await prisma.$transaction(updates);

        revalidateSiteConfig();
        return jsonSuccess({ message: "Settings updated successfully" });
    } catch (error) {
        console.error("Error updating settings:", error);
        return jsonError("Failed to update settings", 500);
    }
}
