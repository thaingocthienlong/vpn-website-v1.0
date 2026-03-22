import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

/**
 * GET /api/homepage/sections
 * Get all enabled homepage sections for display
 */
export async function GET() {
    try {
        const sections = await prisma.homepageSection.findMany({
            where: { isEnabled: true },
            orderBy: { sortOrder: "asc" },
        });

        // Transform sections based on locale
        const transformedSections = sections.map((section) => {
            // Parse config JSON if stored as string
            let config = {};
            try {
                config = typeof section.config === "string"
                    ? JSON.parse(section.config)
                    : section.config || {};
            } catch {
                config = {};
            }

            return {
                id: section.id,
                sectionKey: section.sectionKey,
                isEnabled: section.isEnabled,
                sortOrder: section.sortOrder,
                config,
            };
        });

        return successResponse(transformedSections);
    } catch (error) {
        console.error("Error fetching homepage sections:", error);
        return errors.serverError("Không thể tải dữ liệu trang chủ");
    }
}
