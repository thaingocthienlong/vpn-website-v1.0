"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { detectLocaleFromPath, getEquivalentRoute } from "@/lib/routes";
import { publicMotionTokens } from "@/components/motion/PublicMotion";

export interface MenuItem {
    label: string;
    url: string;
    children?: MenuItem[];
    icon?: string | null;
    target?: "_self" | "_blank";
}

export interface NavbarProps {
    items?: MenuItem[];
    className?: string;
}

const HEADER_MENU_BLUEPRINT = {
    vi: {
        about: { label: "Giới thiệu", url: "/gioi-thieu" },
        council: { label: "Hội đồng", url: "/gioi-thieu/hoi-dong-co-van" },
        training: { label: "Đào tạo", url: "/dao-tao" },
        services: { label: "Dịch vụ", url: "/dich-vu" },
        news: { label: "Tin tức", url: "/tin-tuc" },
    },
    en: {
        about: { label: "About", url: "/en/about" },
        council: { label: "Council", url: "/en/about/advisory-board" },
        training: { label: "Training", url: "/en/training" },
        services: { label: "Services", url: "/en/services" },
        news: { label: "News", url: "/en/news" },
    },
} as const;

const baseMenuItems: MenuItem[] = [
    {
        label: "Giới thiệu",
        url: "/gioi-thieu",
        children: [
            { label: "Tầm nhìn & Sứ mệnh", url: "/gioi-thieu/tam-nhin-su-menh" },
            { label: "Cơ cấu tổ chức", url: "/gioi-thieu/co-cau-to-chuc" },
            { label: "Hội đồng cố vấn", url: "/gioi-thieu/hoi-dong-co-van" },
            { label: "Đối tác", url: "/gioi-thieu/doi-tac" },
        ],
    },
    {
        label: "Đào tạo",
        url: "/dao-tao",
        children: [
            { label: "Tuyển sinh", url: "/dao-tao?type=ADMISSION" },
            { label: "Khóa ngắn hạn", url: "/dao-tao?type=SHORT_COURSE" },
            { label: "Du học", url: "/dao-tao?type=STUDY_ABROAD" },
        ],
    },
    {
        label: "Dịch vụ",
        url: "/dich-vu",
        children: [
            { label: "Đào tạo Đại học", url: "/dich-vu/dao-tao-dai-hoc" },
            { label: "Du học Quốc tế", url: "/dich-vu/du-hoc-quoc-te" },
            { label: "Chứng chỉ Nghề", url: "/dich-vu/chung-chi-nghe" },
        ],
    },
    { label: "Tin tức", url: "/tin-tuc" },
    { label: "Hội đồng", url: "/gioi-thieu/hoi-dong-co-van" },
];

function localizeHref(path: string, locale: "vi" | "en") {
    if (locale === "vi") return path;

    const [pathname, query] = path.split("?");
    const mapped = getEquivalentRoute(pathname, "en");
    const localizedPath = mapped === "/en" && pathname !== "/" ? `/en${pathname}` : mapped;

    return query ? `${localizedPath}?${query}` : localizedPath;
}

function stripTrailingSlash(path: string) {
    if (path.length > 1 && path.endsWith("/")) {
        return path.slice(0, -1);
    }

    return path;
}

function matchesMenuUrl(candidate: string | undefined, target: string) {
    if (!candidate) return false;

    const [candidatePath] = candidate.split("?");
    const [targetPath] = target.split("?");

    return stripTrailingSlash(candidatePath) === stripTrailingSlash(targetPath);
}

function createMenuFallback(
    locale: "vi" | "en",
    key: keyof typeof HEADER_MENU_BLUEPRINT.vi,
): MenuItem {
    const blueprint = HEADER_MENU_BLUEPRINT[locale][key];

    return {
        label: blueprint.label,
        url: blueprint.url,
        target: "_self",
        children: [],
    };
}

function cloneMenuItems(items: MenuItem[]): MenuItem[] {
    return items.map((item) => ({
        ...item,
        children: item.children?.map((child) => ({ ...child })),
    }));
}

function applyHeaderBlueprint(
    items: MenuItem[],
    locale: "vi" | "en",
): MenuItem[] {
    const blueprint = HEADER_MENU_BLUEPRINT[locale];
    const clonedItems = cloneMenuItems(items);

    const aboutItem = clonedItems.find((item) => matchesMenuUrl(item.url, blueprint.about.url));
    const trainingItem = clonedItems.find((item) => matchesMenuUrl(item.url, blueprint.training.url));
    const servicesItem = clonedItems.find((item) => matchesMenuUrl(item.url, blueprint.services.url));
    const newsItem = clonedItems.find((item) => matchesMenuUrl(item.url, blueprint.news.url));
    const councilItem = clonedItems.find((item) => matchesMenuUrl(item.url, blueprint.council.url));

    const normalizedAboutItem = aboutItem
        ? {
            ...aboutItem,
            label: blueprint.about.label,
            children: aboutItem.children?.filter((child) => !matchesMenuUrl(child.url, blueprint.council.url)),
        }
        : createMenuFallback(locale, "about");

    const normalizedCouncilItem = councilItem
        ? { ...councilItem, label: blueprint.council.label, children: [] }
        : createMenuFallback(locale, "council");

    const normalizedTrainingItem = trainingItem
        ? { ...trainingItem, label: blueprint.training.label }
        : createMenuFallback(locale, "training");

    const normalizedServicesItem = servicesItem
        ? { ...servicesItem, label: blueprint.services.label }
        : createMenuFallback(locale, "services");

    const normalizedNewsItem = newsItem
        ? { ...newsItem, label: blueprint.news.label }
        : createMenuFallback(locale, "news");

    return [
        normalizedAboutItem,
        normalizedCouncilItem,
        normalizedTrainingItem,
        normalizedServicesItem,
        normalizedNewsItem,
    ];
}

export function normalizeHeaderMenuItems(items: MenuItem[]): MenuItem[] {
    return cloneMenuItems(items);
}

export function getDefaultMenuItems(locale: "vi" | "en"): MenuItem[] {
    const localizedItems = baseMenuItems.map((item) => ({
        ...item,
        url: localizeHref(item.url, locale),
        children: item.children?.map((child) => ({
            ...child,
            url: localizeHref(child.url, locale),
        })),
    }));

    return applyHeaderBlueprint(localizedItems, locale);
}

export function Navbar({ items, className }: NavbarProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const resolvedItems = React.useMemo(
        () => normalizeHeaderMenuItems(items ?? getDefaultMenuItems(locale)),
        [items, locale],
    );
    const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
    const [openItem, setOpenItem] = React.useState<string | null>(null);

    return (
        <nav
            className={cn("hidden items-center gap-1.5 overflow-visible xl:flex", className)}
            aria-label="Primary navigation"
            onMouseLeave={() => {
                setHoveredItem(null);
                setOpenItem(null);
            }}
        >
            {resolvedItems.map((item) => {
                const isActive =
                    pathname === item.url ||
                    pathname.startsWith(`${item.url}/`) ||
                    item.children?.some((child) => pathname === child.url || pathname.startsWith(`${child.url}/`));
                const hasChildren = Boolean(item.children?.length);
                const isHighlighted = hoveredItem === item.url || (!hoveredItem && isActive);
                const isOpen = openItem === item.url;

                if (hasChildren) {
                    return (
                        <div
                            key={item.url}
                            className="relative overflow-visible"
                            onMouseEnter={() => {
                                setHoveredItem(item.url);
                                setOpenItem(item.url);
                            }}
                            onFocusCapture={() => {
                                setHoveredItem(item.url);
                                setOpenItem(item.url);
                            }}
                        >
                            <Link
                                href={item.url}
                                className={cn(
                                    "relative inline-flex items-center gap-2 rounded-[0.95rem] px-3.5 py-2.5 text-[13px] font-medium transition-all duration-300",
                                    isActive ? "text-[var(--accent-strong)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                                )}
                            >
                                {isHighlighted ? (
                                    <motion.span
                                        layoutId="navbar-active-pill"
                                        className="absolute inset-0 -z-10 rounded-[0.95rem] border border-white/28 bg-[linear-gradient(180deg,rgba(252,254,255,0.22),rgba(241,247,251,0.12))] shadow-[0_14px_30px_-28px_rgba(8,20,33,0.42)]"
                                        transition={publicMotionTokens.hoverSpring}
                                    />
                                ) : null}
                                <span>{item.label}</span>
                                <CaretDown
                                    className={cn("h-4 w-4 transition-transform duration-300", isOpen && "translate-y-0.5 rotate-180")}
                                    weight="bold"
                                />
                            </Link>

                            <AnimatePresence initial={false}>
                                {isOpen ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        className="absolute left-0 top-[calc(100%+0.6rem)] z-40 w-max max-w-[min(24rem,calc(100vw-4rem))]"
                                    >
                                        <div className="public-panel min-w-[316px] overflow-hidden rounded-[1.45rem] p-2.5 shadow-[var(--shadow-sm)]">
                                            <div className="grid gap-1.5">
                                                {item.children?.map((child, index) => {
                                                    const childActive = pathname === child.url || pathname.startsWith(`${child.url}/`);

                                                    return (
                                                        <motion.div
                                                            key={child.url}
                                                            initial={{ opacity: 0, x: -12 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: -12 }}
                                                            transition={{ ...publicMotionTokens.hoverSpring, delay: index * 0.03 }}
                                                        >
                                                            <Link
                                                                href={child.url}
                                                                className={cn(
                                                                    "block rounded-[0.95rem] px-3.5 py-2.5 text-sm whitespace-nowrap transition-all duration-300",
                                                                    childActive
                                                                        ? "bg-[rgba(77,111,147,0.08)] text-[var(--accent-strong)]"
                                                                        : "text-[var(--ink-soft)] hover:bg-[rgba(77,111,147,0.06)] hover:text-[var(--ink)]"
                                                                )}
                                                            >
                                                                {child.label}
                                                            </Link>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>
                    );
                }

                return (
                    <div
                        key={item.url}
                        className="relative overflow-visible"
                        onMouseEnter={() => setHoveredItem(item.url)}
                        onFocusCapture={() => setHoveredItem(item.url)}
                    >
                        <Link
                            href={item.url}
                            className={cn(
                                "relative inline-flex rounded-[0.95rem] px-3.5 py-2.5 text-[13px] font-medium transition-all duration-300",
                                isActive ? "text-[var(--accent-strong)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                            )}
                        >
                            {isHighlighted ? (
                                <motion.span
                                    layoutId="navbar-active-pill"
                                    className="absolute inset-0 -z-10 rounded-[0.95rem] border border-white/28 bg-[linear-gradient(180deg,rgba(252,254,255,0.22),rgba(241,247,251,0.12))] shadow-[0_14px_30px_-28px_rgba(8,20,33,0.42)]"
                                    transition={publicMotionTokens.hoverSpring}
                                />
                            ) : null}
                            {item.label}
                        </Link>
                    </div>
                );
            })}
        </nav>
    );
}

Navbar.displayName = "Navbar";
