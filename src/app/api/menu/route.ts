import { NextRequest } from "next/server";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { getMenuTree } from "@/lib/services/site-content";

/**
 * GET /api/menu
 * Get navigation menu items for header/navbar
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);
        return successResponse(await getMenuTree(locale));
    } catch (error) {
        console.error("Error fetching menu:", error);
        return errors.serverError("Không thể tải menu");
    }
}
