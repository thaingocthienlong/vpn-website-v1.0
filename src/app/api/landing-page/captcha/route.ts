import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildCaptchaToken, generateCaptchaCode, getCaptchaCookieName, renderCaptchaSvg } from "@/lib/landing-page/captcha";

export async function GET() {
    const code = generateCaptchaCode();
    const cookieStore = await cookies();
    const token = buildCaptchaToken(code);

    cookieStore.set(getCaptchaCookieName(), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
    });

    return new NextResponse(renderCaptchaSvg(code), {
        status: 200,
        headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "no-store, no-cache, must-revalidate",
        },
    });
}
