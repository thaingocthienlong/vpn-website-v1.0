import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const DEPARTMENT_SLUG = "ban-lanh-dao-vien";
const LEGACY_SOURCE = "banlanhdao.json";
const LEADER_STAFF_TYPE = "Viện Trưởng";
const DEPUTY_STAFF_TYPE = "Phó Viện Trưởng";
const DEFAULT_STAFF_TYPE = "Nhân Viên";
const SYSTEM_EMAIL = "system@sisrd.vn";

interface LegacyLeadershipRecord {
    id?: string | number;
    name?: string;
    chucvu?: string;
    mieutangan?: string;
    anhdaidien?: string;
    stt_hienthi?: string | number;
}

function normalizeWhitespace(value: string | null | undefined): string {
    return String(value || "").replace(/\s+/g, " ").trim();
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

function isHeadingMarker(record: LegacyLeadershipRecord): boolean {
    const name = normalizeWhitespace(record.name);
    const title = normalizeWhitespace(record.chucvu);
    const bio = normalizeLegacyHtml(record.mieutangan || "");
    const avatar = normalizeWhitespace(record.anhdaidien);

    return Boolean(name) && isUppercaseHeadingText(name) && !title && !bio && !avatar;
}

function normalizeTitleKey(value: string): string {
    return normalizeWhitespace(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .toUpperCase();
}

function resolveStaffTypeName(title: string, isHeading: boolean): string {
    if (isHeading) {
        return DEFAULT_STAFF_TYPE;
    }

    const normalized = normalizeTitleKey(title);
    if (normalized === "VIEN TRUONG") {
        return LEADER_STAFF_TYPE;
    }
    if (normalized.startsWith("PHO GIAM DOC") || normalized.startsWith("PHO VIEN TRUONG")) {
        return DEPUTY_STAFF_TYPE;
    }

    return DEFAULT_STAFF_TYPE;
}

function resolveDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured.");
    }
    return databaseUrl;
}

function mediaFilename(url: string): string {
    try {
        const parsed = new URL(url);
        return path.basename(parsed.pathname) || "remote-file";
    } catch {
        return path.basename(url) || "remote-file";
    }
}

function guessMime(url: string): string | null {
    const lower = url.toLowerCase();
    if (lower.endsWith(".png")) return "image/png";
    if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
    if (lower.endsWith(".webp")) return "image/webp";
    if (lower.endsWith(".svg")) return "image/svg+xml";
    if (lower.endsWith(".gif")) return "image/gif";
    return null;
}

function loadLegacyRecords(): LegacyLeadershipRecord[] {
    const filePath = path.join(process.cwd(), "migrate", "sql_json_export", LEGACY_SOURCE);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as LegacyLeadershipRecord[] | LegacyLeadershipRecord;
    const records = Array.isArray(raw) ? raw : [raw];
    return records.sort((left, right) => (Number(left.stt_hienthi ?? 0) || 0) - (Number(right.stt_hienthi ?? 0) || 0));
}

async function ensureMedia(prisma: PrismaClient, url: string, altText: string, uploadedById: string): Promise<string | null> {
    const normalizedUrl = normalizeWhitespace(url);
    if (!normalizedUrl || normalizedUrl.startsWith("/uploads/") || normalizedUrl.startsWith("/fontend/")) {
        return null;
    }

    const existing = await prisma.media.findFirst({ where: { url: normalizedUrl }, select: { id: true } });
    if (existing) {
        return existing.id;
    }

    const media = await prisma.media.create({
        data: {
            url: normalizedUrl,
            secureUrl: normalizedUrl.startsWith("https://") ? normalizedUrl : null,
            filename: mediaFilename(normalizedUrl),
            format: path.extname(mediaFilename(normalizedUrl)).replace(".", "") || null,
            mimeType: guessMime(normalizedUrl),
            size: 0,
            alt: altText || null,
            uploadedById,
        },
    });

    return media.id;
}

async function main() {
    const adapter = new PrismaLibSql({ url: resolveDatabaseUrl() });
    const prisma = new PrismaClient({ adapter });

    try {
        const records = loadLegacyRecords();
        const [department, systemUser, leaderType, deputyType, defaultType] = await Promise.all([
            prisma.department.findUnique({ where: { slug: DEPARTMENT_SLUG }, select: { id: true } }),
            prisma.user.findFirst({ where: { email: SYSTEM_EMAIL }, select: { id: true } }),
            prisma.staffType.findFirst({ where: { name: LEADER_STAFF_TYPE }, select: { id: true } }),
            prisma.staffType.findFirst({ where: { name: DEPUTY_STAFF_TYPE }, select: { id: true } }),
            prisma.staffType.findFirst({ where: { name: DEFAULT_STAFF_TYPE }, select: { id: true } }),
        ]);

        if (!department) {
            throw new Error(`Department "${DEPARTMENT_SLUG}" was not found.`);
        }
        if (!systemUser) {
            throw new Error(`System user "${SYSTEM_EMAIL}" was not found.`);
        }
        if (!leaderType || !deputyType || !defaultType) {
            throw new Error("Required staff types for org-structure backfill were not found.");
        }

        const staffTypeByName = new Map<string, string>([
            [LEADER_STAFF_TYPE, leaderType.id],
            [DEPUTY_STAFF_TYPE, deputyType.id],
            [DEFAULT_STAFF_TYPE, defaultType.id],
        ]);

        const existingRows = await prisma.staff.findMany({
            where: { departmentId: department.id },
            select: { id: true, name: true },
        });

        const existingByName = new Map<string, { id: string; name: string }>();
        for (const row of existingRows) {
            const key = normalizeWhitespace(row.name);
            if (existingByName.has(key)) {
                throw new Error(`Duplicate staff name found in org-structure department: ${row.name}`);
            }
            existingByName.set(key, row);
        }

        let created = 0;
        let updated = 0;
        let headings = 0;
        let featuredCandidates = 0;

        for (const record of records) {
            const name = normalizeWhitespace(record.name);
            if (!name) {
                continue;
            }

            const isHeading = isHeadingMarker(record);
            const title = normalizeWhitespace(record.chucvu);
            const bio = normalizeLegacyHtml(record.mieutangan || "") || null;
            const staffTypeName = resolveStaffTypeName(title, isHeading);
            const staffTypeId = staffTypeByName.get(staffTypeName) || defaultType.id;
            const avatarId = await ensureMedia(prisma, normalizeWhitespace(record.anhdaidien), `${name} avatar`, systemUser.id);
            const payload = {
                name,
                title: title || null,
                bio,
                avatarId,
                departmentId: department.id,
                staffTypeId,
                sortOrder: Number(record.stt_hienthi ?? 0) || 0,
                isActive: true,
            };

            const existing = existingByName.get(name);
            if (existing) {
                await prisma.staff.update({
                    where: { id: existing.id },
                    data: payload,
                });
                updated += 1;
            } else {
                const createdRow = await prisma.staff.create({ data: payload });
                existingByName.set(name, createdRow);
                created += 1;
            }

            if (isHeading) {
                headings += 1;
            } else if (staffTypeName === LEADER_STAFF_TYPE || staffTypeName === DEPUTY_STAFF_TYPE) {
                featuredCandidates += 1;
            }
        }

        console.log(
            JSON.stringify(
                {
                    updated,
                    created,
                    headings,
                    featuredCandidates,
                    department: DEPARTMENT_SLUG,
                    sourceRecords: records.length,
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
