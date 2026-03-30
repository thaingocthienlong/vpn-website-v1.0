import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import {
  isSentryMonitoringEnabled,
  isSentryVerificationRouteEnabled,
} from "@/lib/monitoring/sentry-env";

export async function GET() {
  if (!isSentryVerificationRouteEnabled()) {
    return NextResponse.json({ ok: false, message: "Not found." }, { status: 404 });
  }

  if (!isSentryMonitoringEnabled()) {
    return NextResponse.json(
      { ok: false, message: "Sentry is not configured for this environment." },
      { status: 503 }
    );
  }

  const error = new Error(`Sentry verification error ${new Date().toISOString()}`);
  const eventId = Sentry.captureException(error, {
    tags: {
      area: "monitoring",
      route: "sentry-check",
    },
  });

  await Sentry.flush(2000);

  return NextResponse.json(
    {
      ok: false,
      eventId,
      message: error.message,
    },
    { status: 500 }
  );
}
