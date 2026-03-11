
import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { successResponse, errors } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ensureUserExists } from "@/lib/admin-auth";

/**
 * Configure Cloudinary
 */
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload stream helper
 */
const uploadToCloudinary = (buffer: Buffer, folder: string, filename: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `sisrd/${folder}`,
                public_id: filename,
                resource_type: "auto",
                format: "webp",
                transformation: [{ quality: "auto" }],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * POST /api/admin/upload
 * Upload file to Cloudinary and track in Media table
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const folder = (formData.get("folder") as string) || "uploads";

        if (!file) {
            return errors.badRequest("File is required");
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return errors.badRequest("File quá lớn. Tối đa 10MB.");
        }

        // Generate unique filename
        const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
        const uniqueName = `${baseName}_${Date.now()}`;

        // Read buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadToCloudinary(buffer, folder, uniqueName);

        // Track in database (best-effort, don't fail the upload if DB write fails)
        try {
            const { userId: clerkUserId } = await auth();
            if (clerkUserId) {
                await ensureUserExists(clerkUserId);
                await prisma.media.create({
                    data: {
                        publicId: result.public_id,
                        filename: file.name,
                        format: result.format || null,
                        resourceType: result.resource_type || null,
                        url: result.secure_url,
                        secureUrl: result.secure_url,
                        mimeType: file.type || null,
                        size: result.bytes || file.size,
                        width: result.width || null,
                        height: result.height || null,
                        uploadedById: clerkUserId,
                    },
                });
            }
        } catch (dbError) {
            console.error("Media DB tracking failed (upload still succeeded):", dbError);
        }

        return successResponse(
            {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                size: result.bytes,
            },
            undefined,
            201
        );
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return errors.serverError("Không thể upload file lên Cloudinary");
    }
}
