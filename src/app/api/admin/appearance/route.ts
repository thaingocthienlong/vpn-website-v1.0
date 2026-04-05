import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, requireAdmin } from "@/lib/admin-auth";
import { revalidateAppearanceConfig } from "@/lib/admin/revalidation";
import {
    APPEARANCE_CONFIG_GROUP,
    sanitizeAppearanceConfig,
} from "@/lib/appearance/schema";
import {
    APPEARANCE_CONFIG_KEYS,
    getAppearanceAdminConfig,
} from "@/lib/services/appearance-config";

export async function GET() {
    const authResult = await requireAdmin();
    if ("error" in authResult) {
        return authResult.error;
    }

    try {
        return jsonSuccess(await getAppearanceAdminConfig());
    } catch (error) {
        console.error("Error fetching appearance config:", error);
        return jsonError("Failed to fetch appearance config", 500);
    }
}

export async function PUT(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) {
        return authResult.error;
    }

    try {
        const body = await request.json();
        const nextConfig = sanitizeAppearanceConfig(body);

        await prisma.$transaction([
            prisma.configuration.upsert({
                where: { key: APPEARANCE_CONFIG_KEYS.tokens },
                update: {
                    value: JSON.stringify(nextConfig.tokens),
                    type: "JSON",
                    group: APPEARANCE_CONFIG_GROUP,
                },
                create: {
                    key: APPEARANCE_CONFIG_KEYS.tokens,
                    value: JSON.stringify(nextConfig.tokens),
                    type: "JSON",
                    group: APPEARANCE_CONFIG_GROUP,
                },
            }),
            prisma.configuration.upsert({
                where: { key: APPEARANCE_CONFIG_KEYS.presets },
                update: {
                    value: JSON.stringify(nextConfig.presets),
                    type: "JSON",
                    group: APPEARANCE_CONFIG_GROUP,
                },
                create: {
                    key: APPEARANCE_CONFIG_KEYS.presets,
                    value: JSON.stringify(nextConfig.presets),
                    type: "JSON",
                    group: APPEARANCE_CONFIG_GROUP,
                },
            }),
            prisma.configuration.upsert({
                where: { key: APPEARANCE_CONFIG_KEYS.assignments },
                update: {
                    value: JSON.stringify(nextConfig.assignments),
                    type: "JSON",
                    group: APPEARANCE_CONFIG_GROUP,
                },
                create: {
                    key: APPEARANCE_CONFIG_KEYS.assignments,
                    value: JSON.stringify(nextConfig.assignments),
                    type: "JSON",
                    group: APPEARANCE_CONFIG_GROUP,
                },
            }),
        ]);

        revalidateAppearanceConfig();

        return jsonSuccess({
            message: "Appearance settings updated.",
            config: await getAppearanceAdminConfig(),
        });
    } catch (error) {
        console.error("Error updating appearance config:", error);
        return jsonError("Failed to update appearance config", 500);
    }
}
