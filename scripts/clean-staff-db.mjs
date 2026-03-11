
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function cleanDb() {
    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    console.log('--- CLEANING DB: ORPHANED STAFF TYPES ---');
    try {
        const types = await prisma.staffType.findMany({
            include: { _count: { select: { staff: true } } }
        });

        const orphanedIds = types.filter(t => t._count.staff === 0).map(t => t.id);

        if (orphanedIds.length > 0) {
            console.log(`Found ${orphanedIds.length} empty StaffType records. Deleting...`);
            const deleted = await prisma.staffType.deleteMany({
                where: { id: { in: orphanedIds } }
            });
            console.log(`✅ Deleted ${deleted.count} orphaned StaffType records.`);
        } else {
            console.log('No orphaned StaffType records found.');
        }

        // Keep core types just to be safe
        console.log('\n--- VERIFYING CORE TYPES ---');
        const remainingTypes = await prisma.staffType.findMany({
            include: { _count: { select: { staff: true } } }
        });
        console.table(remainingTypes.map(t => ({ id: t.id, name: t.name, count: t._count.staff })));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanDb();
