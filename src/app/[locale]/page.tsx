import { setRequestLocale } from "next-intl/server";
import { HomepageSectionsRenderer } from "@/components/sections/HomepageSectionsRenderer";
import { fetchDataForSections, getHomepageSections } from "@/lib/services/api-services";
import { getSiteLayout } from "@/lib/services/site-content";

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    const [layout, sections] = await Promise.all([
        getSiteLayout(resolvedLocale),
        getHomepageSections(resolvedLocale),
    ]);
    const content = await fetchDataForSections(resolvedLocale, sections);

    return (
        <HomepageSectionsRenderer
            locale={resolvedLocale}
            layout={layout}
            sections={sections}
            {...content}
        />
    );
}
