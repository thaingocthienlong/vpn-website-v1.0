import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";
import { requireAdmin, ensureUserExists, jsonSuccess, jsonError } from "@/lib/admin-auth";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/admin/media/sync
 * Fetch existing resources from Cloudinary and populate Media table
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const userId = authResult.userId;
        await ensureUserExists(userId);

        let nextCursor: string | undefined;
        let synced = 0;
        let skipped = 0;

        // Fetch all resources from Cloudinary folder "sisrd"
        do {
            const result: any = await cloudinary.api.resources({
                type: "upload",
                prefix: "sisrd/",
                max_results: 100,
                next_cursor: nextCursor,
            });

            for (const resource of result.resources) {
                // Check if already tracked
                const existing = await prisma.media.findFirst({
                    where: {
                        OR: [
                            { publicId: resource.public_id },
                            { url: resource.secure_url },
                        ],
                    },
                });

                if (existing) {
                    // Update publicId if missing
                    if (!existing.publicId) {
                        await prisma.media.update({
                            where: { id: existing.id },
                            data: { publicId: resource.public_id },
                        });
                        synced++;
                    } else {
                        skipped++;
                    }
                    continue;
                }

                // Create new record
                await prisma.media.create({
                    data: {
                        publicId: resource.public_id,
                        filename: resource.public_id.split("/").pop() || resource.public_id,
                        format: resource.format || null,
                        resourceType: resource.resource_type || null,
                        url: resource.secure_url,
                        secureUrl: resource.secure_url,
                        size: resource.bytes || 0,
                        width: resource.width || null,
                        height: resource.height || null,
                        uploadedById: userId,
                    },
                });
                synced++;
            }

            nextCursor = result.next_cursor;
        } while (nextCursor);

        return jsonSuccess({
            message: `Sync complete. ${synced} items synced, ${skipped} already tracked.`,
            synced,
            skipped,
        });
    } catch (error) {
        console.error("Error syncing media:", error);
        return jsonError("Failed to sync media from Cloudinary", 500);
    }
}
