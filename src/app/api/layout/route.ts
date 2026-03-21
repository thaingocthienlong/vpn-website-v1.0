import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const configs = await prisma.configuration.findMany({
            where: { group: { in: ["header", "footer", "general"] } }
        });
        const configMap: Record<string, Record<string, string>> = {};
        configs.forEach((c) => {
            if (!configMap[c.group]) configMap[c.group] = {};
            const key = c.key.split('.')[1] || c.key;
            configMap[c.group][key] = c.value;
        });
        return NextResponse.json({
            header: configMap["header"] || {},
            footer: configMap["footer"] || {},
            general: configMap["general"] || {},
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch layout configurations" }, { status: 500 });
    }
}
