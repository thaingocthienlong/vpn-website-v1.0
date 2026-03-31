"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, EnvelopeSimple, PhoneCall, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { publicMotionTokens } from "@/components/motion/PublicMotion";

export interface FloatingQuickContactProps {
    locale: "vi" | "en";
    phone: string;
    email: string;
    contactHref: string;
}

function toPhoneHref(phone: string) {
    return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function FloatingQuickContact({
    locale,
    phone,
    email,
    contactHref,
}: FloatingQuickContactProps) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const launcherLabel = locale === "en" ? "Quick contact" : "Liên hệ nhanh";
    const isCurrentContactPage = pathname === contactHref;

    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown, { passive: true });
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    const actions = [
        {
            key: "call",
            href: toPhoneHref(phone),
            label: locale === "en" ? "Call" : "Gọi điện",
            description: phone,
            icon: PhoneCall,
            external: true,
        },
        {
            key: "email",
            href: `mailto:${email}`,
            label: locale === "en" ? "Email" : "Email",
            description: email,
            icon: EnvelopeSimple,
            external: true,
        },
    ] as const;

    return (
        <div
            ref={rootRef}
            className="pointer-events-none fixed z-50"
            style={{
                right: "max(1rem, calc(1rem + env(safe-area-inset-right)))",
                bottom: "max(1rem, calc(1rem + env(safe-area-inset-bottom)))",
            }}
        >
            <div className="pointer-events-auto flex flex-col items-end gap-3">
                <AnimatePresence>
                    {isOpen ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={publicMotionTokens.hoverSpring}
                            className="w-[min(20rem,calc(100vw-2rem))] rounded-[1.3rem] border border-[rgba(16,36,56,0.1)] bg-[linear-gradient(180deg,rgba(252,254,255,0.92),rgba(240,247,251,0.84))] p-2.5 shadow-[0_26px_60px_-34px_rgba(8,20,33,0.34)] backdrop-blur-xl"
                        >
                            <div className="flex items-center justify-between px-2 pb-2 pt-1">
                                <div>
                                    <p className="editorial-caption text-[var(--ink-muted)]">
                                        {locale === "en" ? "Quick actions" : "Kết nối nhanh"}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                                        {launcherLabel}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.68)] text-[var(--ink)] transition-colors hover:bg-[rgba(248,251,253,0.9)]"
                                    aria-label={locale === "en" ? "Close quick contact" : "Đóng liên hệ nhanh"}
                                >
                                    <X className="h-4 w-4" weight="bold" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {actions.map((action) => {
                                    const Icon = action.icon;

                                    return (
                                        <a
                                            key={action.key}
                                            href={action.href}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 rounded-[1.05rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.72)] px-3 py-3 text-[var(--ink)] transition-colors hover:bg-[rgba(248,251,253,0.96)]"
                                        >
                                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(19,44,71,0.08)] text-[var(--accent-strong)]">
                                                <Icon className="h-5 w-5" weight="bold" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-semibold">{action.label}</span>
                                                <span className="mt-1 block truncate text-xs text-[var(--ink-soft)]">
                                                    {action.description}
                                                </span>
                                            </span>
                                            <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--accent-strong)]" weight="bold" />
                                        </a>
                                    );
                                })}

                                {isCurrentContactPage ? (
                                    <div className="flex items-center gap-3 rounded-[1.05rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(240,247,251,0.78)] px-3 py-3 text-[var(--ink-muted)]">
                                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(19,44,71,0.06)] text-[var(--ink-muted)]">
                                            <ArrowUpRight className="h-5 w-5" weight="bold" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold">
                                                {locale === "en" ? "Contact page" : "Trang liên hệ"}
                                            </span>
                                            <span className="mt-1 block text-xs">
                                                {locale === "en" ? "You are already here" : "Bạn đang ở trang này"}
                                            </span>
                                        </span>
                                    </div>
                                ) : (
                                    <Link
                                        href={contactHref}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 rounded-[1.05rem] border border-[rgba(16,36,56,0.08)] bg-[rgba(248,251,253,0.72)] px-3 py-3 text-[var(--ink)] transition-colors hover:bg-[rgba(248,251,253,0.96)]"
                                    >
                                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(19,44,71,0.08)] text-[var(--accent-strong)]">
                                            <ArrowUpRight className="h-5 w-5" weight="bold" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold">
                                                {locale === "en" ? "Contact page" : "Trang liên hệ"}
                                            </span>
                                            <span className="mt-1 block text-xs text-[var(--ink-soft)]">
                                                {locale === "en" ? "Open contact and advisory details" : "Mở trang tư vấn và thông tin liên hệ"}
                                            </span>
                                        </span>
                                        <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--accent-strong)]" weight="bold" />
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>

                <button
                    type="button"
                    onClick={() => setIsOpen((value) => !value)}
                    aria-expanded={isOpen}
                    aria-haspopup="dialog"
                    aria-label={launcherLabel}
                    className={cn(
                        "inline-flex h-13 w-13 items-center justify-center rounded-[1.15rem] border border-[rgba(16,36,56,0.1)] bg-[linear-gradient(180deg,rgba(252,254,255,0.76),rgba(239,246,250,0.6))] text-[var(--accent-strong)] shadow-[0_20px_40px_-28px_rgba(8,20,33,0.32)] backdrop-blur-xl transition-colors hover:bg-[linear-gradient(180deg,rgba(252,254,255,0.88),rgba(239,246,250,0.72))] md:h-14 md:w-14",
                        isOpen && "bg-[linear-gradient(180deg,rgba(252,254,255,0.92),rgba(239,246,250,0.76))]"
                    )}
                >
                    <PhoneCall className="h-5 w-5 md:h-6 md:w-6" weight="bold" />
                </button>
            </div>
        </div>
    );
}

FloatingQuickContact.displayName = "FloatingQuickContact";
