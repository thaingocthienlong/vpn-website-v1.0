import { config } from 'dotenv';
config({ path: '.env.local' });
import { prisma } from '../src/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

function isDepartment(record: any) {
    const hasNoAvatar = !record.anhdaidien || record.anhdaidien.trim() === '';
    const hasNoTitle = !record.chucvu || record.chucvu.trim() === '';
    return hasNoAvatar && hasNoTitle;
}

async function main() {
    console.log("Starting patch...");
    const rawData = await fs.readFile(path.join(__dirname, '../bancovan.json'), 'utf8');
    let records = JSON.parse(rawData);

    for (const r of records) {
        const name = r.name ? r.name.trim() : '';
        if (!name || isDepartment(r)) continue;

        if (r.mieutangan) {
            console.log(`Updating bio for ${name}...`);
            await prisma.staff.updateMany({
                where: { name: name },
                data: { bio: r.mieutangan }
            });
        }
    }
    console.log("Patch complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
