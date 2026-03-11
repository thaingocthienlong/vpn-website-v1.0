/**
 * Centralized locale utility for multi-language support
 * Ref: FEATURES_SPEC §6 (ML-01) - Fallback: if EN content is empty → show VI
 */

import { type Locale } from "@/i18n/config";

/**
 * Get a localized field value with fallback.
 * If locale=en and the _en field exists and is non-empty, return it.
 * Otherwise, return the default (VI) field.
 *
 * @example
 * getLocalizedField(post, 'title', 'en')
 * // Returns post.title_en if non-empty, else post.title
 */
export function getLocalizedField<T extends Record<string, unknown>>(
    entity: T,
    field: string,
    locale: Locale
): unknown {
    if (locale === "en") {
        const enField = `${field}_en`;
        const enValue = entity[enField];
        if (enValue !== null && enValue !== undefined && enValue !== "") {
            return enValue;
        }
    }
    return entity[field];
}

/**
 * Get a localized string field with fallback.
 * Type-safe version that always returns string | null.
 */
export function getLocalizedString<T extends Record<string, unknown>>(
    entity: T,
    field: string,
    locale: Locale
): string | null {
    const value = getLocalizedField(entity, field, locale);
    return typeof value === "string" ? value : null;
}

/**
 * Transform an entity object by localizing specified fields.
 * Returns a new object with localized values (no _en suffix in output).
 *
 * @example
 * localizeEntity(post, ['title', 'excerpt', 'content'], 'en')
 * // Returns { ...post, title: post.title_en || post.title, ... }
 */
export function localizeEntity<T extends Record<string, unknown>>(
    entity: T,
    fields: string[],
    locale: Locale
): T {
    if (locale === "vi") return entity; // No transformation needed for default locale

    const localized = { ...entity };
    for (const field of fields) {
        const enField = `${field}_en`;
        const enValue = entity[enField];
        if (enValue !== null && enValue !== undefined && enValue !== "") {
            (localized as Record<string, unknown>)[field] = enValue;
        }
        // Remove _en fields from output
        delete (localized as Record<string, unknown>)[enField];
    }
    return localized;
}

/**
 * Parse locale from various sources (query param, cookie, header).
 * Validates against supported locales.
 */
export function parseLocale(value: string | null | undefined): Locale {
    if (value === "en") return "en";
    return "vi"; // Default to Vietnamese
}
