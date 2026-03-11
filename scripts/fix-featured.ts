/**
 * Quick script: Remove isFeatured from all posts except the most recent one.
 * Run: npx tsx scripts/fix-featured.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
    // Find all featured posts
    const featured = await prisma.post.findMany({
        where: { isFeatured: true },
        orderBy: { publishedAt: "desc" },
        select: { id: true, title: true, publishedAt: true },
    });

    console.log(`Currently featured: ${featured.length} posts`);
    featured.forEach((f) => console.log(`  - ${f.title.substring(0, 70)}`));

    if (featured.length <= 1) {
        console.log("Nothing to change.");
        return;
    }

    // Keep only the first (most recent) one
    const keepId = featured[0].id;
    console.log(`\nKeeping ONLY: "${featured[0].title.substring(0, 70)}"`);

    const result = await prisma.post.updateMany({
        where: {
            isFeatured: true,
            id: { not: keepId },
        },
        data: { isFeatured: false },
    });

    console.log(`Unfeatured: ${result.count} posts`);

    // Verify
    const remaining = await prisma.post.findMany({
        where: { isFeatured: true },
        select: { id: true, title: true },
    });
    console.log(`\nNow featured: ${remaining.length}`);
    remaining.forEach((f) => console.log(`  - ${f.title.substring(0, 70)}`));
}

main()
    .catch((e) => {
        console.error("ERROR:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
