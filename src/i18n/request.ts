import { getRequestConfig } from 'next-intl/server';
import { Locale, locales, defaultLocale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
    // Validate locale
    let locale = await requestLocale;
    if (!locale || !locales.includes(locale as Locale)) {
        locale = defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
    };
});
