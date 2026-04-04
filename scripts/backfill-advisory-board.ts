import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const ADVISORY_DEPARTMENT_SLUG = "ban-co-van";
const ADVISORY_STAFF_TYPE = "Cố Vấn";
const DEFAULT_STAFF_TYPE = "Nhân Viên";

interface LegacyAdvisoryRecord {
    id?: string | number;
    name?: string;
    chucvu?: string;
    mieutangan?: string;
    anhdaidien?: string;
    stt_hienthi?: string | number;
    xuongdong?: string | number;
}

function normalizeWhitespace(value: string | null | undefined): string {
    return String(value || "").replace(/\s+/g, " ").trim();
}

function resolveDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured.");
    }
    return databaseUrl;
}

function loadLegacyRecords(): LegacyAdvisoryRecord[] {
    const filePath = path.join(process.cwd(), "migrate", "sql_json_export", "bancovan.json");
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as LegacyAdvisoryRecord[] | LegacyAdvisoryRecord;
    const records = Array.isArray(raw) ? raw : [raw];
    return records.sort((left, right) => (Number(left.stt_hienthi ?? 0) || 0) - (Number(right.stt_hienthi ?? 0) || 0));
}

function normalizeLegacyHtml(html: string): string {
    return String(html || "")
        .replace(/<p[^>]*>(?:\s|&nbsp;|<span[^>]*>\s*<\/span>)*<\/p>/gi, "")
        .trim();
}

function isUppercaseHeadingText(value: string): boolean {
    const compact = normalizeWhitespace(value).replace(/[^\p{L}\p{N}]+/gu, "");
    if (!compact) return false;
    return compact === compact.toUpperCase();
}

function isLegacyHeading(record: LegacyAdvisoryRecord): boolean {
    const name = normalizeWhitespace(record.name);
    const title = normalizeWhitespace(record.chucvu);
    const bio = normalizeLegacyHtml(record.mieutangan || "");
    const avatar = normalizeWhitespace(record.anhdaidien);

    return Boolean(name) && isUppercaseHeadingText(name) && !title && !bio && !avatar;
}

async function main() {
    const adapter = new PrismaLibSql({ url: resolveDatabaseUrl() });
    const prisma = new PrismaClient({ adapter });

    try {
        const records = loadLegacyRecords();
        const [department, advisoryType, defaultType] = await Promise.all([
            prisma.department.findUnique({ where: { slug: ADVISORY_DEPARTMENT_SLUG }, select: { id: true } }),
            prisma.staffType.findFirst({ where: { name: ADVISORY_STAFF_TYPE }, select: { id: true } }),
            prisma.staffType.findFirst({ where: { name: DEFAULT_STAFF_TYPE }, select: { id: true } }),
        ]);

        if (!department) {
            throw new Error(`Department "${ADVISORY_DEPARTMENT_SLUG}" was not found.`);
        }
        if (!advisoryType || !defaultType) {
            throw new Error("Required staff types for advisory backfill were not found.");
        }

        const existingRows = await prisma.staff.findMany({
            where: { departmentId: department.id },
            select: { id: true, name: true },
        });

        const existingByName = new Map<string, { id: string; name: string }>();
        for (const row of existingRows) {
            const key = normalizeWhitespace(row.name);
            if (existingByName.has(key)) {
                throw new Error(`Duplicate staff name found in advisory department: ${row.name}`);
            }
            existingByName.set(key, row);
        }

        const missingNames = records
            .map((record) => normalizeWhitespace(record.name))
            .filter((name) => name && !existingByName.has(name));

        if (missingNames.length > 0) {
            throw new Error(`Missing advisory staff rows in database: ${missingNames.join(", ")}`);
        }

        let updated = 0;
        let headings = 0;
        let advisoryMembers = 0;

        for (const record of records) {
            const name = normalizeWhitespace(record.name);
            if (!name) {
                continue;
            }

            const target = existingByName.get(name);
            if (!target) {
                continue;
            }

            const isHeading = isLegacyHeading(record);

            await prisma.staff.update({
                where: { id: target.id },
                data: {
                    title: normalizeWhitespace(record.chucvu) || null,
                    bio: normalizeLegacyHtml(record.mieutangan || "") || null,
                    sortOrder: Number(record.stt_hienthi ?? 0) || 0,
                    isActive: String(record.xuongdong ?? "1") !== "0",
                    staffTypeId: isHeading ? defaultType.id : advisoryType.id,
                },
            });

            updated += 1;
            if (isHeading) {
                headings += 1;
            } else {
                advisoryMembers += 1;
            }
        }

        console.log(
            JSON.stringify(
                {
                    updated,
                    headings,
                    advisoryMembers,
                    department: ADVISORY_DEPARTMENT_SLUG,
                },
                null,
                2
            )
        );
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
