/**
 * migrate-images.mjs
 * 
 * Migrates local /uploads/ images from post_table_data.json to Cloudinary:
 *   1. Extracts all local image paths from JSON fields + inline HTML
 *   2. Converts each to AVIF using sharp
 *   3. Uploads to Cloudinary
 *   4. Replaces paths in JSON → outputs updated JSON
 *
 * Usage:
 *   node scripts/migrate-images.mjs --dry-run     # inventory only
 *   node scripts/migrate-images.mjs               # full migration
 *
 * Required env vars (in .env or .env.local):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
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
const INPUT_JSON = path.resolve(PROJECT_ROOT, "..", "old", "database", "post_table_data.json");
const OUTPUT_JSON = path.resolve(PROJECT_ROOT, "..", "old", "database", "post_table_data_cloudinary.json");
const MAPPING_FILE = path.resolve(__dirname, "image-mapping.json");
const AVIF_TMP = path.resolve(PROJECT_ROOT, "tmp", "avif");
const CLOUDINARY_FOLDER = "vpn/posts";
const AVIF_QUALITY = 80;

const DRY_RUN = process.argv.includes("--dry-run");

// ─── Load env ────────────────────────────────────────────────────────
dotenv.config({ path: path.resolve(PROJECT_ROOT, ".env.local") });
dotenv.config({ path: path.resolve(PROJECT_ROOT, ".env") });

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Decode URL-encoded path segments (e.g. %E1%BB%83 → ể)
 */
function decodePath(p) {
    try {
        return decodeURIComponent(p);
    } catch {
        return p;
    }
}

/**
 * Extract all local /uploads/ paths from a string (HTML or plain)
 */
function extractLocalPaths(text) {
    if (!text) return [];
    const paths = new Set();

    // Match src="/uploads/..." or src=\"/uploads/...\" 
    const regex = /(?:src=\\?"|\bsrc=")?(\/uploads\/[^"\\<>\s]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
        paths.add(match[1]);
    }

    // Also match standalone /uploads/ paths (for fields like anhdaidien)
    if (text.startsWith("/uploads/")) {
        paths.add(text.trim());
    }

    return [...paths];
}

/**
 * Strip query string from a path (e.g. "image.png?w=1024" → "image.png")
 */
function stripQueryString(p) {
    const idx = p.indexOf("?");
    return idx >= 0 ? p.substring(0, idx) : p;
}

/**
 * Resolve a /uploads/... path to an absolute file path on disk
 */
function resolveToFile(uploadPath) {
    const decoded = stripQueryString(decodePath(uploadPath));
    // Remove leading /uploads/ 
    const relative = decoded.replace(/^\/uploads\//, "");
    return path.resolve(UPLOADS_DIR, relative);
}

/**
 * Generate a clean public_id for Cloudinary
 */
function toPublicId(uploadPath) {
    const decoded = decodePath(uploadPath);
    const relative = decoded.replace(/^\/uploads\//, "");
    const parsed = path.parse(relative);
    // Flatten directory separators and sanitize
    const flat = path.join(parsed.dir, parsed.name)
        .replace(/\\/g, "/")
        .replace(/[()]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_/\-\.]/g, "_");
    return `${CLOUDINARY_FOLDER}/${flat}`;
}

/**
 * Check if a file exists on disk
 */
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  Post Images → Cloudinary Migration");
    console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN (inventory only)" : "🚀 FULL MIGRATION"}`);
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Read JSON
    console.log("📖 Reading post_table_data.json...");
    const rawJson = await fs.readFile(INPUT_JSON, "utf-8");
    const posts = JSON.parse(rawJson);
    console.log(`   Found ${posts.length} posts\n`);

    // 2. Extract all local image paths
    console.log("🔍 Extracting local image paths...");
    const imageFields = ["anhdaidien", "anhdaidienheading", "anhdaidienheadingmb"];
    const htmlFields = ["mieutangan", "mieutachitiet"];

    /** @type {Set<string>} */
    const allLocalPaths = new Set();

    for (const post of posts) {
        // Direct fields
        for (const field of imageFields) {
            const val = post[field];
            if (val && val.startsWith("/uploads/")) {
                allLocalPaths.add(val);
            }
        }
        // Inline HTML
        for (const field of htmlFields) {
            const val = post[field];
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
            console.log(`     - ${m.uploadPath}`);
            console.log(`       → ${m.absPath}`);
        }
    }
    console.log();

    // DRY RUN stops here
    if (DRY_RUN) {
        console.log("🔍 DRY RUN complete. No changes made.");
        console.log("\nInventory summary:");
        console.log(`  Total unique local images: ${allLocalPaths.size}`);
        console.log(`  Found on disk: ${found.length}`);
        console.log(`  Missing: ${missing.length}`);
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

            console.log(`${progress} Converting: ${path.basename(absPath)} → AVIF`);
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
            console.error(`${progress} ❌ FAILED: ${uploadPath} — ${err.message}`);
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
    const updatedPosts = posts.map((post) => {
        const updated = { ...post };

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
                // Replace both escaped and unescaped variants
                const escapedOld = oldPath.replace(/\//g, "\\/");
                if (html.includes(oldPath)) {
                    html = html.split(oldPath).join(newUrl);
                    replacements++;
                }
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
    await fs.writeFile(OUTPUT_JSON, JSON.stringify(updatedPosts, null, 2));
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
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
