import path from "node:path";
import { defineConfig, devices } from "playwright/test";
import { loadE2EEnvironment, E2E_BASE_URL, CLERK_STORAGE_STATE_PATH } from "./tests/e2e/support/env";

loadE2EEnvironment();

export default defineConfig({
  testDir: path.join("tests", "e2e"),
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  outputDir: "test-results",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: CLERK_STORAGE_STATE_PATH,
      },
      dependencies: ["setup"],
      testIgnore: /global\.setup\.ts/,
    },
  ],
});
