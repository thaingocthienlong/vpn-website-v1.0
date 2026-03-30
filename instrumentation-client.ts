import * as Sentry from "@sentry/nextjs";
import {
  getClientSentryDsn,
  getSentryEnvironment,
  getSentryTracesSampleRate,
  shouldSendDefaultPii,
} from "./src/lib/monitoring/sentry-env";

const dsn = getClientSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    sendDefaultPii: shouldSendDefaultPii(),
    tracesSampleRate: getSentryTracesSampleRate(),
    enableLogs: true,
  });
}

export const onRouterTransitionStart = dsn
  ? Sentry.captureRouterTransitionStart
  : undefined;
