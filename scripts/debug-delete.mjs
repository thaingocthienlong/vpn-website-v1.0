
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config();

const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace("file:", "")
    : "./prisma/dev.db";

const absoluteDbPath = path.resolve(process.cwd(), dbPath);
const dbUrl = `file:${absoluteDbPath}`;

console.log(`Database URL: ${dbUrl}`);

const adapter = new PrismaLibSql({
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("--- Debug Partner Delete ---");

    // 0. Get a User for upload
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error("No user found. Cannot create media.");
        // Create a dummy user if needed?
        // Let's assume there is one. If not, script fails.
        return;
    }

    // 1. Create a dummy Media first
    const media = await prisma.media.create({
        data: {
            filename: "debug-logo.png",
            url: "http://example.com/logo.png",
            size: 1024,
            mimeType: "image/png",
            uploadedById: user.id
        }
    });
    console.log(`Created media: ${media.id}`);

    // 2. Create partner with logo
    const partner = await prisma.partner.create({
        data: {
            name: "Delete Me Test Partner With Logo",
            logoId: media.id
        }
    });

    console.log(`Created partner: ${partner.id} (${partner.name})`);

    // 3. Try to add a relation (CoursePartner) if possible
    const course = await prisma.course.findFirst();
    if (course) {
        await prisma.coursePartner.create({
            data: {
                courseId: course.id,
                partnerId: partner.id
            }
        });
        console.log(`Linked to course: ${course.id}`);
    } else {
        console.log("No courses found to link.");
    }

    // 4. Try to delete using the API logic
    try {
        console.log("Attempting delete logic...");

        await prisma.coursePartner.deleteMany({ where: { partnerId: partner.id } });
        const deleted = await prisma.partner.delete({ where: { id: partner.id } });

        console.log("✅ Delete successful!");
        console.log("Deleted:", deleted);

        // Cleanup media? (In real app, media might stay or go. Schema says set null on delete? No constraint.)
        // Partner deleted -> logoId in partner gone. Media record stays.
        // We can manually delete media for cleanup test.
        await prisma.media.delete({ where: { id: media.id } });
        console.log("Cleaned up media.");

    } catch (error) {
        console.error("❌ Delete failed!");
        console.error(error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
