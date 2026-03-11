import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/staff - List all staff
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const type = searchParams.get("type") || "";

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search };
    if (departmentId) where.departmentId = departmentId;
    if (type === "advisory") {
        where.staffType = { name: "Hội đồng Cố vấn Khoa học" };
    } else if (type === "staff") {
        where.staffType = { name: { not: "Hội đồng Cố vấn Khoa học" } };
    }

    const staff = await prisma.staff.findMany({
        where,
        include: {
            staffType: { select: { id: true, name: true, level: true } },
            department: { select: { id: true, name: true } },
        },
        orderBy: { sortOrder: "asc" },
    });

    return jsonSuccess(staff);
}

/**
 * POST /api/admin/staff - Create staff member
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const {
            name, name_en, title, title_en, bio, bio_en, email, phone,
            staffTypeId, departmentId,
            sortOrder = 0, isActive = true,
        } = body;

        if (!name || !staffTypeId) {
            return jsonError("Name and staff type are required", 422);
        }

        const staff = await prisma.staff.create({
            data: {
                name,
                name_en: name_en || null,
                title: title || null,
                title_en: title_en || null,
                bio: bio || null,
                bio_en: bio_en || null,
                email: email || null,
                phone: phone || null,
                staffTypeId,
                departmentId: departmentId || null,
                sortOrder,
                isActive,
            },
            include: {
                staffType: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
            },
        });

        return jsonSuccess(staff, 201);
    } catch (error) {
        console.error("Error creating staff:", error);
        return jsonError("Failed to create staff", 500);
    }
}
