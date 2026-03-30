import type { Locale } from "@/i18n/config";
import { getHomepageSections } from "@/lib/services/api-services";

export async function getHomepageSectionsForLocale(locale: Locale = "vi") {
    return getHomepageSections(locale);
}

export { getHomepageSectionsForLocale as getHomepageSections };
