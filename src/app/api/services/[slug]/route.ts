import { NextRequest } from "next/server";
import { successResponse, errors, getLocale } from "@/lib/api-response";
import { getServicePagePayload } from "@/lib/services/site-content";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

/**
 * GET /api/services/[slug]
 * Get single service page by slug with dynamic sections (TOC)
 * Services are stored as Pages with ContentSections of entityType=SERVICE
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);

        const payload = await getServicePagePayload(slug, locale);
        if (!payload.service) {
            return errors.notFound("Dịch vụ");
        }
        return successResponse(payload);
    } catch (error) {
        console.error("Error fetching service:", error);
        return errors.serverError("Không thể tải dịch vụ");
    }
}
