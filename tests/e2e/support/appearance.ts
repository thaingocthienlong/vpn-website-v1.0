import { randomUUID } from "node:crypto";
import { expect, type Locator, type Page, type TestInfo } from "playwright/test";
import { createClient } from "@libsql/client";
import {
    createDefaultAppearanceConfig,
    type AppearanceAdminPayload,
    type AppearancePreset,
    type AppearanceRuntimeConfig,
    type AppearanceTargetDefinition,
} from "../../../src/lib/appearance/schema";

type AppearanceApiEnvelope = {
    success: boolean;
    data?: unknown;
    error?: string;
};

type AppearanceConfigRowSnapshot = Array<{
    id: string;
    key: string;
    value: string;
    type: string;
    group: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}>;

const APPEARANCE_CONFIG_GROUP = "appearance";
const APPEARANCE_KEYS = [
    "appearance.tokens",
    "appearance.presets",
    "appearance.assignments",
] as const;

function getDatabaseClient() {
    return createClient({
        url: process.env.DATABASE_URL || "file:./prisma/dev.db",
    });
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

export function unwrapAppearancePayload(candidate: unknown) {
    if (isRecord(candidate) && "config" in candidate) {
        return candidate.config;
    }

    return candidate;
}

export function assertAppearanceAdminPayloadShape(candidate: unknown): asserts candidate is AppearanceAdminPayload {
    expect(isRecord(candidate)).toBeTruthy();

    const payload = candidate as Record<string, unknown>;
    expect(isRecord(payload.tokens)).toBeTruthy();
    expect(isRecord(payload.presets)).toBeTruthy();
    expect(isRecord(payload.assignments)).toBeTruthy();
    expect(Array.isArray(payload.tokenGroups)).toBeTruthy();
    expect(Array.isArray(payload.targets)).toBeTruthy();
}

export async function attachJsonArtifact(testInfo: TestInfo, name: string, value: unknown) {
    await testInfo.attach(name, {
        body: JSON.stringify(value, null, 2),
        contentType: "application/json",
    });
}

export async function captureScreenshot(page: Page, testInfo: TestInfo, name: string) {
    const path = testInfo.outputPath(`${name}.png`);
    await page.screenshot({ path, fullPage: true });
    await testInfo.attach(name, { path, contentType: "image/png" });
}

export async function readAppearanceConfigViaApi(page: Page): Promise<AppearanceRuntimeConfig> {
    const result = await page.evaluate(async () => {
        const response = await fetch("/api/admin/appearance", { method: "GET" });
        return (await response.json()) as AppearanceApiEnvelope;
    });

    if (!result.success) {
        throw new Error(result.error || "Unable to read appearance config.");
    }

    const payload = unwrapAppearancePayload(result.data);
    assertAppearanceAdminPayloadShape(payload);

    return {
        tokens: payload.tokens,
        presets: payload.presets,
        assignments: payload.assignments,
    };
}

export async function writeAppearanceConfigViaApi(page: Page, config: AppearanceRuntimeConfig) {
    const result = await page.evaluate(async (payload: AppearanceRuntimeConfig) => {
        const response = await fetch("/api/admin/appearance", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        return (await response.json()) as AppearanceApiEnvelope;
    }, config);

    if (!result.success) {
        throw new Error(result.error || "Unable to write appearance config.");
    }

    const payload = unwrapAppearancePayload(result.data);
    assertAppearanceAdminPayloadShape(payload);

    return payload;
}

export async function submitMalformedAppearanceConfig(page: Page, payload: unknown) {
    const result = await page.evaluate(async (body: unknown) => {
        const response = await fetch("/api/admin/appearance", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        return {
            status: response.status,
            json: (await response.json()) as AppearanceApiEnvelope,
        };
    }, payload);

    expect(result.status).toBe(200);
    expect(result.json.success).toBeTruthy();

    const normalized = unwrapAppearancePayload(result.json.data);
    assertAppearanceAdminPayloadShape(normalized);
    return normalized;
}

export async function gotoAppearanceAdmin(page: Page, testInfo?: TestInfo) {
    const responsePromise = page.waitForResponse((response) => {
        return response.url().includes("/api/admin/appearance")
            && response.request().method() === "GET";
    });

    await page.goto("/admin/site/appearance");
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    const result = (await response.json()) as AppearanceApiEnvelope;
    expect(result.success).toBeTruthy();

    const payload = unwrapAppearancePayload(result.data);
    assertAppearanceAdminPayloadShape(payload);

    await expect(page.getByRole("heading", { name: "Appearance System" })).toBeVisible();

    if (testInfo) {
        await attachJsonArtifact(testInfo, "appearance-admin-get-response", result);
    }

    return payload;
}

export async function saveAppearanceViaUi(page: Page, testInfo?: TestInfo) {
    const responsePromise = page.waitForResponse((response) => {
        return response.url().includes("/api/admin/appearance")
            && response.request().method() === "PUT";
    });

    await page.getByTestId("appearance-save-button").click();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();

    const result = (await response.json()) as AppearanceApiEnvelope;
    expect(result.success).toBeTruthy();

    const payload = unwrapAppearancePayload(result.data);
    assertAppearanceAdminPayloadShape(payload);
    await expect(page.getByTestId("appearance-status-message")).toHaveText(/Appearance settings updated\./i);

    if (testInfo) {
        await attachJsonArtifact(testInfo, "appearance-admin-put-response", result);
    }

    return payload;
}

export async function selectAppearanceTab(
    page: Page,
    tab: "tokens" | "presets" | "assignments",
) {
    await page.getByTestId(`appearance-tab-${tab}`).click();
}

export function resolveTargetDefinition(
    payload: AppearanceAdminPayload,
    targetId: string,
): AppearanceTargetDefinition {
    const target = payload.targets.find((entry) => entry.id === targetId);
    if (!target) {
        throw new Error(`Unknown appearance target: ${targetId}`);
    }

    return target;
}

export function resolveTokenIdForTarget(
    payload: AppearanceAdminPayload,
    targetId: string,
    field: keyof Pick<
        AppearancePreset,
        "surfaceBackground" | "titleColor" | "bodyColor" | "badgeColor" | "accentColor" | "titleSize" | "bodySize"
    >,
    expectedGroup: keyof AppearanceRuntimeConfig["tokens"],
) {
    const target = resolveTargetDefinition(payload, targetId);
    const presetId = payload.assignments[targetId as keyof typeof payload.assignments] || target.defaultPresetId;
    const tokenRef = payload.presets[presetId]?.[field];

    if (!tokenRef || !tokenRef.startsWith(`${expectedGroup}.`)) {
        throw new Error(`Target ${targetId} is not bound to a ${String(expectedGroup)} token through ${String(field)}.`);
    }

    return tokenRef.slice(`${expectedGroup}.`.length);
}

export async function getComputedStyleValue(locator: Locator, property: string) {
    return locator.evaluate((node, cssProperty) => {
        return window.getComputedStyle(node as HTMLElement).getPropertyValue(cssProperty).trim();
    }, property);
}

export function getTargetLocator(page: Page, targetId: string) {
    return page.locator(`[data-appearance-target="${targetId}"]`).first();
}

export async function getTargetHeadingStyle(page: Page, targetId: string, property: string) {
    const heading = getTargetLocator(page, targetId).locator("h1, h2, h3, h4").first();
    await heading.scrollIntoViewIfNeeded();
    await expect(heading).toBeVisible();
    return getComputedStyleValue(heading, property);
}

export async function getTargetRootStyle(page: Page, targetId: string, property: string) {
    const target = getTargetLocator(page, targetId);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toBeVisible();
    return getComputedStyleValue(target, property);
}

export async function readAppearanceRowsSnapshot(): Promise<AppearanceConfigRowSnapshot> {
    const client = getDatabaseClient();
    const rows = await client.execute({
        sql: `
            SELECT id, key, value, type, "group" AS group_name, description, createdAt, updatedAt
            FROM configurations
            WHERE "group" = ? AND key IN (?, ?, ?)
            ORDER BY key ASC
        `,
        args: [APPEARANCE_CONFIG_GROUP, ...APPEARANCE_KEYS],
    });

    return rows.rows.map((row) => ({
        id: String(row.id),
        key: String(row.key),
        value: String(row.value),
        type: String(row.type),
        group: String(row.group_name),
        description: row.description === null ? null : String(row.description),
        createdAt: String(row.createdAt),
        updatedAt: String(row.updatedAt),
    }));
}

export async function deleteAppearanceRows() {
    const client = getDatabaseClient();
    await client.execute({
        sql: `
            DELETE FROM configurations
            WHERE "group" = ? AND key IN (?, ?, ?)
        `,
        args: [APPEARANCE_CONFIG_GROUP, ...APPEARANCE_KEYS],
    });
}

export async function restoreAppearanceRows(snapshot: AppearanceConfigRowSnapshot) {
    await deleteAppearanceRows();
    const client = getDatabaseClient();

    for (const row of snapshot) {
        await client.execute({
            sql: `
                INSERT INTO configurations (
                    id,
                    key,
                    value,
                    type,
                    "group",
                    description,
                    createdAt,
                    updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
                row.id || randomUUID(),
                row.key,
                row.value,
                row.type,
                row.group,
                row.description,
                row.createdAt,
                row.updatedAt,
            ],
        });
    }
}

export async function readAppearanceConfigFromService() {
    const defaults = createDefaultAppearanceConfig();
    const snapshot = await readAppearanceRowsSnapshot();
    const rowMap = new Map(snapshot.map((row) => [row.key, row.value]));

    const parseJson = (key: (typeof APPEARANCE_KEYS)[number]) => {
        const value = rowMap.get(key);
        if (!value) {
            return undefined;
        }

        try {
            return JSON.parse(value) as unknown;
        } catch {
            return undefined;
        }
    };

    return {
        tokens: isRecord(parseJson("appearance.tokens")) ? { ...defaults.tokens, ...(parseJson("appearance.tokens") as Record<string, unknown>) } : defaults.tokens,
        presets: defaults.presets,
        assignments: defaults.assignments,
    } satisfies AppearanceRuntimeConfig;
}

export async function createDefaultAppearanceConfigFromSource() {
    return createDefaultAppearanceConfig();
}

export function createMalformedAppearancePayload() {
    return {
        tokens: {
            surfaceBackground: {
                heroLight: "linear-gradient(180deg,rgba(252,254,255,0.96),rgba(235,243,249,0.88))",
            },
            titleColor: {
                ink: 42,
            },
            bodyColor: {},
            badgeColor: {},
            accentColor: {},
            titleSize: {
                hero: "bad-value",
            },
            bodySize: {},
        } satisfies Record<string, unknown>,
        presets: {
            broken: {
                id: "broken",
                label: "Broken Preset",
                titleColor: "titleColor.missing",
                titleSize: "titleSize.missing",
            },
        },
        assignments: {
            "page.hero.news-listing": "missing-preset",
            "not.a.real.target": "broken",
        },
    };
}
