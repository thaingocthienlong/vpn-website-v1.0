import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors } from "@/lib/api-response";

/**
 * GET /api/admin/registrations
 * List registrations with optional filters
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const courseId = searchParams.get("courseId");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (status) where.status = status;
        if (courseId) where.courseId = courseId;
        if (search) {
            where.OR = [
                { fullName: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ];
        }

        const [registrations, total] = await Promise.all([
            prisma.registration.findMany({
                where,
                include: {
                    course: { select: { id: true, title: true } },
                },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.registration.count({ where }),
        ]);

        return successResponse({
            registrations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error listing registrations:", error);
        return errors.serverError("Không thể tải danh sách đăng ký");
    }
}
