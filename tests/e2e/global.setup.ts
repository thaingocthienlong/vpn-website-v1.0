import fs from "node:fs";
import path from "node:path";
import { expect, test as setup } from "playwright/test";
import { createClerkClient } from "@clerk/backend";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { CLERK_STORAGE_STATE_PATH, E2E_BASE_URL, requireEnvironmentVariable } from "./support/env";

setup.describe.configure({ mode: "serial" });

async function resolveE2EUserId() {
  const secretKey = requireEnvironmentVariable("CLERK_SECRET_KEY");
  const explicitUserId = process.env.E2E_CLERK_USER_ID;
  if (explicitUserId) {
    return explicitUserId;
  }

  const clerkClient = createClerkClient({ secretKey });
  const explicitEmail = process.env.E2E_CLERK_USER_EMAIL;
  if (explicitEmail) {
    const matchingUsers = await clerkClient.users.getUserList({ emailAddress: [explicitEmail] });
    if (matchingUsers.data.length === 0) {
      throw new Error(`No Clerk user found for E2E_CLERK_USER_EMAIL=${explicitEmail}.`);
    }
    return matchingUsers.data[0].id;
  }

  const existingUsers = await clerkClient.users.getUserList({ limit: 1, orderBy: "-created_at" });
  if (existingUsers.data.length > 0) {
    return existingUsers.data[0].id;
  }

  throw new Error(
    "No Clerk users are available for E2E authentication. Set E2E_CLERK_USER_ID or E2E_CLERK_USER_EMAIL to an existing Clerk user.",
  );
}

setup("bootstrap Clerk testing token", async () => {
  requireEnvironmentVariable("CLERK_PUBLISHABLE_KEY");
  await clerkSetup();
});

setup("authenticate Clerk session and persist storage state", async ({ page }) => {
  const secretKey = requireEnvironmentVariable("CLERK_SECRET_KEY");
  const userId = await resolveE2EUserId();
  const clerkClient = createClerkClient({ secretKey });
  const signInToken = await clerkClient.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 300,
  });

  await page.goto(E2E_BASE_URL);
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "ticket",
      ticket: signInToken.token,
    },
  });

  await page.goto(`${E2E_BASE_URL}/admin/site/appearance`);
  await expect(page.getByRole("heading", { name: "Appearance System" })).toBeVisible();

  fs.mkdirSync(path.dirname(CLERK_STORAGE_STATE_PATH), { recursive: true });
  await page.context().storageState({ path: CLERK_STORAGE_STATE_PATH });
});
