import * as React from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface PublicBreadcrumbBarProps {
    items: BreadcrumbItem[];
}

export function PublicBreadcrumbBar({ items }: PublicBreadcrumbBarProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav
            className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-[rgba(26,72,164,0.08)] bg-[rgba(255,255,255,0.66)] px-4 py-3 text-sm text-[var(--ink-soft)]"
            aria-label="Breadcrumb"
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={`${item.label}-${index}`}>
                        {item.href && !isLast ? (
                            <Link href={item.href} className="transition-colors hover:text-[var(--accent-strong)]">
                                {item.label}
                            </Link>
                        ) : (
                            <span className={isLast ? "text-[var(--ink)]" : ""}>{item.label}</span>
                        )}
                        {!isLast && <CaretRight className="h-3.5 w-3.5 opacity-50" weight="bold" />}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}

export default PublicBreadcrumbBar;
