import { HomepageSectionsRenderer } from "@/components/sections/HomepageSectionsRenderer";
import { fetchDataForSections, getHomepageSections } from "@/lib/services/api-services";
import { getSiteLayout } from "@/lib/services/site-content";

async function getHomepageViewModel() {
    const locale = "vi" as const;
    const [layout, sections] = await Promise.all([
        getSiteLayout(locale),
        getHomepageSections(locale),
    ]);
    const content = await fetchDataForSections(locale, sections);

    return {
        locale,
        layout,
        sections,
        ...content,
    };
}

export default async function HomePage() {
    const viewModel = await getHomepageViewModel();

    return <HomepageSectionsRenderer {...viewModel} />;
}
