import { Header, Footer } from "@/components/layout";
import { GallerySection } from "@/components/sections/GallerySection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HomepageEndcapSection } from "@/components/sections/HomepageEndcapSection";
import { NewsSection } from "@/components/sections/NewsSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { TrainingSection } from "@/components/sections/TrainingSection";
import type { HomepageSectionView } from "@/lib/services/api-services";
import type { SiteLayoutData } from "@/lib/services/site-content";

type HomepageSectionsData = Awaited<
    ReturnType<typeof import("@/lib/services/api-services").fetchDataForSections>
>;

interface HomepageSectionsRendererProps {
    locale: "vi" | "en";
    layout: SiteLayoutData;
    sections: HomepageSectionView[];
    posts: HomepageSectionsData["posts"];
    courses: HomepageSectionsData["courses"];
    partners: HomepageSectionsData["partners"];
    services: HomepageSectionsData["services"];
    reviews: HomepageSectionsData["reviews"];
}

const SECTION_ORDER = [
    "hero",
    "training",
    "services",
    "partners",
    "news",
    "gallery",
] as const;

type TranslationAwarePreview = {
    hasEnglishContent?: boolean;
};

function getString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getObject(value: unknown): Record<string, unknown> | undefined {
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function isPlaceholderText(value: string | undefined) {
    if (!value) return true;

    const normalized = value.trim().toLowerCase();
    if (!normalized) return true;

    return (
        normalized.includes("lorem ipsum") ||
        normalized.includes("placeholder") ||
        normalized.includes("coming soon") ||
        normalized.includes("sample testimonial") ||
        /^video\s*\d+$/i.test(normalized)
    );
}

function getGalleryImages(config: Record<string, unknown>) {
    const rawImages = Array.isArray(config.images) ? config.images : [];
    return rawImages
        .map((image, index) => {
            const record = getObject(image);
            if (!record) return null;

            const url = getString(record.url);
            if (!url) return null;

            return {
                id: getString(record.id) || `gallery-${index + 1}`,
                url,
                alt: getString(record.alt) || `Gallery image ${index + 1}`,
            };
        })
        .filter((image): image is NonNullable<typeof image> => Boolean(image));
}

function filterLocalizedPreviews<T extends TranslationAwarePreview>(
    items: T[],
    locale: HomepageSectionsRendererProps["locale"],
) {
    return locale === "en"
        ? items.filter((item) => item.hasEnglishContent)
        : items;
}

function resolveSectionTitle(section: HomepageSectionView | undefined, locale: HomepageSectionsRendererProps["locale"]) {
    if (!section?.title) return undefined;
    if (locale === "en" && !section.hasEnglishTitle) return undefined;
    return section.title;
}

function resolveSectionSubtitle(section: HomepageSectionView | undefined, locale: HomepageSectionsRendererProps["locale"]) {
    if (!section?.subtitle) return undefined;
    if (locale === "en" && !section.hasEnglishSubtitle) return undefined;
    return section.subtitle;
}

function resolveAction(
    locale: HomepageSectionsRendererProps["locale"],
    value: unknown,
    fallbackText: string,
    fallbackHref: string,
) {
    if (locale === "en") {
        return undefined;
    }

    const record = getObject(value);
    if (!record) return undefined;

    return {
        text: getString(record.text) || fallbackText,
        href: getString(record.href) || fallbackHref,
    };
}

function isRenderableSection(
    section: HomepageSectionView,
    data: {
        locale: HomepageSectionsRendererProps["locale"];
        posts: HomepageSectionsData["posts"];
        courses: HomepageSectionsData["courses"];
        partners: HomepageSectionsData["partners"];
        services: HomepageSectionsData["services"];
        galleryImages: Array<{ id: string; url: string; alt: string }>;
    },
) {
    switch (section.sectionKey) {
        case "hero":
            return true;
        case "training":
            return data.courses.length > 0;
        case "services":
            return data.services.length > 0;
        case "partners":
            return data.partners.length > 0;
        case "news":
            return data.posts.length > 0;
        case "gallery":
            return data.galleryImages.length > 0;
        default:
            return false;
    }
}

export function HomepageSectionsRenderer({
    locale,
    layout,
    sections,
    posts,
    courses,
    partners,
    services,
}: HomepageSectionsRendererProps) {
    const sectionsByKey = new Map(sections.map((section) => [section.sectionKey, section]));
    const gallerySection = sectionsByKey.get("gallery");
    const galleryImages = getGalleryImages(getObject(gallerySection?.config) || {});
    const localizedPosts = filterLocalizedPreviews(posts, locale);
    const localizedCourses = filterLocalizedPreviews(courses, locale);
    const localizedServices = filterLocalizedPreviews(services, locale);
    const orderedSections = SECTION_ORDER
        .map((sectionKey) => sectionsByKey.get(sectionKey))
        .filter((section): section is HomepageSectionView => Boolean(section))
        .filter((section) =>
            isRenderableSection(section, {
                locale,
                posts: localizedPosts,
                courses: localizedCourses,
                partners,
                services: localizedServices,
                galleryImages,
            })
        );

    const heroSection = sectionsByKey.get("hero");
    const heroConfig = getObject(heroSection?.config) || {};
    const heroFeaturedMedia = getObject(heroConfig.featuredVideo);
    const heroFeaturedMediaHref = getString(heroFeaturedMedia?.href);
    const heroMedia = heroFeaturedMedia || galleryImages[0]
        ? {
              eyebrow: locale === "vi" ? getString(heroFeaturedMedia?.eyebrow) : undefined,
              title: locale === "vi" && !isPlaceholderText(getString(heroFeaturedMedia?.title))
                  ? getString(heroFeaturedMedia?.title)
                  : undefined,
              description: locale === "vi" ? getString(heroFeaturedMedia?.description) : undefined,
              thumbnailUrl: getString(heroFeaturedMedia?.thumbnailUrl) || galleryImages[0]?.url,
              href: heroFeaturedMediaHref && !heroFeaturedMediaHref.includes("#video")
                  ? heroFeaturedMediaHref
                  : undefined,
          }
        : undefined;

    const ctaSection = sectionsByKey.get("cta");
    const contactSection = sectionsByKey.get("contact");
    const ctaConfig = getObject(ctaSection?.config) || {};
    const contactConfig = getObject(contactSection?.config) || {};
    const shouldRenderEndcap = Boolean(ctaSection || contactSection);
    const primaryEndcapCTA = resolveAction(locale, ctaConfig.primaryCTA, layout.ctaText, layout.ctaUrl);
    const secondaryEndcapCTA = resolveAction(
        locale,
        ctaConfig.secondaryCTA,
        layout.footer.quickLinks[0]?.label || layout.ctaText,
        layout.footer.quickLinks[0]?.url || layout.ctaUrl,
    );

    return (
        <div className="public-shell min-h-screen flex flex-col">
            <Header
                mode="homepage-editorial"
                logo={layout.logo}
                siteName={layout.siteName}
                hotline={layout.hotline}
                quickContact={{
                    phone: layout.footer.contactInfo.phone,
                    email: layout.footer.contactInfo.email,
                    contactHref: layout.ctaUrl,
                }}
                ctaText={layout.ctaText}
                ctaUrl={layout.ctaUrl}
                menuItems={layout.menuItems}
            />
            <main id="main-content" className="flex-1">
                {orderedSections.map((section) => {
                    switch (section.sectionKey) {
                        case "hero":
                            return (
                                <HeroSection
                                    key={section.id}
                                    title={resolveSectionTitle(section, locale) || (locale === "vi" ? layout.organizationName : undefined)}
                                    subtitle={resolveSectionSubtitle(section, locale) || (locale === "vi" ? layout.footer.description : undefined)}
                                    featuredPrograms={localizedCourses.slice(0, 3)}
                                    ctaPrimary={resolveAction(locale, heroConfig.ctaPrimary, layout.ctaText, layout.ctaUrl)}
                                    ctaSecondary={resolveAction(
                                        locale,
                                        heroConfig.ctaSecondary,
                                        layout.footer.quickLinks[0]?.label || layout.ctaText,
                                        layout.footer.quickLinks[0]?.url || layout.ctaUrl,
                                    )}
                                    featuredMedia={heroMedia}
                                />
                            );
                        case "training":
                            return (
                                <TrainingSection
                                    key={section.id}
                                    courses={localizedCourses as never[]}
                                    title={resolveSectionTitle(section, locale)}
                                    subtitle={resolveSectionSubtitle(section, locale)}
                                />
                            );
                        case "services":
                            return (
                                <ServicesSection
                                    key={section.id}
                                    services={localizedServices as never[]}
                                    title={resolveSectionTitle(section, locale)}
                                    subtitle={resolveSectionSubtitle(section, locale)}
                                />
                            );
                        case "partners":
                            return (
                                <PartnersSection
                                    key={section.id}
                                    partners={partners as never[]}
                                    title={resolveSectionTitle(section, locale)}
                                    subtitle={resolveSectionSubtitle(section, locale)}
                                />
                            );
                        case "news":
                            return (
                                <NewsSection
                                    key={section.id}
                                    posts={localizedPosts as never[]}
                                    title={resolveSectionTitle(section, locale)}
                                    subtitle={resolveSectionSubtitle(section, locale)}
                                />
                            );
                        case "gallery":
                            return (
                                <GallerySection
                                    key={section.id}
                                    images={galleryImages}
                                    title={resolveSectionTitle(section, locale)}
                                    subtitle={resolveSectionSubtitle(section, locale)}
                                />
                            );
                        default:
                            return null;
                    }
                })}
                {shouldRenderEndcap ? (
                    <HomepageEndcapSection
                        title={resolveSectionTitle(ctaSection, locale) || resolveSectionTitle(contactSection, locale)}
                        subtitle={resolveSectionSubtitle(ctaSection, locale) || resolveSectionSubtitle(contactSection, locale)}
                        primaryCTA={primaryEndcapCTA}
                        secondaryCTA={secondaryEndcapCTA}
                        address={getString(contactConfig.address) || layout.footer.contactInfo.address}
                        phone={getString(contactConfig.phone) || getString(ctaConfig.phone) || layout.footer.contactInfo.phone}
                        email={getString(contactConfig.email) || getString(ctaConfig.email) || layout.footer.contactInfo.email}
                        hours={locale === "en" ? undefined : getString(contactConfig.hours)}
                    />
                ) : null}
            </main>
            <Footer
                description={layout.footer.description}
                contactInfo={layout.footer.contactInfo}
                socialLinks={layout.footer.socialLinks}
                quickLinks={layout.footer.quickLinks}
                legalLinks={layout.footer.legalLinks}
                copyright={layout.footer.copyright}
            />
        </div>
    );
}
