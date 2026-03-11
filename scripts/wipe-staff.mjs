import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function wipe() {
    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    console.log('🧨 Wiping Staff Data...');

    try {
        const deletedStaff = await prisma.staff.deleteMany({});
        console.log(`Deleted ${deletedStaff.count} Staff records.`);

        const deletedTypes = await prisma.staffType.deleteMany({});
        console.log(`Deleted ${deletedTypes.count} StaffType records.`);

        const deletedDepts = await prisma.department.deleteMany({});
        console.log(`Deleted ${deletedDepts.count} Department records.`);

        console.log('✅ Wipe Complete!');
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

wipe();
