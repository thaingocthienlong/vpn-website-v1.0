import * as Sentry from "@sentry/nextjs";
import { isSentryMonitoringEnabled } from "./src/lib/monitoring/sentry-env";

export async function register() {
  if (!isSentryMonitoringEnabled()) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = (...args: Parameters<typeof Sentry.captureRequestError>) => {
  if (!isSentryMonitoringEnabled()) {
    return;
  }

  return Sentry.captureRequestError(...args);
};
