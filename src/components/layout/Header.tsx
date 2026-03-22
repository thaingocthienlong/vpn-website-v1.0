"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CaretDown, List, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { Container } from "./Container";
import { Navbar, getDefaultMenuItems } from "./Navbar";
import { detectLocaleFromPath } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { FloatingAccent, publicMotionTokens } from "@/components/motion/PublicMotion";

export interface HeaderProps {
    logo?: string;
    hotline?: string;
    ctaText?: string;
    ctaUrl?: string;
}

export function Header({
    logo = "https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png",
    ctaText = "Liên hệ ngay",
    ctaUrl,
}: HeaderProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const items = React.useMemo(() => getDefaultMenuItems(locale), [locale]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
    const resolvedCtaUrl = ctaUrl ?? (locale === "en" ? "/en/contact" : "/lien-he");
    const homeUrl = locale === "en" ? "/en" : "/";

    React.useEffect(() => {
        setIsOpen(false);
        setExpandedItem(null);
    }, [pathname]);

    return (
        <header className="fixed inset-x-0 top-0 z-40">
            <Container className="pt-4 md:pt-6">
                <motion.div
                    initial={{ opacity: 0, y: -28, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={publicMotionTokens.sectionSpring}
                    className="public-panel public-band relative grid grid-cols-[auto_1fr_auto] items-center gap-3 overflow-hidden rounded-[2rem] px-4 py-3.5 md:px-6 md:py-4"
                >
                    <FloatingAccent className="right-8 top-0 h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.18),transparent_70%)]" variant="halo" />
                    <Link href={homeUrl} className="flex min-w-0 items-center" title="Viện Phương Nam">
                        <div className="relative h-[64px] w-[112px] shrink-0 overflow-hidden rounded-[1.1rem] md:h-[72px] md:w-[126px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logo}
                                alt="Viện Phương Nam"
                                className="h-full w-full object-cover object-top"
                            />
                        </div>
                    </Link>

                    <Navbar items={items} className="min-w-0 justify-center px-2" />

                    <div className="hidden xl:block">
                        <Button
                            asChild
                            variant="secondary"
                            size="md"
                            motion="magnetic"
                            className="min-w-[146px] border-[rgba(26,72,164,0.16)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)] shadow-none hover:bg-[rgba(23,88,216,0.14)]"
                        >
                            <Link href={resolvedCtaUrl}>{ctaText}</Link>
                        </Button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen((value) => !value)}
                        className="inline-flex rounded-[1.05rem] border border-[rgba(26,72,164,0.14)] bg-[rgba(255,255,255,0.76)] p-2.5 text-[var(--ink)] transition-colors hover:bg-white xl:hidden"
                        aria-label={isOpen ? "Close navigation" : "Open navigation"}
                    >
                        {isOpen ? <X className="h-5 w-5" weight="bold" /> : <List className="h-5 w-5" weight="bold" />}
                    </button>
                </motion.div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={publicMotionTokens.hoverSpring}
                            className="public-panel mt-3 overflow-hidden rounded-[1.9rem] px-4 py-4 xl:hidden"
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
                                                    className="block rounded-[1.15rem] px-4 py-3 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[rgba(23,88,216,0.08)]"
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
                                            className="overflow-hidden rounded-[1.15rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.6)]"
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
                                                        className="overflow-hidden border-t border-[rgba(26,72,164,0.08)]"
                                                    >
                                                        <div className="space-y-1 px-2 py-2">
                                                            {item.children?.map((child) => (
                                                                <Link
                                                                    key={child.url}
                                                                    href={child.url}
                                                                    className="block rounded-[1rem] px-3 py-2.5 text-sm text-[var(--ink-soft)] transition-colors hover:bg-[rgba(23,88,216,0.06)] hover:text-[var(--ink)]"
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
                                    variant="secondary"
                                    size="md"
                                    motion="magnetic"
                                    className="w-full border-[rgba(26,72,164,0.16)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)] shadow-none hover:bg-[rgba(23,88,216,0.14)]"
                                >
                                    <Link href={resolvedCtaUrl}>{ctaText}</Link>
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
