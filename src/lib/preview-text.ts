import { characterEntities } from "character-entities";

export function decodeHtmlEntities(text: string): string {
    return text.replace(/&(#x?[0-9a-f]+|[0-9a-z]+);/gi, (entity, token) => {
        if (token.startsWith("#x") || token.startsWith("#X")) {
            const codePoint = parseInt(token.slice(2), 16);
            return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
        }

        if (token.startsWith("#")) {
            const codePoint = parseInt(token.slice(1), 10);
            return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : entity;
        }

        return characterEntities[token] ?? entity;
    });
}

export function normalizePlainText(text: string | null | undefined): string | null {
    if (!text) return null;

    const normalized = decodeHtmlEntities(text)
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return normalized || null;
}

export function normalizePreviewText(text: string | null | undefined): string | null {
    if (!text) return null;

    const normalized = decodeHtmlEntities(text)
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/\u00A0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return normalized || null;
}
