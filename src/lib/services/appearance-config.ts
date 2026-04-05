import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
    APPEARANCE_CONFIG_GROUP,
    APPEARANCE_TARGETS,
    getAppearanceAdminPayload,
    sanitizeAppearanceAssignments,
    sanitizeAppearanceConfig,
    sanitizeAppearancePresets,
    sanitizeAppearanceTokens,
    type AppearanceAdminPayload,
    type AppearancePreset,
    type AppearanceRuntimeConfig,
    type AppearanceTargetId,
    type AppearanceTokens,
} from "@/lib/appearance/schema";

const APPEARANCE_CONFIG_KEYS = {
    tokens: "appearance.tokens",
    presets: "appearance.presets",
    assignments: "appearance.assignments",
} as const;

const APPEARANCE_CACHE_TAG = "appearance-config";

const getAppearanceRows = unstable_cache(
    async () =>
        prisma.configuration.findMany({
            where: {
                group: APPEARANCE_CONFIG_GROUP,
                key: {
                    in: Object.values(APPEARANCE_CONFIG_KEYS),
                },
            },
        }),
    ["appearance-config-rows"],
    {
        revalidate: 300,
        tags: [APPEARANCE_CACHE_TAG],
    },
);

function parseJsonValue(value: string | null | undefined) {
    if (!value) {
        return undefined;
    }

    try {
        return JSON.parse(value) as unknown;
    } catch {
        return undefined;
    }
}

function resolvePresetTokenValue(
    tokens: AppearanceTokens,
    preset: AppearancePreset,
    field: keyof Pick<
        AppearancePreset,
        "surfaceBackground" | "titleColor" | "bodyColor" | "badgeColor" | "accentColor" | "titleSize" | "bodySize"
    >,
) {
    const tokenRef = preset[field];
    if (!tokenRef) {
        return null;
    }

    const [group, tokenId] = tokenRef.split(".");
    if (!group || !tokenId) {
        return null;
    }

    const tokenGroup = tokens[group as keyof AppearanceTokens];
    return tokenGroup?.[tokenId] || null;
}

function buildTargetVariableBlock(
    targetId: AppearanceTargetId,
    declarations: Record<string, string | null>,
) {
    const lines = Object.entries(declarations)
        .filter(([, value]) => Boolean(value))
        .map(([property, value]) => `  ${property}: ${value};`);

    if (lines.length === 0) {
        return "";
    }

    return [
        `[data-appearance-target="${targetId}"] {`,
        ...lines,
        "}",
    ].join("\n");
}

export async function getAppearanceConfig(): Promise<AppearanceRuntimeConfig> {
    const rows = await getAppearanceRows();
    const rowMap = new Map(rows.map((row) => [row.key, row]));
    const tokens = sanitizeAppearanceTokens(parseJsonValue(rowMap.get(APPEARANCE_CONFIG_KEYS.tokens)?.value));
    const presets = sanitizeAppearancePresets(parseJsonValue(rowMap.get(APPEARANCE_CONFIG_KEYS.presets)?.value), tokens);
    const assignments = sanitizeAppearanceAssignments(
        parseJsonValue(rowMap.get(APPEARANCE_CONFIG_KEYS.assignments)?.value),
        presets,
    );

    return sanitizeAppearanceConfig({ tokens, presets, assignments });
}

export async function getAppearanceAdminConfig(): Promise<AppearanceAdminPayload> {
    return getAppearanceAdminPayload(await getAppearanceConfig());
}

export function buildAppearanceStylesheet(config: AppearanceRuntimeConfig) {
    return APPEARANCE_TARGETS.map((target) => {
        const presetId = config.assignments[target.id] || target.defaultPresetId;
        const preset = config.presets[presetId];

        if (!preset) {
            return "";
        }

        return buildTargetVariableBlock(target.id, {
            "--appearance-surface-background": resolvePresetTokenValue(config.tokens, preset, "surfaceBackground"),
            "--appearance-title-color": resolvePresetTokenValue(config.tokens, preset, "titleColor"),
            "--appearance-body-color": resolvePresetTokenValue(config.tokens, preset, "bodyColor"),
            "--appearance-badge-color": resolvePresetTokenValue(config.tokens, preset, "badgeColor"),
            "--appearance-accent-color": resolvePresetTokenValue(config.tokens, preset, "accentColor"),
            "--appearance-title-size": resolvePresetTokenValue(config.tokens, preset, "titleSize"),
            "--appearance-body-size": resolvePresetTokenValue(config.tokens, preset, "bodySize"),
        });
    })
        .filter(Boolean)
        .join("\n\n");
}

export async function getAppearanceStylesheet() {
    return buildAppearanceStylesheet(await getAppearanceConfig());
}

export {
    APPEARANCE_CACHE_TAG,
    APPEARANCE_CONFIG_KEYS,
};
