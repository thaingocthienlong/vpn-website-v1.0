import { NextRequest } from "next/server";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { getServiceSummaries } from "@/lib/services/site-content";

/**
 * GET /api/services
 * Get all content sections marked as SERVICE type (for service pages)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);
        return successResponse(await getServiceSummaries(locale));
    } catch (error) {
        console.error("Error fetching services:", error);
        return errors.serverError("Không thể tải danh sách dịch vụ");
    }
}
