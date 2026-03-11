import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBody, contactSchema } from "@/lib/validators";
import { successResponse, errors } from "@/lib/api-response";
import { sendContactToAdmin } from "@/lib/email-templates";

/**
 * POST /api/contact
 * Submit contact form - stores to Prisma ContactForm table
 */
export async function POST(request: NextRequest) {
    try {
        // Validate request body
        const validation = await validateBody(request, contactSchema);

        if (!validation.success) {
            return errors.validationError(
                validation.errors?.map((e: { field?: string; message?: string }) => ({
                    field: e.field || "unknown",
                    message: e.message || "Invalid",
                })) || []
            );
        }

        const { fullName, email, phone, subject, message } = validation.data;

        // Store to database
        const contact = await prisma.contactForm.create({
            data: {
                fullName,
                email,
                phone: phone || "",
                subject: subject || "Khác",
                message,
                status: "NEW",
            },
        });

        // Send email notification to admin (non-blocking)
        sendContactToAdmin({
            id: contact.id,
            fullName,
            email,
            phone: phone || undefined,
            subject: subject || "Khác",
            message,
        }).catch(console.error);

        return successResponse(
            {
                id: contact.id,
                message: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.",
            },
            undefined,
            201
        );
    } catch (error) {
        console.error("Error creating contact:", error);
        return errors.serverError("Không thể gửi tin nhắn. Vui lòng thử lại!");
    }
}
