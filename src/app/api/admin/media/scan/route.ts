import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * POST /api/admin/media/scan
 * Scan all content to find unused media.
 * Uses two strategies:
 * 1. Check FK references (featuredImageId, avatarId, logoId)
 * 2. Check HTML content for embedded Cloudinary URLs
 */
export async function POST(_request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        // 1. Get all media from the database
        const allMedia = await prisma.media.findMany({
            select: { id: true, url: true, secureUrl: true, publicId: true, filename: true },
        });

        if (allMedia.length === 0) {
            return jsonSuccess({ unused: [], total: 0, usedCount: 0, unusedCount: 0 });
        }

        // 2. Collect all "used" Media IDs via FK references
        const usedMediaIds = new Set<string>();

        // Posts with featuredImageId or featuredImageId_en
        const postsWithImage = await prisma.post.findMany({
            where: { OR: [{ featuredImageId: { not: null } }, { featuredImageId_en: { not: null } }] },
            select: { featuredImageId: true, featuredImageId_en: true },
        });
        postsWithImage.forEach(p => {
            if (p.featuredImageId) usedMediaIds.add(p.featuredImageId);
            if (p.featuredImageId_en) usedMediaIds.add(p.featuredImageId_en);
        });

        // Pages with featuredImageId or featuredImageId_en
        const pagesWithImage = await prisma.page.findMany({
            where: { OR: [{ featuredImageId: { not: null } }, { featuredImageId_en: { not: null } }] },
            select: { featuredImageId: true, featuredImageId_en: true },
        });
        pagesWithImage.forEach(p => {
            if (p.featuredImageId) usedMediaIds.add(p.featuredImageId);
            if (p.featuredImageId_en) usedMediaIds.add(p.featuredImageId_en);
        });

        // Courses with featuredImageId or featuredImageId_en
        const coursesWithImage = await prisma.course.findMany({
            where: { OR: [{ featuredImageId: { not: null } }, { featuredImageId_en: { not: null } }] },
            select: { featuredImageId: true, featuredImageId_en: true },
        });
        coursesWithImage.forEach(c => {
            if (c.featuredImageId) usedMediaIds.add(c.featuredImageId);
            if (c.featuredImageId_en) usedMediaIds.add(c.featuredImageId_en);
        });

        // Staff with avatarId or avatarId_en
        const staffWithAvatar = await prisma.staff.findMany({
            where: { OR: [{ avatarId: { not: null } }, { avatarId_en: { not: null } }] },
            select: { avatarId: true, avatarId_en: true },
        });
        staffWithAvatar.forEach(s => {
            if (s.avatarId) usedMediaIds.add(s.avatarId);
            if (s.avatarId_en) usedMediaIds.add(s.avatarId_en);
        });

        // Partners with logoId or logoId_en
        const partnersWithLogo = await prisma.partner.findMany({
            where: { OR: [{ logoId: { not: null } }, { logoId_en: { not: null } }] },
            select: { logoId: true, logoId_en: true },
        });
        partnersWithLogo.forEach(p => {
            if (p.logoId) usedMediaIds.add(p.logoId);
            if (p.logoId_en) usedMediaIds.add(p.logoId_en);
        });

        // 3. Collect all Cloudinary URLs used in HTML content
        const usedUrls = new Set<string>();

        // Post content
        const posts = await prisma.post.findMany({
            select: { content: true, content_en: true },
        });
        posts.forEach(p => {
            extractCloudinaryUrls(p.content || "", usedUrls);
            extractCloudinaryUrls(p.content_en || "", usedUrls);
        });

        // Page content
        const pages = await prisma.page.findMany({
            select: { content: true, content_en: true },
        });
        pages.forEach(p => {
            extractCloudinaryUrls(p.content || "", usedUrls);
            extractCloudinaryUrls(p.content_en || "", usedUrls);
        });

        // ContentSection content (used by Courses, Services, etc.)
        const sections = await prisma.contentSection.findMany({
            select: { content: true, content_en: true },
        });
        sections.forEach(s => {
            extractCloudinaryUrls(s.content || "", usedUrls);
            extractCloudinaryUrls(s.content_en || "", usedUrls);
        });

        // Configuration values (logo, etc.)
        const configs = await prisma.configuration.findMany({
            select: { value: true },
        });
        configs.forEach(c => {
            if (c.value && c.value.includes("cloudinary")) {
                usedUrls.add(c.value);
            }
        });

        // 4. Determine unused media
        const unused = allMedia.filter(media => {
            // Used via FK?
            if (usedMediaIds.has(media.id)) return false;

            // Used via URL in HTML content?
            if (usedUrls.has(media.url)) return false;
            if (media.secureUrl && usedUrls.has(media.secureUrl)) return false;

            // Check if publicId appears in any used URL (URL variants)
            if (media.publicId) {
                for (const u of usedUrls) {
                    if (u.includes(media.publicId)) return false;
                }
            }

            return true;
        });

        return jsonSuccess({
            total: allMedia.length,
            usedCount: allMedia.length - unused.length,
            unusedCount: unused.length,
            unused: unused.map(m => ({
                id: m.id,
                url: m.url,
                filename: m.filename,
                publicId: m.publicId,
            })),
        });
    } catch (error) {
        console.error("Error scanning media:", error);
        return jsonError("Failed to scan media", 500);
    }
}

/**
 * Extract Cloudinary URLs from HTML content
 */
function extractCloudinaryUrls(html: string, urls: Set<string>) {
    if (!html) return;
    // Match src="..." attributes pointing to Cloudinary
    const srcRegex = /src=["']([^"']+cloudinary[^"']+)["']/gi;
    let match;
    while ((match = srcRegex.exec(html)) !== null) {
        urls.add(match[1]);
    }
    // Match url("...") in inline styles
    const urlRegex = /url\(["']?([^"')]+cloudinary[^"')]+)["']?\)/gi;
    while ((match = urlRegex.exec(html)) !== null) {
        urls.add(match[1]);
    }
}
