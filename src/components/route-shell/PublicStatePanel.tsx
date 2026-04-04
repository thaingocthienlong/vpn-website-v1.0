import * as React from "react";
import { cn } from "@/lib/utils";

export interface PublicStatePanelProps {
    icon: React.ElementType;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
    density?: "default" | "compact";
}

export function PublicStatePanel({
    icon: Icon,
    title,
    description,
    action,
    className,
    density = "default",
}: PublicStatePanelProps) {
    const isCompact = density === "compact";

    return (
        <div
            className={cn(
                "public-panel rounded-[2.2rem] px-6 text-center",
                isCompact ? "py-9 md:px-8 md:py-10" : "py-16",
                className
            )}
        >
            <div
                className={cn(
                    "mx-auto flex items-center justify-center rounded-[1.5rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]",
                    isCompact ? "mb-4 h-14 w-14 rounded-[1.2rem]" : "mb-6 h-18 w-18"
                )}
            >
                <Icon className={cn(isCompact ? "h-6 w-6" : "h-8 w-8")} weight="duotone" />
            </div>
            <h2 className={cn("font-heading text-[var(--ink)]", isCompact ? "text-[1.45rem]" : "text-2xl")}>
                {title}
            </h2>
            {description && (
                <p
                    className={cn(
                        "mx-auto text-[var(--ink-soft)]",
                        isCompact ? "mt-2 max-w-lg text-[0.95rem] leading-7" : "mt-3 max-w-xl text-base leading-8"
                    )}
                >
                    {description}
                </p>
            )}
            {action && <div className={cn("flex justify-center", isCompact ? "mt-5" : "mt-6")}>{action}</div>}
        </div>
    );
}

export default PublicStatePanel;
