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
    icon?: React.ReactNode;
    target?: "_self" | "_blank";
}

export interface NavbarProps {
    items?: MenuItem[];
    className?: string;
}

const baseMenuItems: MenuItem[] = [
    {
        label: "Giới thiệu",
        url: "/gioi-thieu",
        children: [
            { label: "Tầm nhìn & Sứ mệnh", url: "/gioi-thieu/tam-nhin-su-menh" },
            { label: "Cơ cấu tổ chức", url: "/gioi-thieu/co-cau-to-chuc" },
            { label: "Hội đồng cố vấn", url: "/gioi-thieu/hoi-dong-co-van-khoa-hoc" },
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
    { label: "Liên hệ", url: "/lien-he" },
];

function localizeHref(path: string, locale: "vi" | "en") {
    if (locale === "vi") return path;

    const [pathname, query] = path.split("?");
    const mapped = getEquivalentRoute(pathname, "en");
    const localizedPath = mapped === "/en" && pathname !== "/" ? `/en${pathname}` : mapped;

    return query ? `${localizedPath}?${query}` : localizedPath;
}

export function getDefaultMenuItems(locale: "vi" | "en"): MenuItem[] {
    return baseMenuItems.map((item) => ({
        ...item,
        url: localizeHref(item.url, locale),
        children: item.children?.map((child) => ({
            ...child,
            url: localizeHref(child.url, locale),
        })),
    }));
}

export function Navbar({ items, className }: NavbarProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const resolvedItems = items ?? getDefaultMenuItems(locale);
    const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
    const [openItem, setOpenItem] = React.useState<string | null>(null);

    return (
        <nav
            className={cn("hidden items-center gap-1 xl:flex", className)}
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
                            className="relative"
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
                                    "relative inline-flex items-center gap-2 rounded-[1rem] px-4 py-3 text-sm font-medium transition-all duration-300",
                                    isActive ? "text-[var(--accent-strong)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                                )}
                            >
                                {isHighlighted ? (
                                    <motion.span
                                        layoutId="navbar-active-pill"
                                        className="absolute inset-0 -z-10 rounded-[1rem] bg-[rgba(23,88,216,0.12)]"
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
                                        className="absolute left-0 top-full z-30 pt-4"
                                    >
                                        <div className="public-panel min-w-[300px] overflow-hidden rounded-[1.6rem] p-3">
                                            <div className="grid gap-1">
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
                                                                    "block rounded-[1.15rem] px-4 py-3 text-sm transition-all duration-300",
                                                                    childActive
                                                                        ? "bg-[rgba(23,88,216,0.1)] text-[var(--accent-strong)]"
                                                                        : "text-[var(--ink-soft)] hover:bg-[rgba(23,88,216,0.06)] hover:text-[var(--ink)]"
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
                        className="relative"
                        onMouseEnter={() => setHoveredItem(item.url)}
                        onFocusCapture={() => setHoveredItem(item.url)}
                    >
                        <Link
                            href={item.url}
                            className={cn(
                                "relative inline-flex rounded-[1rem] px-4 py-3 text-sm font-medium transition-all duration-300",
                                isActive ? "text-[var(--accent-strong)]" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                            )}
                        >
                            {isHighlighted ? (
                                <motion.span
                                    layoutId="navbar-active-pill"
                                    className="absolute inset-0 -z-10 rounded-[1rem] bg-[rgba(23,88,216,0.12)]"
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
