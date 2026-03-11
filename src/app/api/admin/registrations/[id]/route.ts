import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";
import { sendStatusUpdateToUser } from "@/lib/email-templates";

/**
 * GET /api/admin/registrations/[id]
 * Get single registration details
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const registration = await prisma.registration.findUnique({
            where: { id },
            include: {
                course: { select: { id: true, title: true } },
            },
        });

        if (!registration) {
            return errors.notFound("Đăng ký không tồn tại");
        }

        return successResponse(registration);
    } catch (error) {
        console.error("Error fetching registration:", error);
        return errors.serverError("Không thể tải thông tin đăng ký");
    }
}

/**
 * PUT /api/admin/registrations/[id]
 * Update registration status (triggers email to user)
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const validStatuses = ["NEW", "CONTACTED", "ENROLLED", "CANCELLED"];
        if (!status || !validStatuses.includes(status)) {
            return errors.badRequest(`Trạng thái không hợp lệ. Cho phép: ${validStatuses.join(", ")}`);
        }

        // Find existing registration
        const existing = await prisma.registration.findUnique({
            where: { id },
            include: { course: { select: { title: true } } },
        });

        if (!existing) {
            return errors.notFound("Đăng ký không tồn tại");
        }

        // Update status
        const updated = await prisma.registration.update({
            where: { id },
            data: { status },
            include: { course: { select: { id: true, title: true } } },
        });

        // Send status update email to user (non-blocking)
        if (status !== existing.status) {
            sendStatusUpdateToUser({
                fullName: updated.fullName,
                email: updated.email,
                courseName: updated.course.title,
                newStatus: status,
            }).catch(console.error);
        }

        return successResponse(updated);
    } catch (error) {
        console.error("Error updating registration:", error);
        return errors.serverError("Không thể cập nhật đăng ký");
    }
}

/**
 * DELETE /api/admin/registrations/[id]
 * Delete a registration
 */
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const existing = await prisma.registration.findUnique({
            where: { id },
        });

        if (!existing) {
            return errors.notFound("Đăng ký không tồn tại");
        }

        await prisma.registration.delete({ where: { id } });

        return successResponse({ message: "Đã xóa đăng ký thành công" });
    } catch (error) {
        console.error("Error deleting registration:", error);
        return errors.serverError("Không thể xóa đăng ký");
    }
}
