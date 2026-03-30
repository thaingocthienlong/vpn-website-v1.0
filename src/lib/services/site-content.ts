import { unstable_cache } from "next/cache";
import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";
import { getEquivalentRoute } from "@/lib/routes";
import {
    type ServiceContentSection,
    type ServiceDetailContent,
    type ServiceIconKey,
    type ServiceProcessStep,
} from "@/lib/content/service-pages";

type SupportedLocale = Locale | "vi" | "en";

export interface SiteMenuItem {
    id: string;
    label: string;
    url: string;
    target: "_self" | "_blank";
    icon?: string | null;
    children?: SiteMenuItem[];
}

export interface SiteLayoutData {
    siteName: string;
    organizationName: string;
    logo: string;
    hotline: string;
    ctaText: string;
    ctaUrl: string;
    menuItems: SiteMenuItem[];
    footer: {
        description: string;
        contactInfo: {
            phone: string;
            email: string;
            address: string;
        };
        socialLinks: {
            facebook?: string;
            youtube?: string;
            linkedin?: string;
        };
        quickLinks: Array<{ label: string; url: string }>;
        legalLinks: Array<{ label: string; url: string }>;
        copyright: string;
    };
}

export interface ServiceSummary {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    iconName: string;
    featuredImage?: string | null;
    hasEnglishContent?: boolean;
}

export interface ServicePagePayload {
    service: ServiceDetailContent | null;
    otherServices: ServiceDetailContent[];
    toc: Array<{ key: string; title: string }>;
    summary: ServiceSummary | null;
}

function normalizeLocale(locale: SupportedLocale): "vi" | "en" {
    return locale === "en" ? "en" : "vi";
}

function nonEmptyString(value: string | null | undefined): string {
    return typeof value === "string" ? value.trim() : "";
}

function stripHtml(html: string | null | undefined): string {
    if (!html) return "";
    return html
        .replace(/<li[^>]*>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/\s+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/[ \t]{2,}/g, " ")
        .trim();
}

function excerptFromHtml(html: string | null | undefined, limit = 180): string {
    const plainText = stripHtml(html);
    if (plainText.length <= limit) return plainText;
    return `${plainText.slice(0, limit).trimEnd()}...`;
}

function isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url) || url.startsWith("//");
}

function localizeInternalUrl(url: string, locale: "vi" | "en"): string {
    if (!url || url === "#" || isExternalUrl(url)) return url;

    const [pathname, query = ""] = url.split("?");
    const cleanPath = pathname || "/";

    if (locale === "vi") {
        return query ? `${cleanPath}?${query}` : cleanPath;
    }

    if (cleanPath === "/") {
        return query ? `/en?${query}` : "/en";
    }

    const mapped = getEquivalentRoute(cleanPath, "en");
    let localizedPath = mapped;

    if (mapped === "/en" && cleanPath !== "/") {
        if (cleanPath.startsWith("/dich-vu/")) {
            localizedPath = cleanPath.replace(/^\/dich-vu/, "/en/services");
        } else if (cleanPath.startsWith("/dao-tao/")) {
            localizedPath = cleanPath.replace(/^\/dao-tao/, "/en/training");
        } else if (cleanPath.startsWith("/tin-tuc/")) {
            localizedPath = cleanPath.replace(/^\/tin-tuc/, "/en/news");
        } else if (cleanPath.startsWith("/gioi-thieu/")) {
            localizedPath = `/en${cleanPath.replace(/^\/gioi-thieu/, "/about")}`;
        } else if (!cleanPath.startsWith("/en")) {
            localizedPath = `/en${cleanPath}`;
        }
    }

    return query ? `${localizedPath}?${query}` : localizedPath;
}

function localizeText(
    locale: "vi" | "en",
    value: string | null | undefined,
    fallback?: string | null | undefined,
): string {
    if (locale === "en" && nonEmptyString(value)) {
        return value!.trim();
    }
    return nonEmptyString(fallback) || "";
}

function resolveServiceIconKey(slug: string): ServiceIconKey {
    const normalized = slug.toLowerCase();
    if (normalized.includes("nghien-cuu")) return "research";
    if (normalized.includes("cong-nghe") || normalized.includes("hop-tac")) return "transfer";
    if (normalized.includes("an-toan") || normalized.includes("kiem-dinh")) return "inspection";
    if (normalized.includes("moi-truong") || normalized.includes("quan-trac")) return "monitoring";
    if (normalized.includes("iso") || normalized.includes("tu-van")) return "iso";
    return "training";
}

function toServiceIconName(slug: string): string {
    const iconKey = resolveServiceIconKey(slug);
    switch (iconKey) {
        case "research":
            return "microscope";
        case "transfer":
            return "refresh";
        case "inspection":
            return "shield-check";
        case "monitoring":
            return "leaf";
        case "iso":
            return "file-check";
        default:
            return "graduation-cap";
    }
}

function buildGenericProcess(locale: "vi" | "en"): ServiceProcessStep[] {
    if (locale === "en") {
        return [
            { step: 1, title: "Initial Consultation", desc: "Review the request, objectives, and expected outcomes." },
            { step: 2, title: "Scope Definition", desc: "Confirm the service scope, deliverables, and implementation plan." },
            { step: 3, title: "Execution", desc: "Coordinate experts, content, and operational workstreams." },
            { step: 4, title: "Handover", desc: "Deliver outputs, recommendations, and the next-step roadmap." },
        ];
    }

    return [
        { step: 1, title: "Tiếp nhận nhu cầu", desc: "Rà soát mục tiêu, yêu cầu và bối cảnh triển khai của đơn vị." },
        { step: 2, title: "Xác định phạm vi", desc: "Thống nhất phạm vi công việc, đầu ra và kế hoạch triển khai." },
        { step: 3, title: "Tổ chức thực hiện", desc: "Phối hợp chuyên gia, nội dung và các hạng mục chuyên môn." },
        { step: 4, title: "Bàn giao và đồng hành", desc: "Bàn giao kết quả, khuyến nghị và các bước triển khai tiếp theo." },
    ];
}

const getConfigRows = unstable_cache(
    async () => {
        return prisma.configuration.findMany({
            where: {
                group: { in: ["general", "header", "footer"] },
            },
            orderBy: { key: "asc" },
        });
    },
    ["site-config-rows"],
    { revalidate: 300, tags: ["site-config"] },
);

const getMenuRows = unstable_cache(
    async () => {
        return prisma.menuItem.findMany({
            where: {
                isActive: true,
                locale: "VI",
                parentId: null,
            },
            orderBy: { sortOrder: "asc" },
            include: {
                children: {
                    where: {
                        isActive: true,
                        locale: "VI",
                    },
                    orderBy: { sortOrder: "asc" },
                },
            },
        });
    },
    ["site-menu-rows"],
    { revalidate: 300, tags: ["menu-items"] },
);

function buildConfigMap(rows: Awaited<ReturnType<typeof getConfigRows>>) {
    return rows.reduce<Record<string, string>>((accumulator, row) => {
        accumulator[row.key] = row.value;
        return accumulator;
    }, {});
}

export async function getMenuTree(locale: SupportedLocale = "vi"): Promise<SiteMenuItem[]> {
    const resolvedLocale = normalizeLocale(locale);
    const menuRows = await getMenuRows();

    return menuRows.map((item) => ({
        id: item.id,
        label: resolvedLocale === "en" ? item.label_en || item.label : item.label,
        url: localizeInternalUrl(item.url, resolvedLocale),
        target: (item.target as "_self" | "_blank") || "_self",
        icon: item.icon,
        children: item.children.map((child) => ({
            id: child.id,
            label: resolvedLocale === "en" ? child.label_en || child.label : child.label,
            url: localizeInternalUrl(child.url, resolvedLocale),
            target: (child.target as "_self" | "_blank") || "_self",
            icon: child.icon,
        })),
    }));
}

export async function getSiteLayout(locale: SupportedLocale = "vi"): Promise<SiteLayoutData> {
    const resolvedLocale = normalizeLocale(locale);
    const [configRows, menuItems] = await Promise.all([getConfigRows(), getMenuTree(resolvedLocale)]);
    const config = buildConfigMap(configRows);

    const siteName = resolvedLocale === "en"
        ? config["general.site_name_en"] || config["general.site_name"] || "Vien Phuong Nam Institute"
        : config["general.site_name"] || "Viện Phương Nam";
    const organizationName = resolvedLocale === "en"
        ? config["general.organization_name_en"] || config["general.organization_name"] || "Southern Institute for Social Resources Development"
        : config["general.organization_name"] || "Viện Phát triển nguồn lực xã hội Phương Nam";
    const logo = config["header.logo_url"]
        || config["general.logo_url"]
        || "https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png";
    const hotline = config["header.phone"] || config["general.contact_phone"] || "0912 114 511";
    const ctaText = resolvedLocale === "en"
        ? config["header.cta_text_en"] || config["header.cta_text"] || "Contact Us"
        : config["header.cta_text"] || "Liên hệ tư vấn";
    const ctaUrl = localizeInternalUrl(
        config["header.cta_url"] || config["general.header_cta_url"] || "/lien-he",
        resolvedLocale,
    );

    const quickLinks = menuItems.slice(0, 5).map((item) => ({
        label: item.label,
        url: item.url,
    }));

    const legalLinks = [
        {
            label: resolvedLocale === "en"
                ? config["footer.privacy_label_en"] || config["footer.privacy_label"] || "Privacy Policy"
                : config["footer.privacy_label"] || "Chính sách bảo mật",
            url: localizeInternalUrl(
                resolvedLocale === "en"
                    ? config["footer.privacy_url_en"] || config["footer.privacy_url"] || "/en/privacy-policy"
                    : config["footer.privacy_url"] || "/chinh-sach-bao-mat",
                resolvedLocale,
            ),
        },
        {
            label: resolvedLocale === "en"
                ? config["footer.terms_label_en"] || config["footer.terms_label"] || "Terms of Service"
                : config["footer.terms_label"] || "Điều khoản sử dụng",
            url: localizeInternalUrl(
                resolvedLocale === "en"
                    ? config["footer.terms_url_en"] || config["footer.terms_url"] || "/en/terms"
                    : config["footer.terms_url"] || "/dieu-khoan-su-dung",
                resolvedLocale,
            ),
        },
    ];

    return {
        siteName,
        organizationName,
        logo,
        hotline,
        ctaText,
        ctaUrl,
        menuItems,
        footer: {
            description: resolvedLocale === "en"
                ? config["footer.description_en"] || config["footer.description"] || organizationName
                : config["footer.description"] || organizationName,
            contactInfo: {
                phone: config["footer.phone"] || config["general.contact_phone"] || hotline,
                email: config["footer.email"] || config["general.contact_email"] || "vanphong@vienphuongnam.com.vn",
                address: config["footer.address"] || config["general.contact_address"] || "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM",
            },
            socialLinks: {
                facebook: config["footer.facebook"] || config["general.social_facebook"] || undefined,
                youtube: config["footer.youtube"] || config["general.social_youtube"] || undefined,
                linkedin: config["footer.linkedin"] || config["general.social_linkedin"] || undefined,
            },
            quickLinks,
            legalLinks,
            copyright: config["footer.copyright"]
                || `© ${new Date().getFullYear()} ${resolvedLocale === "en" ? "Vien Phuong Nam" : "Viện Phương Nam"}.`,
        },
    };
}

export async function getServiceSummaries(locale: SupportedLocale = "vi"): Promise<ServiceSummary[]> {
    const resolvedLocale = normalizeLocale(locale);
    const services = await prisma.page.findMany({
        where: {
            template: "service",
            isPublished: true,
        },
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        include: {
            featuredImage: {
                select: { url: true },
            },
        },
    });

    return services.map((service) => ({
        id: service.id,
        title: localizeText(resolvedLocale, service.title_en, service.title),
        slug: service.slug,
        excerpt: excerptFromHtml(
            resolvedLocale === "en" ? service.content_en || service.content : service.content,
        ),
        iconName: toServiceIconName(service.slug),
        featuredImage: service.featuredImage?.url || null,
        hasEnglishContent: Boolean(nonEmptyString(service.title_en) || nonEmptyString(service.content_en)),
    }));
}

function extractSectionItems(content: string): string[] {
    const listItems = Array.from(content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)).map((match) => stripHtml(match[1]));
    if (listItems.length > 0) {
        return listItems.filter(Boolean);
    }

    return stripHtml(content)
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function toTemplateSections(
    locale: "vi" | "en",
    sections: Array<{
        sectionKey: string;
        title: string;
        title_en: string | null;
        content: string;
        content_en: string | null;
    }>,
): ServiceContentSection[] {
    return sections
        .map((section) => {
            const title = localizeText(locale, section.title_en, section.title);
            const content = locale === "en" ? section.content_en || section.content : section.content;
            const items = extractSectionItems(content);

            if (items.length === 0) {
                return null;
            }

            return {
                title,
                items,
            };
        })
        .filter((section): section is ServiceContentSection => section !== null);
}

async function getServicePageBySlugRaw(slug: string) {
    return prisma.page.findFirst({
        where: {
            slug,
            template: "service",
            isPublished: true,
        },
        include: {
            featuredImage: {
                select: { url: true },
            },
        },
    });
}

export async function getServicePagePayload(
    slug: string,
    locale: SupportedLocale = "vi",
): Promise<ServicePagePayload> {
    const resolvedLocale = normalizeLocale(locale);
    const servicePage = await getServicePageBySlugRaw(slug);

    if (!servicePage) {
        return {
            service: null,
            otherServices: [],
            toc: [],
            summary: null,
        };
    }

    const [sectionRows, otherServiceRows] = await Promise.all([
        prisma.contentSection.findMany({
            where: {
                entityType: "SERVICE",
                entityId: servicePage.id,
                isActive: true,
            },
            orderBy: { sortOrder: "asc" },
        }),
        prisma.page.findMany({
            where: {
                template: "service",
                isPublished: true,
                slug: { not: slug },
            },
            orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
            take: 3,
        }),
    ]);

    const templateSections = toTemplateSections(resolvedLocale, sectionRows);
    const fallbackDescription = excerptFromHtml(
        resolvedLocale === "en" ? servicePage.content_en || servicePage.content : servicePage.content,
        240,
    );

    const toc = sectionRows.map((section) => ({
        key: section.sectionKey,
        title: localizeText(resolvedLocale, section.title_en, section.title),
    }));

    const service: ServiceDetailContent = {
        id: servicePage.id.slice(0, 8).toUpperCase(),
        slug: servicePage.slug,
        title: localizeText(resolvedLocale, servicePage.title_en, servicePage.title),
        description: fallbackDescription,
        iconKey: resolveServiceIconKey(servicePage.slug),
        sections: templateSections.length > 0
            ? templateSections
            : [
                {
                    title: resolvedLocale === "en" ? "Overview" : "Tổng quan",
                    items: [fallbackDescription],
                },
            ],
        process: buildGenericProcess(resolvedLocale),
    };

    const otherServices = otherServiceRows.map<ServiceDetailContent>((page) => ({
        id: page.id.slice(0, 8).toUpperCase(),
        slug: page.slug,
        title: localizeText(resolvedLocale, page.title_en, page.title),
        description: excerptFromHtml(
            resolvedLocale === "en" ? page.content_en || page.content : page.content,
            180,
        ),
        iconKey: resolveServiceIconKey(page.slug),
        sections: [],
        process: buildGenericProcess(resolvedLocale),
    }));

    return {
        service,
        otherServices,
        toc,
        summary: {
            id: servicePage.id,
            title: service.title,
            slug: servicePage.slug,
            excerpt: fallbackDescription,
            iconName: toServiceIconName(servicePage.slug),
            featuredImage: servicePage.featuredImage?.url || null,
        },
    };
}
