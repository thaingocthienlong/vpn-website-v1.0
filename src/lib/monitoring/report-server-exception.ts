import * as Sentry from "@sentry/nextjs";

type ReportServerExceptionOptions = {
  area: string;
  message: string;
  extra?: Record<string, unknown>;
};

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  return new Error("Unknown server exception");
}

export function reportServerException(
  options: ReportServerExceptionOptions,
  error: unknown
) {
  console.error(options.message, error);

  Sentry.captureException(normalizeError(error), {
    tags: {
      area: options.area,
    },
    extra: options.extra,
  });
}
