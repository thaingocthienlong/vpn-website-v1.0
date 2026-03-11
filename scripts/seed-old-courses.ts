/**
 * Migrate old training programs (hosomoitruong) into the new Prisma database.
 * 
 * - 18 courses from hosomoitruong_table_data.json
 * - Creates "Đào tạo" category (type COURSE)
 * - Maps t1-t10 / c1-c10 → ContentSection records
 * - Creates Media records for featured images
 * - Deletes existing courses first (safe to re-run)
 * 
 * Run: npx tsx scripts/seed-old-courses.ts
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
const JSON_FILE = path.resolve(__dirname, "../../old/database/hosomoitruong_table_data.json");

// ─── Utility Functions ──────────────────────────────────────────

/** Strip HTML tags to get plain text */
function stripHtml(html: string): string {
    if (!html) return "";
    return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\\r\\n|\\r|\\n/g, " ")
        .replace(/\r\n|\r|\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Clean CKEditor HTML: remove junk divs (eJOY extension), normalize whitespace */
function cleanHtml(html: string): string {
    if (!html) return "";
    return html
        // Remove eJOY extension root divs
        .replace(/<div class="eJOY__extension_root_class"[^>]*>[\s\S]*?<\/div>/gi, "")
        // Normalize escaped sequences
        .replace(/\\r\\n/g, "\r\n")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\")
        .trim();
}

/** Convert Vietnamese title to URL-safe slug */
function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")   // Remove special chars
        .replace(/\s+/g, "-")            // Spaces → hyphens
        .replace(/-+/g, "-")             // Collapse hyphens
        .replace(/^-|-$/g, "")           // Trim hyphens
        .substring(0, 80);               // Max length
}

/** Determine course type from title */
function detectCourseType(title: string): string {
    const upper = title.toUpperCase();
    if (upper.includes("THẠC SĨ") || upper.includes("TUYỂN SINH") || upper.includes("ĐẠI HỌC TỪ XA")) {
        return "ADMISSION";
    }
    return "SHORT_COURSE";
}

/** Check if a section content is effectively empty */
function isEmptyContent(text: string | null): boolean {
    if (!text) return true;
    const stripped = stripHtml(text);
    return stripped.length === 0;
}

// ─── Data Interface ─────────────────────────────────────────────

interface OldCourse {
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
    hiddenanhdaidienheading: string;
    noibat: number;
    head: string;
    tags: number;
    created_time: string;
    modified_time: string;
    luotxem: number;
    offbinhluan: number;
    t1: string; t2: string; t3: string; t4: string; t5: string;
    t6: string; t7: string; t8: string; t9: string; t10: string;
    c1: string; c2: string; c3: string; c4: string; c5: string;
    c6: string; c7: string; c8: string; c9: string; c10: string;
    stt_hienthi: number;
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
    console.log("=== Old Courses (Đào tạo) Migration ===\n");

    // 1. Read JSON file
    console.log(`Reading: ${JSON_FILE}`);
    if (!fs.existsSync(JSON_FILE)) {
        throw new Error(`File not found: ${JSON_FILE}`);
    }
    const rawData = fs.readFileSync(JSON_FILE, "utf-8");
    const oldCourses: OldCourse[] = JSON.parse(rawData);
    console.log(`Found ${oldCourses.length} courses in JSON.\n`);

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

    // 3. Clean up existing courses & related data
    console.log("\nCleaning up existing courses...");

    // Delete ContentSections for COURSE entities
    const deletedSections = await prisma.contentSection.deleteMany({
        where: { entityType: "COURSE" },
    });
    console.log(`  Deleted ${deletedSections.count} content sections.`);

    // Delete CoursePartner relations
    const deletedPartners = await prisma.coursePartner.deleteMany({});
    console.log(`  Deleted ${deletedPartners.count} course-partner relations.`);

    // Delete Registrations
    const deletedRegs = await prisma.registration.deleteMany({});
    console.log(`  Deleted ${deletedRegs.count} registrations.`);

    // Delete existing courses
    const deletedCourses = await prisma.course.deleteMany({});
    console.log(`  Deleted ${deletedCourses.count} existing courses.`);

    // Delete old COURSE categories
    const deletedCats = await prisma.category.deleteMany({
        where: { type: "COURSE" },
    });
    console.log(`  Deleted ${deletedCats.count} old COURSE categories.`);

    // 4. Create "Đào tạo" category
    console.log("\nCreating 'Đào tạo' category...");
    const daoTaoCategory = await prisma.category.create({
        data: {
            name: "Đào tạo",
            name_en: "Training",
            slug: "dao-tao",
            type: "COURSE",
            sortOrder: 0,
            isActive: true,
        },
    });
    console.log(`  Created category: ${daoTaoCategory.name} (${daoTaoCategory.id})`);

    // 5. Import courses
    console.log(`\nImporting ${oldCourses.length} courses...\n`);

    let imported = 0;
    let skipped = 0;
    let mediaCreated = 0;
    let sectionsCreated = 0;
    const slugSet = new Set<string>();

    for (const old of oldCourses) {
        try {
            // Prepare slug
            let slug = old.duongdan || `course-${old.id}`;
            if (slugSet.has(slug)) {
                slug = `${slug}-${old.id}`;
            }
            const existing = await prisma.course.findUnique({ where: { slug } });
            if (existing) {
                slug = `${slug}-old-${old.id}`;
            }
            slugSet.add(slug);

            // Parse dates
            const createdAt = old.created_time ? new Date(old.created_time) : new Date();
            const publishedAt = createdAt;

            // Handle featured image
            let featuredImageId: string | null = null;
            if (old.anhdaidien && old.anhdaidien.trim() !== "") {
                const imageUrl = old.anhdaidien;
                const filename = decodeURIComponent(
                    imageUrl.split("/").pop() || "image.png"
                );

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

            // Determine course type
            const courseType = detectCourseType(old.tieude);

            // Extract excerpt (strip HTML from mieutangan, fallback to stripped mieutachitiet)
            const excerptRaw = old.mieutangan
                ? stripHtml(old.mieutangan)
                : stripHtml(old.mieutachitiet);
            const excerpt = excerptRaw.length > 500
                ? excerptRaw.substring(0, 497) + "..."
                : excerptRaw;

            // Create the course
            const course = await prisma.course.create({
                data: {
                    title: old.tieude,
                    slug,
                    excerpt: excerpt || null,
                    type: courseType,
                    categoryId: daoTaoCategory.id,
                    authorId: adminUser.id,
                    isFeatured: old.noibat === 1,
                    isPublished: true,
                    publishedAt,
                    isRegistrationOpen: true,
                    viewCount: old.luotxem || 0,
                    sortOrder: old.stt_hienthi || 0,
                    metaTitle: old.tieudeseo || old.mieutaseo || null,
                    metaDescription: old.mieutaseo || null,
                    featuredImageId,
                    createdAt,
                },
            });

            // Create ContentSections from t1-t10 / c1-c10
            // First: if mieutachitiet is not empty, create a "gioi-thieu" section
            if (old.mieutachitiet && !isEmptyContent(old.mieutachitiet)) {
                await prisma.contentSection.create({
                    data: {
                        entityType: "COURSE",
                        entityId: course.id,
                        sectionKey: "gioi-thieu",
                        title: "Giới thiệu",
                        content: cleanHtml(old.mieutachitiet),
                        sortOrder: 0,
                        isActive: true,
                    },
                });
                sectionsCreated++;
            }

            // Then: create sections from t/c pairs
            for (let n = 1; n <= 10; n++) {
                const titleKey = `t${n}` as keyof OldCourse;
                const contentKey = `c${n}` as keyof OldCourse;
                const sectionTitle = old[titleKey] as string;
                const sectionContent = old[contentKey] as string;

                // Only create if title is non-empty
                if (sectionTitle && sectionTitle.trim() !== "") {
                    const content = sectionContent && !isEmptyContent(sectionContent)
                        ? cleanHtml(sectionContent)
                        : "";

                    const sectionKey = slugify(sectionTitle) || `section-${n}`;

                    await prisma.contentSection.create({
                        data: {
                            entityType: "COURSE",
                            entityId: course.id,
                            sectionKey: sectionKey.substring(0, 80),
                            title: sectionTitle.trim(),
                            content,
                            sortOrder: n,
                            isActive: true,
                        },
                    });
                    sectionsCreated++;
                }
            }

            imported++;
            const titlePreview =
                old.tieude.length > 60
                    ? old.tieude.substring(0, 60) + "..."
                    : old.tieude;
            const sectionCount = (old.mieutachitiet && !isEmptyContent(old.mieutachitiet) ? 1 : 0) +
                Array.from({ length: 10 }, (_, i) => (old[`t${i + 1}` as keyof OldCourse] as string)?.trim() ? 1 : 0).reduce((a: number, b: number) => a + b, 0);
            console.log(`  [${imported}] ID ${old.id} (${courseType}): ${titlePreview} [${sectionCount} sections]`);
        } catch (err) {
            skipped++;
            console.error(`  [SKIP] ID ${old.id}: ${(err as Error).message}`);
        }
    }

    // 6. Summary
    console.log("\n=== Migration Complete ===");
    console.log(`  Imported:  ${imported} courses`);
    console.log(`  Skipped:   ${skipped}`);
    console.log(`  Media:     ${mediaCreated} records created`);
    console.log(`  Sections:  ${sectionsCreated} content sections created`);
    console.log(`  Category:  ${daoTaoCategory.name} (${daoTaoCategory.id})`);

    // Verify counts
    const totalCourses = await prisma.course.count();
    const totalSections = await prisma.contentSection.count({
        where: { entityType: "COURSE" },
    });
    console.log(`\n  Total courses in DB:  ${totalCourses}`);
    console.log(`  Total sections in DB: ${totalSections}`);
}

main()
    .catch((e) => {
        console.error("ERROR:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
