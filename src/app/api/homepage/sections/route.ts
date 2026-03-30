import { NextRequest } from "next/server";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { getHomepageSections } from "@/lib/services/api-services";

/**
 * GET /api/homepage/sections
 * Get all enabled homepage sections for display
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);
        const sections = await getHomepageSections(locale);
        return successResponse(sections);
    } catch (error) {
        console.error("Error fetching homepage sections:", error);
        return errors.serverError("Không thể tải dữ liệu trang chủ");
    }
}
