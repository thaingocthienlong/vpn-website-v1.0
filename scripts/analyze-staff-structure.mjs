
import fs from 'fs';

const banlanhdao = JSON.parse(fs.readFileSync('c:/Users/longt/Desktop/website/new/banlanhdao.json', 'utf8'));
const bancovan = JSON.parse(fs.readFileSync('c:/Users/longt/Desktop/website/new/bancovan.json', 'utf8'));

console.log('--- BAN LÃNH ĐẠO (Cơ cấu tổ chức) ---');
console.log(`Total records: ${banlanhdao.length}`);
const depts1 = banlanhdao.filter(r => (!r.chucvu || r.chucvu.trim() === '') && (r.name.toLowerCase().includes('trung tâm') || r.name.toLowerCase().includes('phòng') || r.name.toLowerCase().includes('khối')));
console.log(`Identified Departments/Headings: ${depts1.length}`);
depts1.forEach(d => console.log(`  - ${d.name} (stt: ${d.stt_hienthi})`));


console.log('\n--- BAN CỐ VẤN (Hội đồng Cố vấn Khoa học) ---');
console.log(`Total records: ${bancovan.length}`);
const depts2 = bancovan.filter(r => !r.anhdaidien && !r.chucvu && !r.mieutangan && r.name);
console.log(`Identified Departments/Headings: ${depts2.length}`);
depts2.forEach(d => console.log(`  - ${d.name} (stt: ${d.stt_hienthi})`));

// Check DB structure
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function checkDb() {
    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    console.log('\n--- DATABASE CACHED STRUCTURE ---');
    const types = await prisma.staffType.findMany({
        include: {
            _count: { select: { staff: true } }
        }
    });

    types.forEach(t => console.log(`StaffType: ${t.name} (Level ${t.level}) - ${t._count.staff} members`));

    const depts = await prisma.department.findMany({
        include: { _count: { select: { staff: true } } }
    });

    console.log('\nDepartments:');
    depts.forEach(d => console.log(`- ${d.name} : ${d._count.staff} members`));

    await prisma.$disconnect();
}

checkDb().catch(console.error);

