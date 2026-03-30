import { NextRequest } from "next/server";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { getSiteLayout } from "@/lib/services/site-content";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);
        return successResponse(await getSiteLayout(locale));
    } catch (error) {
        console.error("Error fetching layout payload:", error);
        return errors.serverError("Không thể tải cấu hình giao diện");
    }
}
