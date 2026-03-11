import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody, registrationSchema } from "@/lib/validators";
import { sendRegistrationToAdmin, sendRegistrationToUser } from "@/lib/email-templates";

/**
 * POST /api/registration
 * Submit course registration
 */
export async function POST(request: NextRequest) {
    try {
        // Validate request body
        const validation = await validateBody(request, registrationSchema);

        if (!validation.success) {
            return errors.validationError(validation.errors);
        }

        const { fullName, email, phone, courseId, organization, position, message } = validation.data;

        // Check if course exists and is open for registration
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                isPublished: true,
                isRegistrationOpen: true,
            },
            select: { id: true, title: true },
        });

        if (!course) {
            return errors.badRequest("Khóa học không tồn tại hoặc đã đóng đăng ký");
        }

        // Check for duplicate registration
        const existingRegistration = await prisma.registration.findFirst({
            where: {
                email,
                courseId,
                status: { in: ["NEW", "CONTACTED", "ENROLLED"] },
            },
        });

        if (existingRegistration) {
            return errors.badRequest("Bạn đã đăng ký khóa học này rồi");
        }

        // Create registration
        const registration = await prisma.registration.create({
            data: {
                fullName,
                email,
                phone,
                courseId,
                organization,
                position,
                message,
                status: "NEW",
            },
        });

        // Send email notifications (non-blocking)
        const emailData = {
            id: registration.id,
            fullName,
            email,
            phone,
            organization,
            position,
            message,
            courseName: course.title,
        };
        sendRegistrationToAdmin(emailData).catch(console.error);
        sendRegistrationToUser(emailData).catch(console.error);

        return successResponse(
            {
                id: registration.id,
                message: "Đăng ký thành công! Chúng tôi sẽ liên hệ bạn sớm.",
                course: course.title,
            },
            undefined,
            201
        );
    } catch (error) {
        console.error("Error creating registration:", error);
        return errors.serverError("Không thể gửi đăng ký. Vui lòng thử lại!");
    }
}
