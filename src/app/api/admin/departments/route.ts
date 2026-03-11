import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
export function generateSlug(text: string) {
    return text.toString().toLowerCase()
        .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
        .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
        .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
        .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
        .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
        .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
        .replace(/đ/gi, 'd')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * GET /api/admin/departments - List all departments
 */
export async function GET() {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const departments = await prisma.department.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return jsonSuccess(departments);
    } catch (error) {
        console.error("Error fetching departments:", error);
        return jsonError("Failed to fetch departments", 500);
    }
}

/**
 * POST /api/admin/departments - Create a department
 */
export async function POST(request: Request) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const data = await request.json();

        if (!data.name) {
            return jsonError("Tên phòng ban là bắt buộc", 400);
        }

        const baseSlug = generateSlug(data.name);
        let slug = baseSlug;
        let counter = 1;

        while (await prisma.department.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const department = await prisma.department.create({
            data: {
                name: data.name,
                name_en: data.name_en || null,
                slug,
                description: data.description || null,
                sortOrder: data.sortOrder || 0,
                isActive: data.isActive ?? true,
            }
        });

        return jsonSuccess(department);
    } catch (error) {
        console.error("Error creating department:", error);
        return jsonError("Failed to create department", 500);
    }
}
