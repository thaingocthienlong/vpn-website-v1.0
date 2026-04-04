import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ensureUserExists, requireAdmin } from "@/lib/admin-auth";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody } from "@/lib/validators";
import { adminReviewSchema } from "@/lib/admin/schemas";
import { revalidateHomepage } from "@/lib/admin/revalidation";

type RouteParams = { params: Promise<{ id: string }> };

async function resolveAvatarId(input: string | null | undefined, userId: string) {
    if (input === undefined) return undefined;
    if (!input) return null;
    if (!input.startsWith("http") && !input.startsWith("/")) {
        return input;
    }

    const localUserId = await ensureUserExists(userId);
    const media = await prisma.media.create({
        data: {
            filename: input.split("/").pop() || "review-avatar",
            url: input,
            mimeType: "image/webp",
            size: 0,
            uploadedById: localUserId,
        },
    });

    return media.id;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const review = await prisma.review.findUnique({
        where: { id },
        include: {
            avatar: {
                select: {
                    id: true,
                    url: true,
                    alt: true,
                },
            },
        },
    });

    if (!review) {
        return errors.notFound("Review");
    }

    return successResponse(review);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
        return errors.notFound("Review");
    }

    const validation = await validateBody(request, adminReviewSchema);
    if (!validation.success) {
        return errors.validationError(validation.errors);
    }

    const { avatarId: avatarInput, ...payload } = validation.data;
    const avatarId = await resolveAvatarId(avatarInput, authResult.userId);

    const review = await prisma.review.update({
        where: { id },
        data: {
            ...payload,
            ...(avatarId !== undefined && { avatarId }),
        },
        include: {
            avatar: {
                select: {
                    id: true,
                    url: true,
                    alt: true,
                },
            },
        },
    });

    revalidateHomepage();

    return successResponse(review);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const existing = await prisma.review.findUnique({ where: { id } });

    if (!existing) {
        return errors.notFound("Review");
    }

    await prisma.review.delete({ where: { id } });
    revalidateHomepage();

    return successResponse({ deleted: true });
}
