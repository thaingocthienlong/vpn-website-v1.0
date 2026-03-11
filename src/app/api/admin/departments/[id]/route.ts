import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
export function generateSlug(text: string) {
    return text.toString().toLowerCase()
        .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ừ|ự/gi, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        .replace(/đ/gi, 'd')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * GET /api/admin/departments/[id] - Get a single department
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const id = (await params).id;
        const department = await prisma.department.findUnique({
            where: { id },
        });

        if (!department) return jsonError("Phòng ban không tồn tại", 404);
        return jsonSuccess(department);
    } catch (error) {
        console.error("Error fetching department:", error);
        return jsonError("Failed to fetch department", 500);
    }
}

/**
 * PUT /api/admin/departments/[id] - Update a department
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

        if (!data.name) return jsonError("Tên phòng ban là bắt buộc", 400);

        const existing = await prisma.department.findUnique({ where: { id } });
        if (!existing) return jsonError("Phòng ban không tồn tại", 404);

        let slug = existing.slug;
        if (data.name !== existing.name) {
            const baseSlug = generateSlug(data.name);
            slug = baseSlug;
            let counter = 1;
            while (await prisma.department.findFirst({ where: { slug, id: { not: id } } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
        }

        const updated = await prisma.department.update({
            where: { id },
            data: {
                name: data.name,
                name_en: data.name_en || null,
                slug,
                description: data.description || null,
                sortOrder: data.sortOrder ?? existing.sortOrder,
                isActive: data.isActive ?? existing.isActive,
            },
        });

        return jsonSuccess(updated);
    } catch (error) {
        console.error("Error updating department:", error);
        return jsonError("Failed to update department", 500);
    }
}

/**
 * DELETE /api/admin/departments/[id] - Delete a department
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const id = (await params).id;

        // Check if there are staff assigned to this department
        const staffCount = await prisma.staff.count({
            where: { departmentId: id }
        });

        if (staffCount > 0) {
            return jsonError("Không thể xóa phòng ban đang có nhân sự. Vui lòng chuyển nhân sự sang phòng ban khác trước.", 400);
        }

        await prisma.department.delete({
            where: { id },
        });

        return jsonSuccess({ deleted: true });
    } catch (error) {
        console.error("Error deleting department:", error);
        return jsonError("Failed to delete department", 500);
    }
}
