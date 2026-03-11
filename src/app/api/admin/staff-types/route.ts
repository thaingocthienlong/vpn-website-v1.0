import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/staff-types - List all staff types
 */
export async function GET() {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const staffTypes = await prisma.staffType.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return jsonSuccess(staffTypes);
    } catch (error) {
        console.error("Error fetching staff types:", error);
        return jsonError("Failed to fetch staff types", 500);
    }
}

/**
 * POST /api/admin/staff-types - Create a staff type
 */
export async function POST(request: Request) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const data = await request.json();

        if (!data.name) {
            return jsonError("Tên loại nhân sự là bắt buộc", 400);
        }

        const staffType = await prisma.staffType.create({
            data: {
                name: data.name,
                name_en: data.name_en || null,
                level: data.level || 99,
                isAdvisory: data.isAdvisory ?? false,
                sortOrder: data.sortOrder || 0,
            }
        });

        return jsonSuccess(staffType);
    } catch (error) {
        console.error("Error creating staff type:", error);
        return jsonError("Failed to create staff type", 500);
    }
}
