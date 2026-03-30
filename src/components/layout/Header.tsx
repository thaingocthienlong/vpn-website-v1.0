"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, CaretDown, List, PhoneCall, X } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { Container } from "./Container";
import { Navbar, getDefaultMenuItems, type MenuItem } from "./Navbar";
import { detectLocaleFromPath, getEquivalentRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { FloatingAccent, publicMotionTokens } from "@/components/motion/PublicMotion";

export interface HeaderProps {
    logo?: string;
    hotline?: string;
    ctaText?: string;
    ctaUrl?: string;
    siteName?: string;
    menuItems?: MenuItem[];
    mode?: "default" | "homepage-editorial";
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
        ? "border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.14)]"
        : "border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.3)]";
    const idleTone = transparent
        ? "text-[var(--ink)] hover:bg-[rgba(248,251,253,0.34)]"
        : "text-[var(--ink)] hover:bg-[rgba(248,251,253,0.5)]";

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-[0.98rem] border p-1 shadow-[0_14px_30px_-28px_rgba(8,20,33,0.22)]",
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
                            "rounded-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-colors",
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
    logo = "https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png",
    hotline,
    ctaText = "Liên hệ ngay",
    ctaUrl,
    siteName = "Viện Phương Nam",
    menuItems,
    mode = "default",
}: HeaderProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const items = React.useMemo(() => menuItems ?? getDefaultMenuItems(locale), [locale, menuItems]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
    const [isScrolled, setIsScrolled] = React.useState(mode !== "homepage-editorial");
    const resolvedCtaUrl = ctaUrl ?? (locale === "en" ? "/en/contact" : "/lien-he");
    const homeUrl = locale === "en" ? "/en" : "/";
    const caption = locale === "en" ? "Social Resource Institute" : "Viện phát triển nguồn lực xã hội";
    const resolvedHotline = hotline?.trim() || (locale === "en" ? "+84 912 114 511" : "0912 114 511");
    const hotlineHref = `tel:${resolvedHotline.replace(/[^+\d]/g, "")}`;
    const quickDescriptor = locale === "en" ? "Public interest training and applied services" : "Đào tạo, nghiên cứu và dịch vụ vì cộng đồng";
    const isEditorialMode = mode === "homepage-editorial";
    const showFramedShell = !isEditorialMode || isScrolled;
    const textTone = "text-[var(--ink)]";
    const softTextTone = "text-[var(--ink-soft)]";
    const mutedTextTone = "text-[var(--ink-muted)]";

    React.useEffect(() => {
        setIsOpen(false);
        setExpandedItem(null);
    }, [pathname]);

    React.useEffect(() => {
        if (!isEditorialMode) {
            setIsScrolled(true);
            return;
        }

        const updateScrollState = () => {
            setIsScrolled(window.scrollY > 36);
        };

        updateScrollState();
        window.addEventListener("scroll", updateScrollState, { passive: true });
        return () => window.removeEventListener("scroll", updateScrollState);
    }, [isEditorialMode]);

    return (
        <header className="fixed inset-x-0 top-0 z-40">
            <Container className={cn("transition-[padding] duration-300", isEditorialMode ? "pt-3 md:pt-4" : "pt-4 md:pt-5")}>
                <motion.div
                    initial={{ opacity: 0, y: -28, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={publicMotionTokens.sectionSpring}
                    className={cn(
                        "relative grid grid-cols-[auto_1fr_auto] items-center gap-2.5 transition-all duration-300 md:gap-4",
                        isEditorialMode
                            ? "public-island-nav px-2.5 py-2 md:px-4 md:py-3"
                            : "public-island-nav px-4 py-3 md:px-5 md:py-3.5",
                        isEditorialMode && !isScrolled && "!border-[rgba(16,36,56,0.12)] !bg-[linear-gradient(180deg,rgba(248,251,253,0.74),rgba(236,243,248,0.54))] !backdrop-blur-xl !shadow-[0_18px_36px_-30px_rgba(8,20,33,0.2)]",
                        isEditorialMode && isScrolled && "!border-[rgba(16,36,56,0.08)] !bg-[linear-gradient(180deg,rgba(248,251,253,0.5),rgba(236,243,248,0.34))]"
                    )}
                >
                    <div className="pointer-events-none absolute inset-px overflow-hidden rounded-[calc(2.25rem-1px)]">
                        <FloatingAccent className="right-8 top-0 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(94,130,166,0.12),transparent_72%)]" variant="halo" />
                    </div>

                    <Link href={homeUrl} className="relative z-[1] flex min-w-0 items-center" title={siteName}>
                        <div
                            className={cn(
                                "relative flex min-w-0 items-center gap-2 px-1.5 py-1 transition-all duration-300 md:gap-3 md:px-3 md:py-1.5",
                                showFramedShell
                                    ? "rounded-[1.15rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.42)]"
                                    : "rounded-[1.15rem] border border-transparent bg-transparent"
                            )}
                        >
                            <div className="relative flex h-[42px] w-[118px] shrink-0 items-center md:h-[58px] md:w-[160px]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={logo}
                                    alt={siteName}
                                    className="!h-full !w-full object-contain object-left object-center"
                                />
                            </div>
                            <div className="hidden min-w-0 xl:block">
                                <p className={cn("editorial-caption", mutedTextTone)}>
                                    {caption}
                                </p>
                                <p className={cn("mt-1 truncate text-sm font-medium", textTone)}>
                                    {siteName}
                                </p>
                                <p className={cn("mt-1 max-w-[20rem] truncate text-xs", softTextTone)}>
                                    {quickDescriptor}
                                </p>
                            </div>
                        </div>
                    </Link>

                    <div className="relative z-[1] flex min-w-0 items-center justify-center gap-3">
                        <Navbar
                            items={items}
                            className={cn(
                                "min-w-0 justify-center rounded-[1.1rem] px-2 py-1 transition-all duration-300",
                                showFramedShell
                                    ? "border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.32)]"
                                    : "border border-transparent bg-transparent"
                            )}
                        />
                    </div>

                    <div className="relative z-[1] flex items-center justify-end gap-2 md:gap-3">
                        <a
                            href={hotlineHref}
                            className={cn(
                                "hidden min-h-[44px] items-center gap-2 rounded-[1.02rem] px-3 py-2 transition-colors 2xl:flex",
                                showFramedShell
                                    ? "border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.26)] text-[var(--accent-strong)] hover:bg-[rgba(248,251,253,0.44)]"
                                    : "border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.22)] text-[var(--accent-strong)] hover:bg-[rgba(248,251,253,0.34)]"
                            )}
                        >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(19,44,71,0.08)] text-[var(--accent-strong)]">
                                <PhoneCall className="h-4 w-4" weight="bold" />
                            </span>
                            <span className="min-w-0">
                                <span className="editorial-caption block text-[rgba(16,36,56,0.7)]">
                                    {locale === "en" ? "Advisory desk" : "Tư vấn nhanh"}
                                </span>
                                <span className="mt-1 block truncate text-sm font-semibold text-[var(--accent-strong)]">
                                    {resolvedHotline}
                                </span>
                            </span>
                        </a>

                        <LocaleToggle
                            locale={locale}
                            pathname={pathname}
                            transparent={!showFramedShell}
                            className="hidden xl:inline-flex"
                        />

                        <div className="hidden xl:block">
                            <Button
                                asChild
                                variant={showFramedShell ? "primary" : "outline"}
                                size="md"
                                motion="magnetic"
                                className={cn(
                                    "min-w-[158px] rounded-[1.02rem] shadow-[var(--shadow-xs)]",
                                    showFramedShell
                                        ? "border-[rgba(77,111,147,0.16)] bg-[linear-gradient(135deg,#132c47,#244666_62%,#56718b)] text-white hover:bg-[linear-gradient(135deg,#10263d,#1f3f5c_62%,#4c657f)]"
                                        : "!border-white/28 !bg-[linear-gradient(180deg,rgba(252,254,255,0.22),rgba(241,247,251,0.12))] !text-[var(--accent-strong)] shadow-[0_14px_30px_-28px_rgba(8,20,33,0.42)] hover:!bg-[linear-gradient(180deg,rgba(252,254,255,0.3),rgba(241,247,251,0.18))] hover:!text-[var(--ink)]"
                                )}
                            >
                                <Link href={resolvedCtaUrl} className={cn("inline-flex items-center gap-3 whitespace-nowrap", showFramedShell ? "text-white" : "!text-[var(--accent-strong)]")}>
                                    <span>{ctaText}</span>
                                    <span
                                        className={cn(
                                            "inline-flex h-7 w-7 items-center justify-center rounded-full",
                                            showFramedShell ? "bg-white/14 text-white" : "bg-[rgba(19,44,71,0.1)] text-[var(--accent-strong)]"
                                        )}
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
                                transparent={!showFramedShell}
                            />

                            <button
                                type="button"
                                onClick={() => setIsOpen((value) => !value)}
                                className={cn(
                                    "inline-flex rounded-[0.92rem] p-2 transition-colors",
                                    showFramedShell
                                        ? "border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.36)] text-[var(--ink)] hover:bg-[rgba(248,251,253,0.52)]"
                                        : "border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.18)] text-[var(--ink)] hover:bg-[rgba(248,251,253,0.3)]"
                                )}
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
                            className="public-panel mt-3 overflow-hidden rounded-[1.45rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(252,254,255,0.9)] px-4 py-4 text-[var(--ink)] shadow-[var(--shadow-sm)] xl:hidden"
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
                                                    className="block rounded-[0.95rem] px-4 py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[rgba(77,111,147,0.06)]"
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
                                            className="overflow-hidden rounded-[1rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.64)]"
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
                                                                    className="block rounded-[0.9rem] px-3 py-2.5 text-sm text-[var(--ink-soft)] transition-colors hover:bg-[rgba(77,111,147,0.06)] hover:text-[var(--ink)]"
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
                                    className="w-full border-transparent bg-[linear-gradient(135deg,#132c47,#244666_62%,#56718b)] text-white shadow-[var(--shadow-xs)] hover:bg-[linear-gradient(135deg,#10263d,#1f3f5c_62%,#4c657f)]"
                                >
                                    <Link href={resolvedCtaUrl} className="inline-flex items-center justify-center gap-3 text-white">
                                        <span>{ctaText}</span>
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
        </header>
    );
}

Header.displayName = "Header";
