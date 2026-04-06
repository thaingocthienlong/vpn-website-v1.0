import path from "node:path";
import { config as loadEnv } from "dotenv";

let envLoaded = false;

export function loadE2EEnvironment() {
  if (envLoaded) {
    return;
  }

  loadEnv({ path: path.join(process.cwd(), ".env") });
  loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });

  process.env.CLERK_PUBLISHABLE_KEY ||= process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  envLoaded = true;
}

loadE2EEnvironment();

export const E2E_BASE_URL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
export const CLERK_STORAGE_STATE_PATH = path.join(process.cwd(), "playwright", ".clerk", "user.json");

export function requireEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
