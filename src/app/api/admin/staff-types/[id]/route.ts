import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/admin/staff-types/[id] - Get a single staff type
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const id = (await params).id;
        const staffType = await prisma.staffType.findUnique({
            where: { id },
        });

        if (!staffType) return jsonError("Loại nhân sự không tồn tại", 404);
        return jsonSuccess(staffType);
    } catch (error) {
        console.error("Error fetching staff type:", error);
        return jsonError("Failed to fetch staff type", 500);
    }
}

/**
 * PUT /api/admin/staff-types/[id] - Update a staff type
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const id = (await params).id;
        const data = await request.json();

        if (!data.name) return jsonError("Tên loại nhân sự là bắt buộc", 400);

        const existing = await prisma.staffType.findUnique({ where: { id } });
        if (!existing) return jsonError("Loại nhân sự không tồn tại", 404);

        const updated = await prisma.staffType.update({
            where: { id },
            data: {
                name: data.name,
                name_en: data.name_en || null,
                level: data.level ?? existing.level,
                isAdvisory: data.isAdvisory ?? existing.isAdvisory,
                sortOrder: data.sortOrder ?? existing.sortOrder,
            },
        });

        return jsonSuccess(updated);
    } catch (error) {
        console.error("Error updating staff type:", error);
        return jsonError("Failed to update staff type", 500);
    }
}

/**
 * DELETE /api/admin/staff-types/[id] - Delete a staff type
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const id = (await params).id;

        // Check if there are staff assigned to this staff type
        const staffCount = await prisma.staff.count({
            where: { staffTypeId: id }
        });

        if (staffCount > 0) {
            return jsonError("Không thể xóa loại nhân sự đang có người. Vui lòng chuyển nhân sự sang loại khác trước.", 400);
        }

        await prisma.staffType.delete({
            where: { id },
        });

        return jsonSuccess({ deleted: true });
    } catch (error) {
        console.error("Error deleting staff type:", error);
        return jsonError("Failed to delete staff type", 500);
    }
}
