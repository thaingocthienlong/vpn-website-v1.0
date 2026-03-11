
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function inspectDb() {
    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    console.log('--- ALL STAFF TYPES ---');
    const types = await prisma.staffType.findMany({
        include: { _count: { select: { staff: true } } }
    });
    console.table(types.map(t => ({ id: t.id, name: t.name, level: t.level, staffCount: t._count.staff })));

    console.log('\n--- ALL DEPARTMENTS ---');
    const depts = await prisma.department.findMany({
        include: { _count: { select: { staff: true } } }
    });
    console.table(depts.map(d => ({ id: d.id, name: d.name, staffCount: d._count.staff })));

    console.log('\n--- BAN LÃNH ĐẠO STAFF (First 10) ---');
    const staff = await prisma.staff.findMany({
        take: 10,
        include: { staffType: true, department: true }
    });
    console.table(staff.map(s => ({ name: s.name, title: s.title, type: s.staffType?.name, dept: s.department?.name })));

    await prisma.$disconnect();
}

inspectDb().catch(console.error);

