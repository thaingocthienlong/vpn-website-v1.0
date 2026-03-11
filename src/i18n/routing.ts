import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale } from './config';

export const routing = defineRouting({
    locales,
    defaultLocale,
    // VI is default — no prefix needed (vienphuongnam.edu.vn/)
    // EN uses /en/ prefix (vienphuongnam.edu.vn/en/)
    localePrefix: {
        mode: 'as-needed',
        prefixes: {
            vi: '/',
            en: '/en',
        },
    },
});
