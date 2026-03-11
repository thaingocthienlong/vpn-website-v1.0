import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/contacts/[id]
 * Get single contact submission
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const contact = await prisma.contactForm.findUnique({
            where: { id },
            include: {
                course: {
                    select: { id: true, title: true, slug: true },
                },
            },
        });

        if (!contact) {
            return errors.notFound("Liên hệ");
        }

        return successResponse(contact);
    } catch (error) {
        console.error("Error fetching contact:", error);
        return errors.serverError("Không thể tải liên hệ");
    }
}

/**
 * PUT /api/admin/contacts/[id]
 * Update contact status (NEW → READ → REPLIED)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, notes } = body;

        const validStatuses = ["NEW", "READ", "REPLIED"];
        if (status && !validStatuses.includes(status)) {
            return errors.badRequest(`Status phải là: ${validStatuses.join(", ")}`);
        }

        const existing = await prisma.contactForm.findUnique({ where: { id } });
        if (!existing) {
            return errors.notFound("Liên hệ");
        }

        const updated = await prisma.contactForm.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(notes !== undefined && { subject: notes }), // Reuse subject field for admin notes
            },
        });

        return successResponse(updated);
    } catch (error) {
        console.error("Error updating contact:", error);
        return errors.serverError("Không thể cập nhật liên hệ");
    }
}

/**
 * DELETE /api/admin/contacts/[id]
 * Delete contact submission
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const existing = await prisma.contactForm.findUnique({ where: { id } });
        if (!existing) {
            return errors.notFound("Liên hệ");
        }

        await prisma.contactForm.delete({ where: { id } });

        return successResponse({ message: "Đã xóa liên hệ" });
    } catch (error) {
        console.error("Error deleting contact:", error);
        return errors.serverError("Không thể xóa liên hệ");
    }
}
