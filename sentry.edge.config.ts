import * as Sentry from "@sentry/nextjs";
import {
  getSentryEnvironment,
  getSentryTracesSampleRate,
  getServerSentryDsn,
  shouldSendDefaultPii,
} from "./src/lib/monitoring/sentry-env";

const dsn = getServerSentryDsn();

if (dsn) {
  Sentry.init({
    dsn,
    environment: getSentryEnvironment(),
    sendDefaultPii: shouldSendDefaultPii(),
    tracesSampleRate: getSentryTracesSampleRate(),
    enableLogs: true,
  });
}
