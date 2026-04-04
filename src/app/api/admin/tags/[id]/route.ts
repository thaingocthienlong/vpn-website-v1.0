import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody } from "@/lib/validators";
import { adminTagSchema } from "@/lib/admin/schemas";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;

    const tag = await prisma.tag.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    posts: true,
                },
            },
        },
    });

    if (!tag) {
        return errors.notFound("Tag");
    }

    return successResponse(tag);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const validation = await validateBody(request, adminTagSchema);
    if (!validation.success) {
        return errors.validationError(validation.errors);
    }

    const { name, slug } = validation.data;
    const existing = await prisma.tag.findUnique({ where: { id } });

    if (!existing) {
        return errors.notFound("Tag");
    }

    const duplicate = await prisma.tag.findFirst({
        where: {
            id: { not: id },
            OR: [{ name }, { slug }],
        },
    });

    if (duplicate) {
        return errors.badRequest("A tag with the same name or slug already exists.");
    }

    const tag = await prisma.tag.update({
        where: { id },
        data: { name, slug },
        include: {
            _count: {
                select: {
                    posts: true,
                },
            },
        },
    });

    return successResponse(tag);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const existing = await prisma.tag.findUnique({ where: { id } });

    if (!existing) {
        return errors.notFound("Tag");
    }

    await prisma.$transaction([
        prisma.postTag.deleteMany({ where: { tagId: id } }),
        prisma.tag.delete({ where: { id } }),
    ]);

    return successResponse({ deleted: true });
}
