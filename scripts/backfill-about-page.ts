import fs from "node:fs";
import path from "node:path";
import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const LEGACY_SLUG = "gioi-thieu-chung";
const CANONICAL_SLUG = "gioi-thieu";

interface LegacyPageAllRecord {
    id?: string | number;
    name_page?: string;
    tieude?: string;
    duongdan?: string;
    slug?: string;
    mieutachitiet?: string;
    tieudeseo?: string;
    mieutaseo?: string;
    trangthai?: string | number;
    stt_hienthi?: string | number;
}

function normalizeLegacyAboutHtml(html: string): string {
    return (html || "")
        .replace(/<div class="eJOY__extension_root_class"[^>]*>[\s\S]*?<\/div>/gi, "")
        .replace(/id="eJOY__extension_root[^"]*"/g, "")
        .replace(/<table[^>]*>\s*<tbody>\s*<tr>\s*<td>\s*<p[^>]*>\s*<span[^>]*>\s*<span[^>]*>\s*HL\d+\s*<\/span>\s*<\/span>\s*<\/p>\s*<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>/gi, "")
        .replace(/<p[^>]*>\s*(?:<span[^>]*>\s*){0,4}HL\d+(?:\s*<\/span>){0,4}\s*<\/p>/gi, "")
        .replace(/<p[^>]*>(?:\s|&nbsp;|<span[^>]*>\s*<\/span>)*<\/p>/gi, "")
        .trim();
}

function resolveDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured.");
    }
    return databaseUrl;
}

function loadLegacyRecord(): LegacyPageAllRecord {
    const filePath = path.join(process.cwd(), "migrate", "sql_json_export", "page_all.json");
    const records = JSON.parse(fs.readFileSync(filePath, "utf8")) as LegacyPageAllRecord[];
    const record = records.find((candidate) => {
        const slug = String(candidate.duongdan || candidate.slug || "").trim();
        return slug === LEGACY_SLUG;
    });

    if (!record) {
        throw new Error(`Legacy page_all.json record "${LEGACY_SLUG}" was not found.`);
    }

    return record;
}

function stripHtml(html: string): string {
    return html
        .replace(/<li[^>]*>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

function excerptFromHtml(html: string, limit = 180): string {
    const plainText = stripHtml(html);
    if (plainText.length <= limit) return plainText;
    return `${plainText.slice(0, limit).trimEnd()}...`;
}

async function main() {
    const databaseUrl = resolveDatabaseUrl();
    const adapter = new PrismaLibSql({ url: databaseUrl });
    const prisma = new PrismaClient({ adapter });

    try {
        const legacy = loadLegacyRecord();
        const normalizedContent = normalizeLegacyAboutHtml(String(legacy.mieutachitiet || ""));

        if (!normalizedContent.trim()) {
            throw new Error("Legacy About content is empty after normalization.");
        }

        const [existingCanonical, existingLegacy] = await Promise.all([
            prisma.page.findUnique({ where: { slug: CANONICAL_SLUG } }),
            prisma.page.findUnique({ where: { slug: LEGACY_SLUG } }),
        ]);

        const target = existingCanonical ?? existingLegacy;
        const systemUser = target
            ? null
            : await prisma.user.findFirst({
                where: { email: "system@sisrd.vn" },
                select: { id: true },
            });

        const authorId = target?.authorId || systemUser?.id;
        if (!authorId) {
            throw new Error("Unable to resolve an authorId for the About page backfill.");
        }

        const title = String(legacy.tieude || legacy.name_page || "Giới thiệu chung").trim();
        const payload = {
            title,
            slug: CANONICAL_SLUG,
            content: normalizedContent,
            template: target?.template || "default",
            authorId,
            isPublished: target?.isPublished ?? String(legacy.trangthai ?? "1") !== "0",
            sortOrder: target?.sortOrder ?? (Number(legacy.stt_hienthi ?? 0) || 0),
            metaTitle: String(legacy.tieudeseo || "").trim() || title,
            metaDescription:
                String(legacy.mieutaseo || "").trim() || excerptFromHtml(normalizedContent, 220),
        };

        if (existingCanonical) {
            await prisma.page.update({ where: { id: existingCanonical.id }, data: payload });
            console.log(`Updated canonical page "${CANONICAL_SLUG}".`);
        } else if (existingLegacy) {
            await prisma.page.update({ where: { id: existingLegacy.id }, data: payload });
            console.log(`Updated legacy page "${LEGACY_SLUG}" and promoted it to "${CANONICAL_SLUG}".`);
        } else {
            await prisma.page.create({ data: payload });
            console.log(`Created canonical page "${CANONICAL_SLUG}".`);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
