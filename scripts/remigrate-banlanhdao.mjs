
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const DATA_FILE = path.join(__dirname, '../banlanhdao.json');

function isDepartment(record) {
    if (record.chucvu && record.chucvu.trim() !== '') return false;
    const name = record.name.toLowerCase();
    return name.includes('trung tâm') || name.includes('phòng') || name.includes('khối');
}

async function main() {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");

    const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    try {
        console.log('🚀 Starting Ban Lãnh Đạo Hierarchy Fix...');

        const rawData = await fs.readFile(DATA_FILE, 'utf8');
        let records = JSON.parse(rawData);

        // This is the CRITICAL FIX: Sort by stt_hienthi precisely
        records.sort((a, b) => (a.stt_hienthi || 0) - (b.stt_hienthi || 0));

        let currentDept = null;
        let fixCount = 0;

        for (const r of records) {
            const name = r.name ? r.name.trim() : '';
            if (!name) continue;

            if (isDepartment(r)) {
                console.log(`\n🏢 Found Department Heading: ${name}`);
                currentDept = await prisma.department.findFirst({
                    where: { name: name }
                });
                if (!currentDept) {
                    currentDept = await prisma.department.create({
                        data: {
                            name: name,
                            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            sortOrder: r.stt_hienthi || 0
                        }
                    });
                } else {
                    await prisma.department.update({
                        where: { id: currentDept.id },
                        data: { sortOrder: r.stt_hienthi || 0 }
                    });
                }
                continue;
            }

            // It's a staff member
            const chucvu = r.chucvu ? r.chucvu.trim() : '';
            console.log(`👤 Checking: ${name} (${chucvu})`);

            const existingStaff = await prisma.staff.findFirst({ where: { name: name } });

            if (existingStaff) {
                const targetDeptId = currentDept ? currentDept.id : null;

                if (existingStaff.departmentId !== targetDeptId) {
                    console.log(`   🔄 Fixing Department: ${existingStaff.departmentId || 'None'} -> ${targetDeptId || 'None (Top Level)'}`);
                    await prisma.staff.update({
                        where: { id: existingStaff.id },
                        data: {
                            departmentId: targetDeptId,
                            sortOrder: r.stt_hienthi || 0
                        }
                    });
                    fixCount++;
                } else {
                    // Just update sort order to be safe
                    await prisma.staff.update({
                        where: { id: existingStaff.id },
                        data: { sortOrder: r.stt_hienthi || existingStaff.sortOrder }
                    });
                }
            } else {
                console.log(`   ⚠️ WARNING: Staff ${name} not found in DB!`);
            }
        }

        console.log(`\n🎉 Hierarchy Fix Complete! Adjusted ${fixCount} staff members.`);

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
