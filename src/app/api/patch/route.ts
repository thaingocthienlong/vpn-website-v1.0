import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const rawData = await fs.readFile(path.join(process.cwd(), 'bancovan.json'), 'utf8');
        const records: Array<{ name?: string; mieutangan?: string }> = JSON.parse(rawData);

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
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
