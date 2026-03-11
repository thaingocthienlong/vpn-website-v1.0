import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/staff/[id] - Get single staff member
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const staff = await prisma.staff.findUnique({
        where: { id },
        include: {
            staffType: { select: { id: true, name: true, level: true } },
            department: { select: { id: true, name: true } },
        },
    });

    if (!staff) return jsonError("Staff not found", 404);
    return jsonSuccess(staff);
}

/**
 * PUT /api/admin/staff/[id] - Update staff member
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    try {
        const body = await request.json();
        const {
            name, name_en, title, title_en, bio, bio_en, email, phone,
            staffTypeId, departmentId, sortOrder, isActive, avatarId_en,
        } = body;

        const existing = await prisma.staff.findUnique({ where: { id } });
        if (!existing) return jsonError("Staff not found", 404);

        const staff = await prisma.staff.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(name_en !== undefined && { name_en: name_en || null }),
                ...(title !== undefined && { title: title || null }),
                ...(title_en !== undefined && { title_en: title_en || null }),
                ...(bio !== undefined && { bio: bio || null }),
                ...(bio_en !== undefined && { bio_en: bio_en || null }),
                ...(email !== undefined && { email: email || null }),
                ...(phone !== undefined && { phone: phone || null }),
                ...(staffTypeId !== undefined && { staffTypeId }),
                ...(departmentId !== undefined && { departmentId: departmentId || null }),
                ...(sortOrder !== undefined && { sortOrder }),
                ...(isActive !== undefined && { isActive }),
                ...(avatarId_en !== undefined && { avatarId_en: avatarId_en || null }),
            },
            include: {
                staffType: { select: { id: true, name: true } },
                department: { select: { id: true, name: true } },
            },
        });

        return jsonSuccess(staff);
    } catch (error) {
        console.error("Error updating staff:", error);
        return jsonError("Failed to update staff", 500);
    }
}

/**
 * DELETE /api/admin/staff/[id] - Delete staff member
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    try {
        const existing = await prisma.staff.findUnique({ where: { id } });
        if (!existing) return jsonError("Staff not found", 404);

        await prisma.staff.delete({ where: { id } });
        return jsonSuccess({ message: "Staff deleted" });
    } catch (error) {
        console.error("Error deleting staff:", error);
        return jsonError("Failed to delete staff", 500);
    }
}
