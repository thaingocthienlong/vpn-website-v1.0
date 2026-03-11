import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/admin/media
 * List all media with pagination and search
 */
export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const search = searchParams.get("search") || "";

    try {
        const where: Record<string, unknown> = {};
        if (search) {
            where.OR = [
                { filename: { contains: search } },
                { publicId: { contains: search } },
                { alt: { contains: search } },
            ];
        }

        const [media, total] = await Promise.all([
            prisma.media.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    uploadedBy: { select: { name: true } },
                },
            }),
            prisma.media.count({ where }),
        ]);

        return jsonSuccess({
            items: media,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching media:", error);
        return jsonError("Failed to fetch media", 500);
    }
}

/**
 * DELETE /api/admin/media
 * Delete multiple media items (from DB and Cloudinary)
 * Body: { ids: string[] }
 */
export async function DELETE(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const { ids } = await request.json();
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return jsonError("No media IDs provided", 400);
        }

        // Fetch media records to get publicIds
        const mediaItems = await prisma.media.findMany({
            where: { id: { in: ids } },
        });

        // Delete from Cloudinary (best-effort)
        const cloudinaryDeletes = mediaItems
            .filter(m => m.publicId)
            .map(m => {
                return cloudinary.uploader.destroy(m.publicId!, { invalidate: true })
                    .catch(err => console.error(`Cloudinary delete failed for ${m.publicId}:`, err));
            });

        await Promise.allSettled(cloudinaryDeletes);

        // Delete from DB
        await prisma.media.deleteMany({
            where: { id: { in: ids } },
        });

        return jsonSuccess({ deleted: ids.length });
    } catch (error) {
        console.error("Error deleting media:", error);
        return jsonError("Failed to delete media", 500);
    }
}
