/**
 * Migrate old posts from post_table_data.json into the new Prisma database.
 * 
 * - All 110 posts → "Tin tức" category
 * - Deletes existing sample posts first
 * - Creates Media records for old image URLs
 * - Safe to re-run (checks slug conflicts)
 * 
 * Run: npx tsx scripts/seed-old-posts.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as fs from "fs";
import * as path from "path";

// Initialize Prisma with LibSQL adapter
const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

// Path to the exported JSON
const JSON_FILE = path.resolve(__dirname, "../../old/database/post_table_data_cloudinary.json");

// HTML tag stripper (no external deps)
function stripHtml(html: string): string {
    if (!html) return "";
    return html
        .replace(/<[^>]*>/g, "")       // Remove HTML tags
        .replace(/&nbsp;/g, " ")        // Replace &nbsp;
        .replace(/&amp;/g, "&")         // Replace &amp;
        .replace(/&lt;/g, "<")          // Replace &lt;
        .replace(/&gt;/g, ">")          // Replace &gt;
        .replace(/&quot;/g, '"')        // Replace &quot;
        .replace(/&#39;/g, "'")         // Replace &#39;
        .replace(/\\r\\n|\\r|\\n/g, " ") // Replace escaped newlines
        .replace(/\r\n|\r|\n/g, " ")    // Replace actual newlines
        .replace(/\s+/g, " ")           // Collapse whitespace
        .trim();
}

// Clean up CKEditor HTML content
function cleanContent(html: string): string {
    if (!html) return "";
    // Unescape escaped sequences from SQL export
    return html
        .replace(/\\r\\n/g, "\r\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\");
}

interface OldPost {
    id: number;
    id_chuyenmuc: number;
    tieude: string;
    tieudeseo: string;
    duongdan: string;
    mieutangan: string;
    mieutachitiet: string;
    mieutaseo: string;
    tukhoa: string;
    anhdaidien: string;
    anhdaidienheading: string;
    anhdaidienheadingmb: string;
    hiddenanhdaidienheading: number;
    noibat: number;
    ngayvietbai: string;
    ngaysuadoi: string;
    head: string;
    tags: number;
    luotxem: number;
    luunhap: number;
    kiemduyenoidung: number;
    thamvanchuyenmon: string;
    offbinhluan: number;
    offtacgia: number;
}

async function main() {
    console.log("=== Old Posts Migration ===\n");

    // 1. Read JSON file
    console.log(`Reading: ${JSON_FILE}`);
    if (!fs.existsSync(JSON_FILE)) {
        throw new Error(`File not found: ${JSON_FILE}`);
    }
    const rawData = fs.readFileSync(JSON_FILE, "utf-8");
    const oldPosts: OldPost[] = JSON.parse(rawData);
    console.log(`Found ${oldPosts.length} posts in JSON.\n`);

    // 2. Get or create admin user
    let adminUser = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
    });
    if (!adminUser) {
        adminUser = await prisma.user.create({
            data: {
                email: "admin@sisrd.org.vn",
                password: "hashed_password_placeholder",
                name: "Admin",
                role: "SUPER_ADMIN",
            },
        });
        console.log("Created admin user.");
    }
    console.log(`Admin user: ${adminUser.email} (${adminUser.id})`);

    // 3. Delete existing sample posts (from seed-news-v2.ts)
    console.log("\nCleaning up existing sample posts...");
    const postCategories = await prisma.category.findMany({
        where: { type: "POST" },
        select: { id: true, name: true },
    });

    if (postCategories.length > 0) {
        const categoryIds = postCategories.map((c) => c.id);

        // Delete PostTag relations first
        const existingPosts = await prisma.post.findMany({
            where: { categoryId: { in: categoryIds } },
            select: { id: true },
        });
        if (existingPosts.length > 0) {
            const postIds = existingPosts.map((p) => p.id);
            await prisma.postTag.deleteMany({
                where: { postId: { in: postIds } },
            });
        }

        const deletedPosts = await prisma.post.deleteMany({
            where: { categoryId: { in: categoryIds } },
        });
        console.log(`  Deleted ${deletedPosts.count} existing posts.`);

        // Delete old POST categories
        await prisma.category.deleteMany({
            where: { type: "POST" },
        });
        console.log(`  Deleted ${postCategories.length} old categories.`);
    }

    // 4. Create the "Tin tuc" category
    console.log("\nCreating 'Tin tuc' category...");
    const tinTucCategory = await prisma.category.create({
        data: {
            name: "Tin tức",
            name_en: "News",
            slug: "tin-tuc",
            type: "POST",
            sortOrder: 0,
            isActive: true,
        },
    });
    console.log(`  Created category: ${tinTucCategory.name} (${tinTucCategory.id})`);

    // 5. Import posts
    console.log(`\nImporting ${oldPosts.length} posts...\n`);

    let imported = 0;
    let skipped = 0;
    let mediaCreated = 0;
    const slugSet = new Set<string>();

    for (const oldPost of oldPosts) {
        try {
            // Prepare slug (handle conflicts)
            let slug = oldPost.duongdan || `post-${oldPost.id}`;
            if (slugSet.has(slug)) {
                slug = `${slug}-${oldPost.id}`;
            }

            // Check if slug already exists in DB
            const existing = await prisma.post.findUnique({ where: { slug } });
            if (existing) {
                slug = `${slug}-old-${oldPost.id}`;
            }
            slugSet.add(slug);

            // Parse dates
            const publishedAt = oldPost.ngayvietbai
                ? new Date(oldPost.ngayvietbai)
                : new Date();

            // Handle featured image
            let featuredImageId: string | null = null;
            if (oldPost.anhdaidien && oldPost.anhdaidien.trim() !== "") {
                const imageUrl = oldPost.anhdaidien;
                const filename = decodeURIComponent(
                    imageUrl.split("/").pop() || "image.png"
                );

                // Detect mimeType based on URL extension
                const ext = imageUrl.split(".").pop()?.toLowerCase() || "";
                const mimeType = ext === "avif" ? "image/avif"
                    : ext === "webp" ? "image/webp"
                        : ext === "jpg" || ext === "jpeg" ? "image/jpeg"
                            : ext === "png" ? "image/png"
                                : "image/png";

                const media = await prisma.media.create({
                    data: {
                        filename,
                        url: imageUrl,
                        mimeType,
                        size: 0,
                        uploadedById: adminUser.id,
                    },
                });
                featuredImageId = media.id;
                mediaCreated++;
            }

            // Strip HTML from excerpt
            const excerpt = stripHtml(oldPost.mieutangan);

            // Clean content HTML
            const content = cleanContent(oldPost.mieutachitiet);

            // Determine publish status
            const isPublished = oldPost.luunhap === 0;
            const isFeatured = oldPost.noibat === 1;

            // Create the post
            await prisma.post.create({
                data: {
                    title: oldPost.tieude,
                    slug,
                    excerpt: excerpt || null,
                    content: content || "",
                    categoryId: tinTucCategory.id,
                    authorId: adminUser.id,
                    type: "ORIGINAL",
                    isFeatured,
                    isPublished,
                    publishedAt: isPublished ? publishedAt : null,
                    viewCount: oldPost.luotxem || 0,
                    metaTitle: oldPost.tieudeseo || null,
                    metaDescription: oldPost.mieutaseo || null,
                    featuredImageId,
                },
            });

            imported++;
            const titlePreview =
                oldPost.tieude.length > 60
                    ? oldPost.tieude.substring(0, 60) + "..."
                    : oldPost.tieude;
            console.log(`  [${imported}] ID ${oldPost.id}: ${titlePreview}`);
        } catch (err) {
            skipped++;
            console.error(
                `  [SKIP] ID ${oldPost.id}: ${(err as Error).message}`
            );
        }
    }

    // 6. Summary
    console.log("\n=== Migration Complete ===");
    console.log(`  Imported: ${imported}`);
    console.log(`  Skipped:  ${skipped}`);
    console.log(`  Media:    ${mediaCreated} records created`);
    console.log(`  Category: ${tinTucCategory.name} (${tinTucCategory.id})`);

    // Verify count
    const totalPosts = await prisma.post.count();
    console.log(`  Total posts in DB: ${totalPosts}`);
}

main()
    .catch((e) => {
        console.error("ERROR:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
