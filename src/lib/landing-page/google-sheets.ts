export async function sendLandingLeadToGoogleSheets(payload: Record<string, unknown>) {
    const webhookUrl = process.env.LANDING_PAGE_GOOGLE_SHEETS_WEBHOOK_URL;

    if (!webhookUrl) {
        return { status: "SKIPPED" as const };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
            cache: "no-store",
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            return { status: "FAILED" as const, error: `Webhook responded with ${response.status}` };
        }

        return { status: "SYNCED" as const };
    } catch (error) {
        return {
            status: "FAILED" as const,
            error: error instanceof Error ? error.message : "Unknown Google Sheets sync error",
        };
    }
}
