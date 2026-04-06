import { expect, test, type Page } from "playwright/test";
import { loadE2EEnvironment } from "./support/env";

loadE2EEnvironment();

type AppearanceRuntimeConfig = {
  tokens: Record<string, Record<string, string>>;
  presets: Record<string, { id: string; label: string; titleSize?: string }>;
  assignments: Record<string, string>;
};

type AppearanceApiResponse = {
  success: boolean;
  data?: AppearanceRuntimeConfig & {
    tokenGroups?: unknown[];
    targets?: unknown[];
  };
  error?: string;
};

const TARGET_ID = "page.hero.news-listing";
const OVERRIDE_TITLE_SIZE = "4rem";

async function readAppearanceConfig(page: Page) {
  const result = await page.evaluate(async () => {
    const response = await fetch("/api/admin/appearance", { method: "GET" });
    return (await response.json()) as AppearanceApiResponse;
  });

  if (!result.success || !result.data) {
    throw new Error(result.error || "Unable to read appearance config.");
  }

  return {
    tokens: result.data.tokens,
    presets: result.data.presets,
    assignments: result.data.assignments,
  };
}

async function writeAppearanceConfig(page: Page, config: AppearanceRuntimeConfig) {
  const result = await page.evaluate(async (payload: AppearanceRuntimeConfig) => {
    const response = await fetch("/api/admin/appearance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return (await response.json()) as AppearanceApiResponse;
  }, config);

  if (!result.success) {
    throw new Error(result.error || "Unable to write appearance config.");
  }
}

function resolveTitleSizeTokenId(config: AppearanceRuntimeConfig) {
  const presetId = config.assignments[TARGET_ID] || "page-hero-light";
  const preset = config.presets[presetId];
  const tokenReference = preset?.titleSize;

  if (!tokenReference || !tokenReference.startsWith("titleSize.")) {
    throw new Error(`Target ${TARGET_ID} is not bound to a titleSize token.`);
  }

  return tokenReference.slice("titleSize.".length);
}

test.describe.serial("admin appearance", () => {
  test("saves a token change through the admin UI and applies it to the news hero", async ({ page }) => {
    await page.goto("/admin/site/appearance");
    await expect(page.getByRole("heading", { name: "Appearance System" })).toBeVisible();

    const originalConfig = await readAppearanceConfig(page);
    const titleSizeTokenId = resolveTitleSizeTokenId(originalConfig);

    try {
      await page.getByTestId(`appearance-token-input-titleSize-${titleSizeTokenId}`).fill(OVERRIDE_TITLE_SIZE);
      await page.getByTestId("appearance-save-button").click();
      await expect(page.getByTestId("appearance-status-message")).toHaveText(/Appearance settings updated\./i);

      const savedConfig = await readAppearanceConfig(page);
      expect(savedConfig.tokens.titleSize[titleSizeTokenId]).toBe(OVERRIDE_TITLE_SIZE);

      await page.goto("/tin-tuc");
      const heroHeading = page.locator("main h1").first();
      await expect(heroHeading).toBeVisible();

      const headingFontSize = await heroHeading.evaluate((node: HTMLElement) => window.getComputedStyle(node).fontSize);
      expect(headingFontSize).toBe("64px");
    } finally {
      await page.goto("/admin/site/appearance");
      await writeAppearanceConfig(page, originalConfig);
    }
  });
});
