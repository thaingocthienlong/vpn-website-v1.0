
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function verify() {
    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🔍 Starting Database Verification for Advisory Board...');

        // 1. Check StaffType
        const type = await prisma.staffType.findFirst({
            where: { name: 'Hội đồng Cố vấn Khoa học' }
        });

        if (!type) {
            console.error('[FAIL] StaffType "Hội đồng Cố vấn Khoa học" not found.');
            process.exit(1);
        }
        console.log(`[PASS] StaffType found. ID: ${type.id}`);

        // 2. Count Records
        const count = await prisma.staff.count({
            where: { staffTypeId: type.id }
        });
        console.log(`[INFO] Found ${count} members in this StaffType.`);

        // 3. Check for specific record
        const target = await prisma.staff.findFirst({
            where: { name: 'GS.TS. HỒ ĐỨC HÙNG' },
            include: { department: true }
        });

        if (target) {
            console.log(`[PASS] Record "GS.TS. HỒ ĐỨC HÙNG" imported successfully.`);
            console.log(`       - Title: ${target.title}`);
            console.log(`       - Department: ${target.department?.name || 'None'}`);
            console.log(`       - Avatar ID: ${target.avatarId ? 'Present' : 'Missing'}`);
        } else {
            console.error('[FAIL] Target record "GS.TS. HỒ ĐỨC HÙNG" NOT found.');
            process.exit(1);
        }

        console.log('✅ Verification completed successfully.');
    } catch (e) {
        console.error('[FAIL] Error during verification:', e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
