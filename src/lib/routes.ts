/**
 * Route mapping between Vietnamese and English paths.
 * Used by the language switcher to navigate to equivalent pages.
 */

export interface RouteMapping {
    vi: string;
    en: string;
}

/**
 * Static route mappings between VI and EN paths.
 * Order matters: more specific routes should come first.
 */
export const routeMappings: RouteMapping[] = [
    // About pages
    { vi: "/gioi-thieu/tam-nhin-su-menh", en: "/en/about/vision-mission" },
    { vi: "/gioi-thieu/co-cau-to-chuc", en: "/en/about/structure" },
    { vi: "/gioi-thieu/hoi-dong-co-van", en: "/en/about/advisory-board" },
    { vi: "/gioi-thieu/doi-tac", en: "/en/about/partners" },
    { vi: "/gioi-thieu", en: "/en/about" },

    // Training
    { vi: "/dao-tao/dang-ky", en: "/en/training/register" },
    { vi: "/dao-tao", en: "/en/training" },

    // News
    { vi: "/tin-tuc", en: "/en/news" },

    // Services
    { vi: "/dich-vu", en: "/en/services" },

    // Contact
    { vi: "/lien-he", en: "/en/contact" },

    // Homepage
    { vi: "/", en: "/en" },
];

/**
 * Get the equivalent route in the target locale.
 * Handles both static and dynamic routes (with slugs).
 *
 * Examples:
 * - getEquivalentRoute("/gioi-thieu", "en") → "/en/about"
 * - getEquivalentRoute("/en/about", "vi") → "/gioi-thieu"
 * - getEquivalentRoute("/dao-tao/slug-here", "en") → "/en/training/slug-here"
 * - getEquivalentRoute("/en/training/slug-here", "vi") → "/dao-tao/slug-here"
 */
export function getEquivalentRoute(
    currentPath: string,
    targetLocale: "vi" | "en"
): string {
    // Try exact match first
    for (const mapping of routeMappings) {
        if (targetLocale === "en" && currentPath === mapping.vi) {
            return mapping.en;
        }
        if (targetLocale === "vi" && currentPath === mapping.en) {
            return mapping.vi;
        }
    }

    // Try prefix match for dynamic routes (e.g., /dao-tao/my-course → /en/training/my-course)
    for (const mapping of routeMappings) {
        if (targetLocale === "en" && currentPath.startsWith(mapping.vi + "/")) {
            const slug = currentPath.substring(mapping.vi.length);
            return mapping.en + slug;
        }
        if (targetLocale === "vi" && currentPath.startsWith(mapping.en + "/")) {
            const slug = currentPath.substring(mapping.en.length);
            return mapping.vi + slug;
        }
    }

    // Fallback: return homepage of target locale
    return targetLocale === "en" ? "/en" : "/";
}

/**
 * Detect the current locale from the path.
 */
export function detectLocaleFromPath(path: string): "vi" | "en" {
    if (path.startsWith("/en/") || path === "/en") {
        return "en";
    }
    return "vi";
}
