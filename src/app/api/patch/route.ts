import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const rawData = await fs.readFile(path.join(process.cwd(), 'bancovan.json'), 'utf8');
        let records = JSON.parse(rawData);

        let count = 0;
        for (const r of records) {
            const name = r.name ? r.name.trim() : '';
            if (!name) continue;

            if (r.mieutangan) {
                await prisma.staff.updateMany({
                    where: { name: { contains: name } },
                    data: { bio: r.mieutangan }
                });
                count++;
            }
        }

        return NextResponse.json({ success: true, updated: count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
