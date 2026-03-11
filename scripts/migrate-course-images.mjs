/**
 * migrate-course-images.mjs
 * 
 * Migrates local /uploads/ images from hosomoitruong_table_data.json to Cloudinary:
 *   1. Extracts all local image paths from JSON (anhdaidien + inline HTML in c1-c10)
 *   2. Converts each to AVIF using sharp
 *   3. Uploads to Cloudinary
 *   4. Replaces paths in JSON → outputs updated JSON
 *   5. (--update-db) Updates Media.url + ContentSection.content in database
 *
 * Usage:
 *   node scripts/migrate-course-images.mjs --dry-run          # inventory only
 *   node scripts/migrate-course-images.mjs                    # full migration
 *   node scripts/migrate-course-images.mjs --update-db        # update DB with mapping
 *   node scripts/migrate-course-images.mjs --download-missing # download 9 missing images
 *
 * Required env vars (in .env or .env.local):
 *   CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *   DATABASE_URL (for --update-db)
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// ─── Config ──────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const UPLOADS_DIR = path.resolve(PROJECT_ROOT, "uploads");
const INPUT_JSON = path.resolve(PROJECT_ROOT, "..", "old", "database", "hosomoitruong_table_data.json");
const OUTPUT_JSON = path.resolve(PROJECT_ROOT, "..", "old", "database", "hosomoitruong_table_data_cloudinary.json");
const MAPPING_FILE = path.resolve(__dirname, "course-image-mapping.json");
const AVIF_TMP = path.resolve(PROJECT_ROOT, "tmp", "avif-courses");
const CLOUDINARY_FOLDER = "vpn/courses";
const AVIF_QUALITY = 80;

const DRY_RUN = process.argv.includes("--dry-run");
const UPDATE_DB = process.argv.includes("--update-db");
const DOWNLOAD_MISSING = process.argv.includes("--download-missing");

// ─── Load env ────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(PROJECT_ROOT, ".env.local") });
dotenv.config({ path: path.resolve(PROJECT_ROOT, ".env") });

// ─── Helpers ─────────────────────────────────────────────────────────

function decodePath(p) {
    try {
        return decodeURIComponent(p);
    } catch {
        return p;
    }
}

function extractLocalPaths(text) {
    if (!text) return [];
    const paths = new Set();
    const regex = /(?:src=\\?"|src=")?(\/?uploads\/[^"\\<>\s]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        let p = match[1];
        if (!p.startsWith("/")) p = "/" + p;
        paths.add(p);
    }
    if (text.startsWith("/uploads/")) {
        paths.add(text.trim());
    }
    return [...paths];
}

function stripQueryString(p) {
    const idx = p.indexOf("?");
    return idx >= 0 ? p.substring(0, idx) : p;
}

function resolveToFile(uploadPath) {
    const decoded = stripQueryString(decodePath(uploadPath));
    const relative = decoded.replace(/^\/uploads\//, "");
    return path.resolve(UPLOADS_DIR, relative);
}

function toPublicId(uploadPath) {
    const decoded = decodePath(uploadPath);
    const relative = decoded.replace(/^\/uploads\//, "");
    const parsed = path.parse(relative);
    const flat = path.join(parsed.dir, parsed.name)
        .replace(/\\/g, "/")
        .replace(/[()]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_/\-\.]/g, "_");
    return `${CLOUDINARY_FOLDER}/${flat}`;
}

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// ─── Download Missing Images ─────────────────────────────────────────

async function downloadMissing(missingList) {
    console.log("\n📥 Downloading missing images from old site...\n");

    const OLD_SITE = "https://vienphuongnam.com.vn";
    let downloaded = 0, failed = 0;

    for (const { uploadPath } of missingList) {
        const decoded = decodePath(uploadPath);
        const relative = decoded.replace(/^\/uploads\//, "");
        const targetPath = path.resolve(UPLOADS_DIR, relative);

        // Ensure directory exists
        await fs.mkdir(path.dirname(targetPath), { recursive: true });

        const url = `${OLD_SITE}${uploadPath}`;
        try {
            console.log(`  Downloading: ${url}`);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            await fs.writeFile(targetPath, buffer);
            console.log(`  ✅ Saved: ${targetPath}`);
            downloaded++;
        } catch (err) {
            console.error(`  ❌ Failed: ${url} — ${err.message}`);
            failed++;
        }
    }

    console.log(`\n📥 Download complete: ${downloaded} downloaded, ${failed} failed\n`);
    return downloaded;
}

// ─── Update Database ─────────────────────────────────────────────────

async function updateDatabase(mapping) {
    console.log("\n📂 Updating database with Cloudinary URLs...\n");

    // Dynamic import of prisma client
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");

    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    let mediaUpdated = 0;
    let sectionUpdated = 0;

    try {
        // 1. Update Media records (featured images) via Course relation
        console.log("  Updating Media records (via Course.featuredImage)...");
        const courses = await prisma.course.findMany({
            where: { featuredImageId: { not: null } },
            include: { featuredImage: true },
        });

        for (const course of courses) {
            if (course.featuredImage && course.featuredImage.url && mapping[course.featuredImage.url]) {
                await prisma.media.update({
                    where: { id: course.featuredImage.id },
                    data: { url: mapping[course.featuredImage.url] },
                });
                mediaUpdated++;
                console.log(`    ✅ Media ${course.featuredImage.id}: ...${course.featuredImage.url.slice(-40)} → Cloudinary`);
            }
        }

        // 2. Update ContentSection HTML content (inline images)
        console.log("\n  Updating ContentSection records...");
        const allSections = await prisma.contentSection.findMany({
            where: { entityType: "COURSE" },
        });

        for (const section of allSections) {
            let html = section.content;
            let changed = false;

            for (const [oldPath, newUrl] of Object.entries(mapping)) {
                if (html.includes(oldPath)) {
                    html = html.split(oldPath).join(newUrl);
                    changed = true;
                }
                // Also handle encoded version
                const encoded = encodeURIComponent(oldPath).replace(/%2F/g, "/");
                if (html.includes(encoded)) {
                    html = html.split(encoded).join(newUrl);
                    changed = true;
                }
            }

            if (changed) {
                await prisma.contentSection.update({
                    where: { id: section.id },
                    data: { content: html },
                });
                sectionUpdated++;
                console.log(`    ✅ Section ${section.sectionKey} (${section.entityId})`);
            }
        }

        console.log(`\n  📊 Updated: ${mediaUpdated} Media, ${sectionUpdated} ContentSections`);
    } finally {
        await prisma.$disconnect();
    }
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  Course Images → Cloudinary Migration");
    console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN" : UPDATE_DB ? "📂 UPDATE DB" : DOWNLOAD_MISSING ? "📥 DOWNLOAD MISSING" : "🚀 FULL MIGRATION"}`);
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Read JSON
    console.log("📖 Reading hosomoitruong_table_data.json...");
    const rawJson = await fs.readFile(INPUT_JSON, "utf-8");
    const courses = JSON.parse(rawJson);
    console.log(`   Found ${courses.length} courses\n`);

    // 2. Extract all local image paths
    console.log("🔍 Extracting local image paths...");
    const imageFields = ["anhdaidien"];
    const htmlFields = ["mieutangan", "mieutachitiet", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"];

    /** @type {Set<string>} */
    const allLocalPaths = new Set();

    for (const course of courses) {
        // Direct image fields
        for (const field of imageFields) {
            const val = course[field];
            if (val && val.startsWith("/uploads/")) {
                allLocalPaths.add(val);
            }
        }
        // Inline HTML images
        for (const field of htmlFields) {
            const val = course[field];
            if (val) {
                for (const p of extractLocalPaths(val)) {
                    allLocalPaths.add(p);
                }
            }
        }
    }

    console.log(`   Found ${allLocalPaths.size} unique local image paths\n`);

    // 3. Verify files on disk
    console.log("📁 Verifying files exist on disk...");
    const found = [];
    const missing = [];

    for (const uploadPath of allLocalPaths) {
        const absPath = resolveToFile(uploadPath);
        if (await fileExists(absPath)) {
            found.push({ uploadPath, absPath });
        } else {
            missing.push({ uploadPath, absPath });
        }
    }

    console.log(`   ✅ Found: ${found.length}`);
    console.log(`   ❌ Missing: ${missing.length}`);
    if (missing.length > 0) {
        console.log("   Missing files:");
        for (const m of missing) {
            console.log(`     - ${decodePath(m.uploadPath)}`);
        }
    }
    console.log();

    // Handle --download-missing mode
    if (DOWNLOAD_MISSING && missing.length > 0) {
        const downloaded = await downloadMissing(missing);
        if (downloaded > 0) {
            console.log("🔄 Re-verifying after download...");
            // Re-check which are now found
            for (const m of [...missing]) {
                if (await fileExists(m.absPath)) {
                    found.push(m);
                    missing.splice(missing.indexOf(m), 1);
                }
            }
            console.log(`   ✅ Found: ${found.length}`);
            console.log(`   ❌ Still missing: ${missing.length}\n`);
        }
        if (!DRY_RUN && !UPDATE_DB) {
            console.log("Done downloading. Run without --download-missing to proceed with migration.");
            return;
        }
    }

    // Handle --update-db mode
    if (UPDATE_DB) {
        if (!(await fileExists(MAPPING_FILE))) {
            console.error("❌ No mapping file found. Run full migration first.");
            process.exit(1);
        }
        const mapping = JSON.parse(await fs.readFile(MAPPING_FILE, "utf-8"));
        console.log(`📂 Loaded mapping with ${Object.keys(mapping).length} entries\n`);
        await updateDatabase(mapping);
        console.log("\n✅ Database update complete!");
        return;
    }

    // DRY RUN stops here
    if (DRY_RUN) {
        console.log("🔍 DRY RUN complete. No changes made.");
        console.log("\nInventory summary:");
        console.log(`  Total unique local images: ${allLocalPaths.size}`);
        console.log(`  Found on disk: ${found.length}`);
        console.log(`  Missing: ${missing.length}`);
        if (missing.length > 0) {
            console.log(`\n💡 Tip: Run with --download-missing to try downloading missing images.`);
        }
        console.log(`\nTo run the full migration, run without --dry-run`);
        return;
    }

    // 4. Validate Cloudinary credentials
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        console.error("❌ Missing Cloudinary credentials. Set these in .env or .env.local:");
        console.error("   CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)");
        console.error("   CLOUDINARY_API_KEY");
        console.error("   CLOUDINARY_API_SECRET");
        process.exit(1);
    }

    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });
    console.log(`☁️  Cloudinary configured: ${CLOUDINARY_CLOUD_NAME}\n`);

    // 5. Convert to AVIF + Upload
    await fs.mkdir(AVIF_TMP, { recursive: true });

    /** @type {Record<string, string>} old path → cloudinary URL */
    const mapping = {};
    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < found.length; i++) {
        const { uploadPath, absPath } = found[i];
        const progress = `[${i + 1}/${found.length}]`;

        try {
            // Convert to AVIF
            const publicId = toPublicId(uploadPath);
            const avifFileName = publicId.replace(/\//g, "__") + ".avif";
            const avifPath = path.join(AVIF_TMP, avifFileName);

            console.log(`${progress} Converting: ${path.basename(decodePath(absPath))} → AVIF`);
            await sharp(absPath)
                .avif({ quality: AVIF_QUALITY })
                .toFile(avifPath);

            // Upload to Cloudinary
            console.log(`${progress} Uploading: ${publicId}`);
            const result = await cloudinary.uploader.upload(avifPath, {
                public_id: publicId,
                resource_type: "image",
                overwrite: true,
                format: "avif",
            });

            mapping[uploadPath] = result.secure_url;
            uploaded++;

            // Clean up temp file
            await fs.unlink(avifPath).catch(() => { });
        } catch (err) {
            console.error(`${progress} ❌ FAILED: ${decodePath(uploadPath)} — ${err.message}`);
            failed++;
        }
    }

    console.log(`\n☁️  Upload complete: ${uploaded} uploaded, ${failed} failed\n`);

    // 6. Save mapping
    await fs.writeFile(MAPPING_FILE, JSON.stringify(mapping, null, 2));
    console.log(`💾 Mapping saved: ${MAPPING_FILE}\n`);

    // 7. Update JSON
    console.log("📝 Updating JSON with Cloudinary URLs...");
    let replacements = 0;
    const updatedCourses = courses.map((course) => {
        const updated = { ...course };

        // Replace direct image fields
        for (const field of imageFields) {
            if (updated[field] && mapping[updated[field]]) {
                updated[field] = mapping[updated[field]];
                replacements++;
            }
        }

        // Replace inline HTML src attributes
        for (const field of htmlFields) {
            if (!updated[field]) continue;
            let html = updated[field];
            for (const [oldPath, newUrl] of Object.entries(mapping)) {
                // Replace both exact and URL-encoded variants
                if (html.includes(oldPath)) {
                    html = html.split(oldPath).join(newUrl);
                    replacements++;
                }
                const escapedOld = oldPath.replace(/\//g, "\\/");
                if (html.includes(escapedOld)) {
                    html = html.split(escapedOld).join(newUrl.replace(/\//g, "\\/"));
                    replacements++;
                }
            }
            updated[field] = html;
        }

        return updated;
    });

    // 8. Write output JSON
    await fs.writeFile(OUTPUT_JSON, JSON.stringify(updatedCourses, null, 2));
    console.log(`   Total replacements: ${replacements}`);
    console.log(`\n✅ Updated JSON saved: ${OUTPUT_JSON}`);

    // Summary
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("  Migration Complete!");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`  Images found:     ${found.length}`);
    console.log(`  Images uploaded:  ${uploaded}`);
    console.log(`  Images failed:    ${failed}`);
    console.log(`  Replacements:     ${replacements}`);
    console.log(`  Output:           ${OUTPUT_JSON}`);
    console.log(`  Mapping:          ${MAPPING_FILE}`);
    console.log("═══════════════════════════════════════════════════════");
    console.log(`\n💡 Next: Run with --update-db to update the database.`);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
