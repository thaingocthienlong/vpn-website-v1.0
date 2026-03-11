// i18n configuration for SISRD multi-language support
// Ref: FEATURES_SPEC §6 (ML-01) — Locales: vi (default), en

export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';

// Public route mapping between locales
// Vietnamese routes → English routes
export const routeMapping: Record<string, Record<Locale, string>> = {
    '/': { vi: '/', en: '/en' },
    '/gioi-thieu': { vi: '/gioi-thieu', en: '/en/about' },
    '/gioi-thieu/tam-nhin-su-menh': { vi: '/gioi-thieu/tam-nhin-su-menh', en: '/en/about/vision-mission' },
    '/gioi-thieu/co-cau-to-chuc': { vi: '/gioi-thieu/co-cau-to-chuc', en: '/en/about/structure' },
    '/gioi-thieu/hoi-dong-co-van': { vi: '/gioi-thieu/hoi-dong-co-van', en: '/en/about/advisory-board' },
    '/gioi-thieu/doi-tac': { vi: '/gioi-thieu/doi-tac', en: '/en/about/partners' },
    '/dao-tao': { vi: '/dao-tao', en: '/en/training' },
    '/tin-tuc': { vi: '/tin-tuc', en: '/en/news' },
    '/dich-vu': { vi: '/dich-vu', en: '/en/services' },
    '/lien-he': { vi: '/lien-he', en: '/en/contact' },
};

// Get the equivalent route in another locale
export function getLocalizedRoute(currentPath: string, targetLocale: Locale): string {
    // If switching to EN from a VI path
    if (targetLocale === 'en') {
        // Check exact match first
        for (const [viPath, routes] of Object.entries(routeMapping)) {
            if (currentPath === viPath || currentPath === routes.vi) {
                return routes.en;
            }
        }
        // For dynamic routes (e.g., /dao-tao/[slug]), prefix with /en and translate base
        if (currentPath.startsWith('/dao-tao/')) {
            return '/en/training/' + currentPath.slice('/dao-tao/'.length);
        }
        if (currentPath.startsWith('/tin-tuc/')) {
            return '/en/news/' + currentPath.slice('/tin-tuc/'.length);
        }
        if (currentPath.startsWith('/dich-vu/')) {
            return '/en/services/' + currentPath.slice('/dich-vu/'.length);
        }
        if (currentPath.startsWith('/gioi-thieu/')) {
            return '/en/about/' + currentPath.slice('/gioi-thieu/'.length);
        }
        // Default: just prefix /en
        return '/en' + currentPath;
    }

    // If switching to VI from an EN path
    if (targetLocale === 'vi') {
        // Check exact match first
        for (const [, routes] of Object.entries(routeMapping)) {
            if (currentPath === routes.en) {
                return routes.vi;
            }
        }
        // For dynamic EN routes, translate back
        if (currentPath.startsWith('/en/training/')) {
            return '/dao-tao/' + currentPath.slice('/en/training/'.length);
        }
        if (currentPath.startsWith('/en/news/')) {
            return '/tin-tuc/' + currentPath.slice('/en/news/'.length);
        }
        if (currentPath.startsWith('/en/services/')) {
            return '/dich-vu/' + currentPath.slice('/en/services/'.length);
        }
        if (currentPath.startsWith('/en/about/')) {
            return '/gioi-thieu/' + currentPath.slice('/en/about/'.length);
        }
        // Strip /en prefix
        return currentPath.replace(/^\/en/, '') || '/';
    }

    return currentPath;
}

// Detect locale from pathname
export function getLocaleFromPathname(pathname: string): Locale {
    if (pathname.startsWith('/en/') || pathname === '/en') {
        return 'en';
    }
    return 'vi';
}
