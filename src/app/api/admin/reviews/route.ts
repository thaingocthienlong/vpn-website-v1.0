import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ensureUserExists, requireAdmin } from "@/lib/admin-auth";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody } from "@/lib/validators";
import { adminReviewSchema } from "@/lib/admin/schemas";
import { revalidateHomepage } from "@/lib/admin/revalidation";

async function resolveAvatarId(input: string | null | undefined, userId: string) {
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

export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const search = request.nextUrl.searchParams.get("search")?.trim() || "";

    const reviews = await prisma.review.findMany({
        where: search
            ? {
                OR: [
                    { name: { contains: search } },
                    { company: { contains: search } },
                    { content: { contains: search } },
                ],
            }
            : undefined,
        include: {
            avatar: {
                select: {
                    id: true,
                    url: true,
                    alt: true,
                },
            },
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return successResponse(reviews);
}

export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const validation = await validateBody(request, adminReviewSchema);
    if (!validation.success) {
        return errors.validationError(validation.errors);
    }

    const { avatarId: avatarInput, ...payload } = validation.data;
    const avatarId = await resolveAvatarId(avatarInput ?? null, authResult.userId);

    const review = await prisma.review.create({
        data: {
            ...payload,
            avatarId,
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

    return successResponse(review, undefined, 201);
}
