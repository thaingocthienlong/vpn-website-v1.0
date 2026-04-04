import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody } from "@/lib/validators";
import { adminTagSchema } from "@/lib/admin/schemas";

export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const search = request.nextUrl.searchParams.get("search")?.trim() || "";

    const tags = await prisma.tag.findMany({
        where: search
            ? {
                OR: [
                    { name: { contains: search } },
                    { slug: { contains: search } },
                ],
            }
            : undefined,
        include: {
            _count: {
                select: {
                    posts: true,
                },
            },
        },
        orderBy: [{ name: "asc" }],
    });

    return successResponse(tags);
}

export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const validation = await validateBody(request, adminTagSchema);
    if (!validation.success) {
        return errors.validationError(validation.errors);
    }

    const { name, slug } = validation.data;

    const existing = await prisma.tag.findFirst({
        where: {
            OR: [{ name }, { slug }],
        },
    });

    if (existing) {
        return errors.badRequest("A tag with the same name or slug already exists.");
    }

    const tag = await prisma.tag.create({
        data: { name, slug },
        include: {
            _count: {
                select: {
                    posts: true,
                },
            },
        },
    });

    return successResponse(tag, undefined, 201);
}
