"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CaretDown, List, X } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { Container } from "./Container";
import { FloatingQuickContact } from "./FloatingQuickContact";
import { Navbar, getDefaultMenuItems, normalizeHeaderMenuItems, type MenuItem } from "./Navbar";
import { useSiteLayouts } from "@/components/providers/SiteLayoutProvider";
import { detectLocaleFromPath, getEquivalentRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { publicMotionTokens } from "@/components/motion/PublicMotion";

export interface HeaderProps {
    logo?: string;
    hotline?: string;
    quickContact?: {
        phone?: string;
        email?: string;
        contactHref?: string;
    };
    ctaText?: string;
    ctaUrl?: string;
    siteName?: string;
    menuItems?: MenuItem[];
}

interface LocaleToggleProps {
    locale: "vi" | "en";
    pathname: string;
    compact?: boolean;
    transparent?: boolean;
    className?: string;
}

function LocaleToggle({
    locale,
    pathname,
    compact = false,
    transparent = false,
    className,
}: LocaleToggleProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const navigateToLocale = React.useCallback((targetLocale: "vi" | "en") => {
        if (targetLocale === locale) {
            return;
        }

        const nextPath = getEquivalentRoute(pathname, targetLocale);
        const query = searchParams.toString();
        router.push(query ? `${nextPath}?${query}` : nextPath);
    }, [locale, pathname, router, searchParams]);

    const shellTone = transparent
        ? "border-white/16 bg-white/10"
        : "border-[rgba(16,36,56,0.06)] bg-[rgba(255,255,255,0.14)]";
    const idleTone = transparent
        ? "text-[var(--ink)] hover:bg-white/16"
        : "text-[var(--ink)] hover:bg-[rgba(16,36,56,0.06)]";

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-[1rem] border p-[3px]",
                compact ? "gap-0.5" : "gap-1",
                shellTone,
                className
            )}
            aria-label="Language switcher"
        >
            {(["vi", "en"] as const).map((targetLocale) => {
                const isActive = targetLocale === locale;

                return (
                    <button
                        key={targetLocale}
                        type="button"
                        onClick={() => navigateToLocale(targetLocale)}
                        aria-pressed={isActive}
                        className={cn(
                            "rounded-[0.8rem] font-semibold uppercase tracking-[0.14em] transition-colors",
                            compact ? "px-2.5 py-2 text-[10px]" : "px-3 py-2 text-[10px]",
                            isActive
                                ? "bg-[var(--accent-strong)] text-white"
                                : idleTone
                        )}
                    >
                        {targetLocale}
                    </button>
                );
            })}
        </div>
    );
}

export function Header({
    logo,
    hotline,
    quickContact,
    ctaText,
    ctaUrl,
    siteName,
    menuItems,
}: HeaderProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const siteLayouts = useSiteLayouts();
    const sharedLayout = siteLayouts?.[locale];
    const resolvedLogo = logo
        ?? sharedLayout?.logo
        ?? "https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png";
    const resolvedSiteName = siteName ?? sharedLayout?.siteName ?? "Viện Phương Nam";
    const resolvedCtaText = ctaText ?? sharedLayout?.ctaText ?? (locale === "en" ? "Contact Us" : "Liên hệ tư vấn");
    const items = React.useMemo(
        () => normalizeHeaderMenuItems(menuItems ?? sharedLayout?.menuItems ?? getDefaultMenuItems(locale)),
        [locale, menuItems, sharedLayout],
    );
    const [isOpen, setIsOpen] = React.useState(false);
    const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
    const headerRef = React.useRef<HTMLElement | null>(null);
    const shellRef = React.useRef<HTMLDivElement | null>(null);
    const resolvedCtaUrl = ctaUrl ?? sharedLayout?.ctaUrl ?? (locale === "en" ? "/en/contact" : "/lien-he");
    const homeUrl = locale === "en" ? "/en" : "/";
    const displaySiteName = resolvedSiteName === "Viện Phương Nam"
        ? "Viện phát triển nguồn lực xã hội Phương Nam"
        : resolvedSiteName;
    const resolvedHotline = hotline?.trim()
        || sharedLayout?.hotline?.trim()
        || (locale === "en" ? "+84 912 114 511" : "0912 114 511");
    const resolvedQuickContact = {
        phone: quickContact?.phone?.trim() || sharedLayout?.footer.contactInfo.phone || resolvedHotline,
        email: quickContact?.email?.trim() || sharedLayout?.footer.contactInfo.email || "vanphong@vienphuongnam.com.vn",
        contactHref: quickContact?.contactHref?.trim() || sharedLayout?.ctaUrl || resolvedCtaUrl,
    };
    const textTone = "text-[var(--ink)]";

    React.useEffect(() => {
        setIsOpen(false);
        setExpandedItem(null);
    }, [pathname]);

    React.useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const updateHeaderOffset = () => {
            const header = headerRef.current;
            const shell = shellRef.current;
            if (!header && !shell) {
                return;
            }

            const occupiedHeight = Math.ceil(Math.max(
                header?.getBoundingClientRect().bottom ?? 0,
                shell?.getBoundingClientRect().bottom ?? 0
            ));
            document.documentElement.style.setProperty("--public-header-height", `${occupiedHeight}px`);
        };

        updateHeaderOffset();

        const header = headerRef.current;
        const shell = shellRef.current;
        const resizeObserver = typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(() => updateHeaderOffset())
            : null;

        if (header && resizeObserver) {
            resizeObserver.observe(header);
        }

        if (shell && resizeObserver) {
            resizeObserver.observe(shell);
        }

        window.addEventListener("resize", updateHeaderOffset, { passive: true });

        return () => {
            resizeObserver?.disconnect();
            window.removeEventListener("resize", updateHeaderOffset);
        };
    }, [locale, pathname]);

    return (
        <header ref={headerRef} className="fixed inset-x-0 top-0 z-40">
            <Container className="pt-4 transition-[padding] duration-300 md:pt-5">
                <motion.div
                    ref={shellRef}
                    initial={{ opacity: 0, y: -28, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={publicMotionTokens.sectionSpring}
                    className={cn(
                        "public-island-nav relative grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 transition-all duration-300 md:gap-5 md:px-5 md:py-3.5"
                    )}
                >
                    <Link href={homeUrl} className="relative z-[1] flex min-w-0 items-center" title={displaySiteName}>
                        <div className="relative flex min-w-0 items-center gap-3 px-1.5 py-1 md:gap-3.5">
                            <div className="relative flex h-[42px] w-auto max-w-[112px] shrink-0 items-center md:h-[54px] md:max-w-[138px] lg:max-w-[146px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={resolvedLogo}
                                    alt={displaySiteName}
                                    className="!h-full !w-auto !max-w-full object-contain object-left object-center"
                                />
                            </div>
                            <div className="hidden min-w-0 xl:block">
                                <p className={cn("mt-1 truncate text-sm font-medium", textTone)}>
                                    {displaySiteName}
                                </p>
                            </div>
                        </div>
                    </Link>

                    <div className="relative z-[1] flex min-w-0 items-center justify-center gap-3">
                        <Navbar
                            items={items}
                            className="min-w-0 justify-center px-1 py-1"
                        />
                    </div>

                    <div className="relative z-[1] flex items-center justify-end gap-2 md:gap-3">
                        <LocaleToggle
                            locale={locale}
                            pathname={pathname}
                            className="hidden xl:inline-flex"
                        />

                        <div className="hidden xl:block">
                            <Button
                                asChild
                                variant="primary"
                                size="md"
                                motion="magnetic"
                                className="min-w-[158px] rounded-[1.02rem] border-[rgba(77,111,147,0.16)] bg-[linear-gradient(135deg,#132c47,#244666_62%,#56718b)] text-white shadow-[0_18px_34px_-28px_rgba(8,20,33,0.36)] hover:bg-[linear-gradient(135deg,#10263d,#1f3f5c_62%,#4c657f)]"
                            >
                                <Link href={resolvedCtaUrl} className="inline-flex items-center gap-3 whitespace-nowrap text-white">
                                    <span>{resolvedCtaText}</span>
                                    <span
                                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/14 text-white"
                                    >
                                        <ArrowUpRight className="h-4 w-4" weight="bold" />
                                    </span>
                                </Link>
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 xl:hidden">
                            <LocaleToggle
                                locale={locale}
                                pathname={pathname}
                                compact
                            />

                            <button
                                type="button"
                                onClick={() => setIsOpen((value) => !value)}
                                className="inline-flex rounded-[0.92rem] bg-[rgba(255,255,255,0.16)] p-2 text-[var(--ink)] ring-1 ring-[rgba(255,255,255,0.16)] transition-colors hover:bg-[rgba(255,255,255,0.22)]"
                                aria-label={isOpen ? "Close navigation" : "Open navigation"}
                            >
                                {isOpen ? <X className="h-5 w-5" weight="bold" /> : <List className="h-5 w-5" weight="bold" />}
                            </button>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={publicMotionTokens.hoverSpring}
                            className="mt-3 overflow-hidden rounded-[1.4rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(250,252,254,0.9)] px-3.5 py-3.5 text-[var(--ink)] shadow-[0_26px_44px_-34px_rgba(8,20,33,0.34)] backdrop-blur-[16px] xl:hidden"
                        >
                            <motion.nav
                                className="space-y-2"
                                aria-label="Mobile navigation"
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                variants={{
                                    hidden: {},
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.06,
                                        },
                                    },
                                }}
                            >
                                {items.map((item) => {
                                    const hasChildren = Boolean(item.children?.length);
                                    const isExpanded = expandedItem === item.url;

                                    if (!hasChildren) {
                                        return (
                                            <motion.div
                                                key={item.url}
                                                variants={{
                                                    hidden: { opacity: 0, x: -12 },
                                                    visible: { opacity: 1, x: 0 },
                                                }}
                                            >
                                                <Link
                                                    href={item.url}
                                                    className="block rounded-[0.95rem] px-4 py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[rgba(16,36,56,0.05)]"
                                                >
                                                    {item.label}
                                                </Link>
                                            </motion.div>
                                        );
                                    }

                                    return (
                                        <motion.div
                                            key={item.url}
                                            variants={{
                                                hidden: { opacity: 0, x: -12 },
                                                visible: { opacity: 1, x: 0 },
                                            }}
                                            className="overflow-hidden rounded-[1rem] bg-[rgba(16,36,56,0.03)] ring-1 ring-[rgba(16,36,56,0.08)]"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedItem((value) => (value === item.url ? null : item.url))
                                                }
                                                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[var(--ink)]"
                                            >
                                                <span>{item.label}</span>
                                                <CaretDown
                                                    className={cn("h-4 w-4 transition-transform duration-300", isExpanded && "rotate-180")}
                                                    weight="bold"
                                                />
                                            </button>
                                            <AnimatePresence initial={false}>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={publicMotionTokens.hoverSpring}
                                                        className="overflow-hidden border-t border-[rgba(16,36,56,0.08)]"
                                                    >
                                                        <div className="space-y-1 px-2 py-2">
                                                            {item.children?.map((child) => (
                                                                <Link
                                                                    key={child.url}
                                                                    href={child.url}
                                                                    className="block rounded-[0.9rem] px-3 py-2.5 text-sm text-[var(--ink-soft)] transition-colors hover:bg-[rgba(16,36,56,0.05)] hover:text-[var(--ink)]"
                                                                >
                                                                    {child.label}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                            </motion.nav>

                            <div className="mt-4">
                                <Button
                                    asChild
                                    variant="primary"
                                    size="md"
                                    motion="magnetic"
                                    className="w-full border-transparent bg-[linear-gradient(135deg,#132c47,#244666_62%,#56718b)] text-white shadow-[0_18px_34px_-28px_rgba(8,20,33,0.36)] hover:bg-[linear-gradient(135deg,#10263d,#1f3f5c_62%,#4c657f)]"
                                >
                                    <Link href={resolvedCtaUrl} className="inline-flex items-center justify-center gap-3 text-white">
                                        <span>{resolvedCtaText}</span>
                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/14">
                                            <ArrowUpRight className="h-4 w-4" weight="bold" />
                                        </span>
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
            <FloatingQuickContact
                locale={locale}
                phone={resolvedQuickContact.phone}
                email={resolvedQuickContact.email}
                contactHref={resolvedQuickContact.contactHref}
            />
        </header>
    );
}

Header.displayName = "Header";
