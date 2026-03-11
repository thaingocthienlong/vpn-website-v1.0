
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testStructure() {
    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    // We fetch all NON-advisory staff
    const staffList = await prisma.staff.findMany({
        where: {
            isActive: true,
            staffType: {
                name: { in: ['Ban Lãnh Đạo', 'Cán Bộ Quản Lý', 'Chuyên viên'] }
            }
        },
        include: { department: true },
        orderBy: { sortOrder: 'asc' }
    });

    const depts = await prisma.department.findMany({
        where: {
            id: { in: [...new Set(staffList.map(s => s.departmentId).filter(Boolean))] }
        },
        orderBy: { sortOrder: 'asc' }
    });

    console.log('--- EXPECTED HIERARCHY FOR CƠ CẤU TỔ CHỨC ---');

    // Top level (no department) -> This should be Viện Trưởng
    const topLevel = staffList.filter(s => !s.departmentId);
    if (topLevel.length > 0) {
        console.log('TOP LEVEL:');
        topLevel.forEach(s => console.log(` - ${s.name} (${s.title})`));
    }

    depts.forEach(d => {
        console.log(`\nDEPARTMENT: ${d.name}`);
        const members = staffList.filter(s => s.departmentId === d.id);
        members.forEach(m => console.log(` - ${m.name} (${m.title})`));
    });

    await prisma.$disconnect();
}

testStructure().catch(console.error);
