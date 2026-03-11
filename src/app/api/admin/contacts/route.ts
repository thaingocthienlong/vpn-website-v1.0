import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    successResponse,
    errors,
    getPaginationParams,
    buildPaginationMeta,
} from "@/lib/api-response";

/**
 * GET /api/admin/contacts
 * List contact form submissions with filtering and pagination
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const { page, limit, skip } = getPaginationParams(searchParams);
        const status = searchParams.get("status"); // NEW, READ, REPLIED
        const search = searchParams.get("search");

        // Build filter
        const where: Record<string, unknown> = {};

        if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
                { message: { contains: search } },
            ];
        }

        const [contacts, total] = await Promise.all([
            prisma.contactForm.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    course: {
                        select: { id: true, title: true },
                    },
                },
            }),
            prisma.contactForm.count({ where }),
        ]);

        return successResponse(contacts, buildPaginationMeta(page, limit, total));
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return errors.serverError("Không thể tải danh sách liên hệ");
    }
}
