import { expect, test } from "playwright/test";
import { loadE2EEnvironment, E2E_BASE_URL } from "./support/env";
import {
    attachJsonArtifact,
    captureScreenshot,
    createDefaultAppearanceConfigFromSource,
    createMalformedAppearancePayload,
    deleteAppearanceRows,
    getTargetHeadingStyle,
    getTargetRootStyle,
    gotoAppearanceAdmin,
    readAppearanceConfigFromService,
    readAppearanceConfigViaApi,
    readAppearanceRowsSnapshot,
    resolveTokenIdForTarget,
    restoreAppearanceRows,
    saveAppearanceViaUi,
    selectAppearanceTab,
    submitMalformedAppearanceConfig,
    writeAppearanceConfigViaApi,
} from "./support/appearance";

loadE2EEnvironment();

const HOMEPAGE_NEWS_HEADER_TARGET = "homepage.section.news.header";
const NEWS_HERO_TARGET = "page.hero.news-listing";
const SERVICES_HERO_TARGET = "page.hero.services-listing";
const SERVICES_CARD_TARGET = "card.service.listing";
const TRAINING_HERO_TARGET = "page.hero.training-listing";
const HOMEPAGE_NEWS_TITLE_SIZE = "5rem";
const WHITE_RGB = "rgb(255, 255, 255)";

test.describe.serial("admin appearance full verification", () => {
    test("runtime loader falls back to defaults when appearance rows are missing", async ({ page }, testInfo) => {
        const snapshot = await readAppearanceRowsSnapshot();

        try {
            await deleteAppearanceRows();
            const fallbackConfig = await readAppearanceConfigFromService();
            expect(fallbackConfig).toEqual(await createDefaultAppearanceConfigFromSource());
            await attachJsonArtifact(testInfo, "appearance-missing-rows-fallback", fallbackConfig);
            await page.goto("/tin-tuc");
            await expect(page.locator("main h1").first()).toHaveText("Tin tức & Sự kiện");
            await captureScreenshot(page, testInfo, "appearance-news-hero-with-missing-rows");
        } finally {
            await restoreAppearanceRows(snapshot);
        }
    });

    test("blocks unauthenticated admin page and api access", async ({ playwright }, testInfo) => {
        const anonymousBrowser = await playwright.chromium.launch();
        const anonymousContext = await anonymousBrowser.newContext();
        const anonymousPage = await anonymousContext.newPage();

        await anonymousPage.goto("/admin/site/appearance");
        await expect(anonymousPage.getByRole("heading", { name: "Appearance System" })).toHaveCount(0);
        await expect(anonymousPage.getByTestId("appearance-save-button")).toHaveCount(0);
        await expect(anonymousPage.getByTestId("appearance-tab-tokens")).toHaveCount(0);
        await captureScreenshot(anonymousPage, testInfo, "appearance-admin-unauthenticated-page");

        const apiResponse = await fetch(`${E2E_BASE_URL}/api/admin/appearance`, {
            method: "GET",
            redirect: "manual",
        });
        const apiLocation = apiResponse.headers.get("location");

        expect(
            apiResponse.status === 401 ||
                ((apiResponse.status === 307 || apiResponse.status === 302) && Boolean(apiLocation)),
        ).toBeTruthy();

        const apiPayload =
            apiResponse.status === 401
                ? await apiResponse.json()
                : {
                    redirectedTo: apiLocation,
                    status: apiResponse.status,
                };

        if (apiResponse.status === 401) {
            expect(apiPayload).toEqual(
                expect.objectContaining({
                    success: false,
                    error: "Unauthorized",
                }),
            );
        } else {
            expect(apiLocation).toBeTruthy();
        }

        await attachJsonArtifact(testInfo, "appearance-admin-unauthenticated-api", apiPayload);
        await anonymousContext.close();
        await anonymousBrowser.close();
    });

    test("loads the admin payload and exposes all appearance tabs", async ({ page }, testInfo) => {
        const payload = await gotoAppearanceAdmin(page, testInfo);
        expect(payload.targets.length).toBeGreaterThan(0);
        expect(payload.tokenGroups.length).toBeGreaterThan(0);

        await captureScreenshot(page, testInfo, "appearance-admin-loaded");

        await selectAppearanceTab(page, "tokens");
        await expect(page.getByTestId("appearance-token-input-titleSize-section")).toBeVisible();

        await selectAppearanceTab(page, "presets");
        await expect(page.getByTestId("appearance-add-preset-button")).toBeVisible();

        await selectAppearanceTab(page, "assignments");
        await expect(page.getByTestId(`appearance-assignment-${NEWS_HERO_TARGET}`)).toBeVisible();
    });

    test("persists token edits and applies them to the homepage news section header", async ({ page }, testInfo) => {
        const payload = await gotoAppearanceAdmin(page);
        const originalConfig = await readAppearanceConfigViaApi(page);
        const titleSizeTokenId = resolveTokenIdForTarget(payload, HOMEPAGE_NEWS_HEADER_TARGET, "titleSize", "titleSize");

        try {
            await selectAppearanceTab(page, "tokens");
            await page.getByTestId(`appearance-token-input-titleSize-${titleSizeTokenId}`).fill(HOMEPAGE_NEWS_TITLE_SIZE);
            await captureScreenshot(page, testInfo, "appearance-admin-token-before-save");

            await saveAppearanceViaUi(page, testInfo);
            await page.reload();
            await expect(page.getByTestId(`appearance-token-input-titleSize-${titleSizeTokenId}`)).toHaveValue(HOMEPAGE_NEWS_TITLE_SIZE);
            await captureScreenshot(page, testInfo, "appearance-admin-token-after-save");

            await page.goto("/");
            const fontSize = await getTargetHeadingStyle(page, HOMEPAGE_NEWS_HEADER_TARGET, "font-size");
            expect(fontSize).toBe("80px");
            await captureScreenshot(page, testInfo, "appearance-homepage-news-header");
        } finally {
            await page.goto("/admin/site/appearance");
            await writeAppearanceConfigViaApi(page, originalConfig);
        }
    });

    test("creates a preset, assigns it to multiple targets, and preserves unassigned defaults", async ({ page }, testInfo) => {
        await gotoAppearanceAdmin(page);
        const originalConfig = await readAppearanceConfigViaApi(page);
        const nextPresetId = `custom-preset-${Object.keys(originalConfig.presets).length + 1}`;

        try {
            await selectAppearanceTab(page, "presets");
            await page.getByTestId("appearance-add-preset-button").click();
            await expect(page.getByTestId(`appearance-preset-label-${nextPresetId}`)).toBeVisible();

            await page.getByTestId(`appearance-preset-label-${nextPresetId}`).fill("E2E Dark Routes");
            await page.selectOption(
                `[data-testid="appearance-preset-field-${nextPresetId}-surfaceBackground"]`,
                "surfaceBackground.sectionDark",
            );
            await page.selectOption(
                `[data-testid="appearance-preset-field-${nextPresetId}-titleColor"]`,
                "titleColor.white",
            );
            await page.selectOption(
                `[data-testid="appearance-preset-field-${nextPresetId}-bodyColor"]`,
                "bodyColor.whiteSoft",
            );
            await page.selectOption(
                `[data-testid="appearance-preset-field-${nextPresetId}-badgeColor"]`,
                "badgeColor.onDark",
            );
            await page.selectOption(
                `[data-testid="appearance-preset-field-${nextPresetId}-accentColor"]`,
                "accentColor.white",
            );
            await page.selectOption(
                `[data-testid="appearance-preset-field-${nextPresetId}-titleSize"]`,
                "titleSize.endcap",
            );
            await page.selectOption(
                `[data-testid="appearance-preset-field-${nextPresetId}-bodySize"]`,
                "bodySize.endcap",
            );

            await selectAppearanceTab(page, "assignments");
            await page.selectOption(`[data-testid="appearance-assignment-${NEWS_HERO_TARGET}"]`, nextPresetId);
            await page.selectOption(`[data-testid="appearance-assignment-${SERVICES_HERO_TARGET}"]`, nextPresetId);
            await page.selectOption(`[data-testid="appearance-assignment-${SERVICES_CARD_TARGET}"]`, nextPresetId);
            await captureScreenshot(page, testInfo, "appearance-admin-assignments-before-save");

            const savedPayload = await saveAppearanceViaUi(page, testInfo);
            expect(savedPayload.assignments[NEWS_HERO_TARGET]).toBe(nextPresetId);
            expect(savedPayload.assignments[SERVICES_HERO_TARGET]).toBe(nextPresetId);
            expect(savedPayload.assignments[SERVICES_CARD_TARGET]).toBe(nextPresetId);

            await page.reload();
            await selectAppearanceTab(page, "presets");
            await expect(page.getByTestId(`appearance-preset-label-${nextPresetId}`)).toHaveValue("E2E Dark Routes");
            await selectAppearanceTab(page, "assignments");
            await expect(page.getByTestId(`appearance-assignment-${NEWS_HERO_TARGET}`)).toHaveValue(nextPresetId);
            await expect(page.getByTestId(`appearance-assignment-${SERVICES_HERO_TARGET}`)).toHaveValue(nextPresetId);
            await expect(page.getByTestId(`appearance-assignment-${SERVICES_CARD_TARGET}`)).toHaveValue(nextPresetId);

            await page.goto("/tin-tuc");
            expect(await getTargetHeadingStyle(page, NEWS_HERO_TARGET, "color")).toBe(WHITE_RGB);
            await captureScreenshot(page, testInfo, "appearance-news-hero-custom-preset");

            await page.goto("/en/news");
            expect(await getTargetHeadingStyle(page, NEWS_HERO_TARGET, "color")).toBe(WHITE_RGB);
            await captureScreenshot(page, testInfo, "appearance-news-hero-locale-custom-preset");

            await page.goto("/dich-vu");
            expect(await getTargetHeadingStyle(page, SERVICES_HERO_TARGET, "color")).toBe(WHITE_RGB);
            expect(await getTargetHeadingStyle(page, SERVICES_CARD_TARGET, "color")).toBe(WHITE_RGB);
            expect(await getTargetRootStyle(page, SERVICES_HERO_TARGET, "background-image")).toContain("rgb(22, 48, 73)");
            await captureScreenshot(page, testInfo, "appearance-services-custom-preset");

            await page.goto("/dao-tao");
            expect(await getTargetHeadingStyle(page, TRAINING_HERO_TARGET, "color")).not.toBe(WHITE_RGB);
        } finally {
            await page.goto("/admin/site/appearance");
            await writeAppearanceConfigViaApi(page, originalConfig);
        }
    });

    test("sanitizes malformed payloads and keeps the public news hero renderable", async ({ page }, testInfo) => {
        await gotoAppearanceAdmin(page);
        const originalConfig = await readAppearanceConfigViaApi(page);

        try {
            const sanitizedPayload = await submitMalformedAppearanceConfig(page, createMalformedAppearancePayload());
            await attachJsonArtifact(testInfo, "appearance-sanitized-payload", sanitizedPayload);

            expect(sanitizedPayload.tokens.titleSize.hero).toBe(originalConfig.tokens.titleSize.hero);
            expect(sanitizedPayload.assignments[NEWS_HERO_TARGET]).toBe(originalConfig.assignments[NEWS_HERO_TARGET]);
            expect(sanitizedPayload.presets.broken).toEqual({
                id: "broken",
                label: "Broken Preset",
            });

            const refreshedConfig = await readAppearanceConfigViaApi(page);
            expect(refreshedConfig.tokens.titleSize.hero).toBe(originalConfig.tokens.titleSize.hero);
            expect(refreshedConfig.assignments[NEWS_HERO_TARGET]).toBe(originalConfig.assignments[NEWS_HERO_TARGET]);

            await page.goto("/tin-tuc");
            await expect(page.locator("main h1").first()).toHaveText("Tin tức & Sự kiện");
            await captureScreenshot(page, testInfo, "appearance-news-hero-after-sanitization");
        } finally {
            await page.goto("/admin/site/appearance");
            await writeAppearanceConfigViaApi(page, originalConfig);
        }
    });
});
