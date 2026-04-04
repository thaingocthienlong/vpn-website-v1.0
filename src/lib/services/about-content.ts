import { prisma } from "@/lib/prisma";

const ABOUT_PRIMARY_SLUG = "gioi-thieu";
const ABOUT_LEGACY_SLUG = "gioi-thieu-chung";
const ABOUT_SLUGS = [ABOUT_PRIMARY_SLUG, ABOUT_LEGACY_SLUG] as const;

export interface AboutFunctionItem {
    key: string;
    title: string;
    description: string;
}

export interface VietnameseAboutLandingContent {
    badge: string;
    title: string;
    description: string;
    motto: string | null;
    introParagraphs: string[];
    coreFunctions: AboutFunctionItem[];
    directionStatement: string | null;
    directionDescription: string | null;
    commitments: string[];
    values: string[];
    rawContent: string;
    metaTitle: string | null;
    metaDescription: string | null;
}

function decodeHtmlEntities(value: string): string {
    return value
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, "\"")
        .replace(/&#39;/gi, "'")
        .replace(/&#8211;/gi, "–")
        .replace(/&#8220;|&#8221;/gi, "\"");
}

function stripHtml(html: string): string {
    return decodeHtmlEntities(html)
        .replace(/<li[^>]*>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

function normalizeWhitespace(value: string): string {
    return decodeHtmlEntities(value).replace(/\s+/g, " ").trim();
}

export function normalizeLegacyAboutHtml(html: string): string {
    return (html || "")
        .replace(/<div class="eJOY__extension_root_class"[^>]*>[\s\S]*?<\/div>/gi, "")
        .replace(/id="eJOY__extension_root[^"]*"/g, "")
        .replace(/<table[^>]*>\s*<tbody>\s*<tr>\s*<td>\s*<p[^>]*>\s*<span[^>]*>\s*<span[^>]*>\s*HL\d+\s*<\/span>\s*<\/span>\s*<\/p>\s*<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>/gi, "")
        .replace(/<p[^>]*>\s*(?:<span[^>]*>\s*){0,4}HL\d+(?:\s*<\/span>){0,4}\s*<\/p>/gi, "")
        .replace(/<p[^>]*>(?:\s|&nbsp;|<span[^>]*>\s*<\/span>)*<\/p>/gi, "")
        .trim();
}

function extractParagraphs(html: string): string[] {
    return Array.from(html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
        .map((match) => normalizeWhitespace(stripHtml(match[1])))
        .filter(Boolean);
}

function extractLists(html: string): string[][] {
    return Array.from(html.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/gi))
        .map((match) =>
            Array.from(match[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
                .map((itemMatch) => normalizeWhitespace(stripHtml(itemMatch[1])))
                .filter(Boolean),
        )
        .filter((items) => items.length > 0);
}

function localizeFunctionTitle(letter: string, fallback: string): string {
    const normalizedLetter = letter.toLowerCase();
    if (normalizedLetter === "a") return "Nghiên cứu khoa học";
    if (normalizedLetter === "b") return "Dịch vụ khoa học và công nghệ";
    if (normalizedLetter === "c") return "Hợp tác và kết nối";
    return fallback;
}

function extractCoreFunctions(text: string | undefined): AboutFunctionItem[] {
    if (!text) return [];

    const normalized = text.replace(/^.*?chức năng nhiệm vụ:\s*/i, "").trim();
    return Array.from(normalized.matchAll(/([a-c])\)\s*([\s\S]*?)(?=(?:[a-c]\)\s*)|$)/gi))
        .map((match) => {
            const letter = match[1].toLowerCase();
            const segment = normalizeWhitespace(match[2]);
            const colonIndex = segment.indexOf(":");
            const title = colonIndex >= 0 ? segment.slice(0, colonIndex).trim() : segment;
            const description = colonIndex >= 0 ? segment.slice(colonIndex + 1).trim() : segment;

            return {
                key: letter,
                title: localizeFunctionTitle(letter, title || `Nhiệm vụ ${letter.toUpperCase()}`),
                description,
            };
        })
        .filter((item) => item.description);
}

function extractInstitutionName(paragraphs: string[]): string {
    const matched = paragraphs.find((paragraph) => paragraph.includes("Viện Phương Nam"));
    if (!matched) return "Viện Phương Nam";
    return "Viện Phương Nam";
}

function buildHeroDescription(paragraphs: string[]): string {
    return paragraphs.slice(0, 2).join(" ");
}

export async function getVietnameseAboutLandingContent(): Promise<VietnameseAboutLandingContent | null> {
    const pages = await prisma.page.findMany({
        where: {
            slug: { in: [...ABOUT_SLUGS] },
            isPublished: true,
        },
        select: {
            title: true,
            slug: true,
            content: true,
            metaTitle: true,
            metaDescription: true,
        },
    });

    const page =
        pages.find((candidate) => candidate.slug === ABOUT_PRIMARY_SLUG) ??
        pages.find((candidate) => candidate.slug === ABOUT_LEGACY_SLUG) ??
        null;

    if (!page) return null;

    const rawContent = normalizeLegacyAboutHtml(page.content || "");
    const paragraphs = extractParagraphs(rawContent);
    const lists = extractLists(rawContent);

    const heroParagraphs = paragraphs.slice(0, 3);
    const motto = paragraphs.find((paragraph) => paragraph.includes("NIỀM TIN ĐỐI TÁC")) ?? null;
    const functionsParagraph = paragraphs.find((paragraph) => paragraph.includes("chức năng nhiệm vụ"));
    const coreFunctions = extractCoreFunctions(functionsParagraph);
    const directionStatement =
        paragraphs.find((paragraph) => paragraph.includes("Cung cấp cho xã hội nguồn lực")) ?? null;
    const directionDescription =
        paragraphs.find((paragraph) => paragraph.includes("Với định hướng")) ?? null;

    const commitments =
        lists.find((items) => items.some((item) => item.includes("Nghiên cứu các đề tài"))) ?? [];
    const values =
        lists.find((items) => items.length >= 4 && items.every((item) => item.length <= 24)) ?? [];

    return {
        badge: page.title || "Giới thiệu chung",
        title: extractInstitutionName(paragraphs),
        description: buildHeroDescription(heroParagraphs),
        motto,
        introParagraphs: heroParagraphs,
        coreFunctions,
        directionStatement,
        directionDescription,
        commitments,
        values,
        rawContent,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
    };
}
