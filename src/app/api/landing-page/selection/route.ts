import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
    LANDING_SELECTION_COOKIE,
    landingSelectionCookieOptions,
    parseLandingPageSelection,
    serializeLandingPageSelection,
} from "@/lib/landing-page/selection";

interface LandingSelectionRequestBody {
    action?: string;
    campaignSlug?: string;
    programSlug?: string;
}

function badRequest(message: string) {
    return NextResponse.json({ ok: false, message }, { status: 400 });
}

async function clearLandingSelectionCookie() {
    const cookieStore = await cookies();
    cookieStore.set(LANDING_SELECTION_COOKIE, "", {
        ...landingSelectionCookieOptions,
        maxAge: 0,
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null) as LandingSelectionRequestBody | null;

    if (!body || typeof body !== "object") {
        return badRequest("Invalid landing page selection payload");
    }

    if (body.action === "clear") {
        await clearLandingSelectionCookie();
        return NextResponse.json({ ok: true, action: "clear" });
    }

    if (body.action !== "select") {
        return badRequest("Unsupported landing page selection action");
    }

    const serializedSelection = serializeLandingPageSelection({
        campaignSlug: body.campaignSlug || "",
        programSlug: body.programSlug,
    });
    const selection = parseLandingPageSelection(serializedSelection);

    if (!selection) {
        return badRequest("Invalid landing page campaign or program");
    }

    const cookieStore = await cookies();
    cookieStore.set(
        LANDING_SELECTION_COOKIE,
        serializeLandingPageSelection(selection),
        landingSelectionCookieOptions,
    );

    return NextResponse.json({ ok: true, action: "select" });
}
