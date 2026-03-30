function toOptionalString(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value : undefined;
}

function parseSampleRate(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
    return fallback;
  }

  return parsed;
}

export function getClientSentryDsn(): string | undefined {
  return toOptionalString(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function getServerSentryDsn(): string | undefined {
  return toOptionalString(process.env.SENTRY_DSN) ?? getClientSentryDsn();
}

export function isSentryMonitoringEnabled(): boolean {
  return Boolean(getServerSentryDsn() || getClientSentryDsn());
}

export function isSentryVerificationRouteEnabled(): boolean {
  return process.env.ENABLE_SENTRY_TEST_ROUTE === "true";
}

export function getSentryEnvironment(): string | undefined {
  return toOptionalString(process.env.SENTRY_ENVIRONMENT) ?? toOptionalString(process.env.NODE_ENV);
}

export function getSentryTracesSampleRate(): number {
  return parseSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? process.env.SENTRY_TRACES_SAMPLE_RATE,
    process.env.NODE_ENV === "development" ? 1 : 0.1
  );
}

export function shouldSendDefaultPii(): boolean {
  return process.env.SENTRY_SEND_DEFAULT_PII === "true";
}
