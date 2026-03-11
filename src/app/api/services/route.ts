import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";

/**
 * GET /api/services
 * Get all content sections marked as SERVICE type (for service pages)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);

        // Services are stored as Pages with specific slugs or as ContentSections with entityType = SERVICE
        // For this implementation, we'll get pages that are services
        const services = await prisma.page.findMany({
            where: {
                isPublished: true,
                slug: {
                    in: [
                        "nghien-cuu-khoa-hoc",
                        "chuyen-giao-cong-nghe",
                        "phat-trien-nhan-luc",
                        "hop-tac-quoc-te",
                        "tu-van-chinh-sach",
                        "ho-tro-doanh-nghiep",
                    ],
                },
            },
            orderBy: { sortOrder: "asc" },
            include: {
                featuredImage: {
                    select: { url: true, alt: true },
                },
            },
        });

        // Transform services based on locale
        const transformedServices = services.map((service) => ({
            id: service.id,
            title: locale === "en" && service.title_en ? service.title_en : service.title,
            slug: service.slug,
            excerpt: service.content?.substring(0, 200) || "",
            featuredImage: service.featuredImage?.url || null,
        }));

        return successResponse(transformedServices);
    } catch (error) {
        console.error("Error fetching services:", error);
        return errors.serverError("Không thể tải danh sách dịch vụ");
    }
}
