const SUPPORTED_SECTION_ORDER = [
    "hero",
    "training",
    "services",
    "partners",
    "news",
    "gallery",
    "cta",
    "contact",
] as const;

export const CURRENT_RENDERED_KEYS = new Set([
    "hero",
    "training",
    "services",
    "partners",
    "news",
    "gallery",
    "cta",
    "contact",
]);

export const SECTION_LABELS: Record<string, string> = {
    hero: "Hero",
    training: "Training",
    services: "Services",
    partners: "Partners",
    news: "News",
    gallery: "Gallery",
    cta: "Endcap CTA",
    contact: "Endcap Contact",
    reviews: "Reviews",
    video: "Video",
};

export type AdminHomepageSectionLocaleValue = {
    id: string | null;
    title: string;
    subtitle: string;
    config: Record<string, unknown>;
};

export type AdminHomepageSectionItem = {
    sectionKey: string;
    label: string;
    rendered: boolean;
    supported: boolean;
    enabled: boolean;
    sortOrder: number;
    vi: AdminHomepageSectionLocaleValue;
    en: AdminHomepageSectionLocaleValue;
};

type HomepageRow = {
    id: string;
    sectionKey: string;
    locale: string;
    title: string | null;
    title_en: string | null;
    subtitle: string | null;
    subtitle_en: string | null;
    isEnabled: boolean;
    sortOrder: number;
    config: string | null;
};

function parseConfig(config: string | null) {
    if (!config) return {};

    try {
        const parsed = JSON.parse(config);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? parsed as Record<string, unknown>
            : {};
    } catch {
        return {};
    }
}

function serializeConfig(config: Record<string, unknown>) {
    return Object.keys(config).length > 0 ? JSON.stringify(config) : null;
}

function emptyLocaleValue(): AdminHomepageSectionLocaleValue {
    return {
        id: null,
        title: "",
        subtitle: "",
        config: {},
    };
}

function sortKey(sectionKey: string, sortOrder: number) {
    const supportedIndex = SUPPORTED_SECTION_ORDER.indexOf(sectionKey as (typeof SUPPORTED_SECTION_ORDER)[number]);
    return supportedIndex === -1 ? 1000 + sortOrder : supportedIndex;
}

export function toAdminHomepageSections(rows: HomepageRow[]): AdminHomepageSectionItem[] {
    const grouped = new Map<string, { vi?: HomepageRow; en?: HomepageRow }>();

    for (const row of rows) {
        const bucket = grouped.get(row.sectionKey) || {};
        if (row.locale === "EN") {
            bucket.en = row;
        } else {
            bucket.vi = row;
        }
        grouped.set(row.sectionKey, bucket);
    }

    return Array.from(grouped.entries())
        .map(([sectionKey, localized]): AdminHomepageSectionItem => {
            const viRow = localized.vi;
            const enRow = localized.en;
            const baseConfig = parseConfig(viRow?.config || enRow?.config || null);
            const fallbackTitleEn = viRow?.title_en || "";
            const fallbackSubtitleEn = viRow?.subtitle_en || "";

            return {
                sectionKey,
                label: SECTION_LABELS[sectionKey] || sectionKey,
                rendered: CURRENT_RENDERED_KEYS.has(sectionKey),
                supported: SUPPORTED_SECTION_ORDER.includes(sectionKey as (typeof SUPPORTED_SECTION_ORDER)[number]),
                enabled: viRow?.isEnabled ?? enRow?.isEnabled ?? true,
                sortOrder: viRow?.sortOrder ?? enRow?.sortOrder ?? 0,
                vi: {
                    id: viRow?.id || null,
                    title: viRow?.title || "",
                    subtitle: viRow?.subtitle || "",
                    config: baseConfig,
                },
                en: {
                    id: enRow?.id || null,
                    title: enRow?.title || fallbackTitleEn,
                    subtitle: enRow?.subtitle || fallbackSubtitleEn,
                    config: parseConfig(enRow?.config || viRow?.config || null),
                },
            };
        })
        .sort((left, right) => sortKey(left.sectionKey, left.sortOrder) - sortKey(right.sectionKey, right.sortOrder));
}

export type AdminHomepageSectionInput = {
    sectionKey: string;
    enabled: boolean;
    vi: {
        title: string;
        subtitle: string;
        config: Record<string, unknown>;
    };
    en: {
        title: string;
        subtitle: string;
        config?: Record<string, unknown>;
    };
};

export function toHomepageSectionUpserts(items: AdminHomepageSectionInput[]) {
    return items.map((item, index) => {
        const sharedConfig = serializeConfig(item.vi.config);
        const orderIndex = SUPPORTED_SECTION_ORDER.indexOf(item.sectionKey as (typeof SUPPORTED_SECTION_ORDER)[number]);
        const sortOrder = orderIndex === -1 ? index : orderIndex;

        return {
            vi: {
                where: {
                    sectionKey_locale: {
                        sectionKey: item.sectionKey,
                        locale: "VI",
                    },
                },
                update: {
                    title: item.vi.title || null,
                    subtitle: item.vi.subtitle || null,
                    title_en: item.en.title || null,
                    subtitle_en: item.en.subtitle || null,
                    isEnabled: item.enabled,
                    sortOrder,
                    config: sharedConfig,
                },
                create: {
                    sectionKey: item.sectionKey,
                    locale: "VI",
                    title: item.vi.title || null,
                    subtitle: item.vi.subtitle || null,
                    title_en: item.en.title || null,
                    subtitle_en: item.en.subtitle || null,
                    isEnabled: item.enabled,
                    sortOrder,
                    config: sharedConfig,
                },
            },
            en: {
                where: {
                    sectionKey_locale: {
                        sectionKey: item.sectionKey,
                        locale: "EN",
                    },
                },
                update: {
                    title: item.en.title || null,
                    subtitle: item.en.subtitle || null,
                    title_en: item.en.title || null,
                    subtitle_en: item.en.subtitle || null,
                    isEnabled: item.enabled,
                    sortOrder,
                    config: serializeConfig(item.en.config || item.vi.config),
                },
                create: {
                    sectionKey: item.sectionKey,
                    locale: "EN",
                    title: item.en.title || null,
                    subtitle: item.en.subtitle || null,
                    title_en: item.en.title || null,
                    subtitle_en: item.en.subtitle || null,
                    isEnabled: item.enabled,
                    sortOrder,
                    config: serializeConfig(item.en.config || item.vi.config),
                },
            },
        };
    });
}

export function createDefaultHomepageSections() {
    return SUPPORTED_SECTION_ORDER.map((sectionKey, index): AdminHomepageSectionItem => ({
        sectionKey,
        label: SECTION_LABELS[sectionKey] || sectionKey,
        rendered: true,
        supported: true,
        enabled: true,
        sortOrder: index,
        vi: emptyLocaleValue(),
        en: emptyLocaleValue(),
    }));
}
