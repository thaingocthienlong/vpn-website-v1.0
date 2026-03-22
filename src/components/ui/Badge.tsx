import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "hot";
    size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-[999px] border font-semibold uppercase tracking-[0.14em]";

        const variants = {
            default: "border-[rgba(23,88,216,0.18)] bg-[rgba(255,255,255,0.74)] text-[var(--accent-strong)]",
            primary: "border-transparent bg-[var(--accent)] text-[var(--color-primary-foreground)]",
            secondary: "border-[rgba(26,72,164,0.14)] bg-[rgba(220,233,255,0.72)] text-[var(--ink-soft)]",
            accent: "border-transparent bg-[rgba(23,88,216,0.14)] text-[var(--accent-strong)]",
            success: "border-[rgba(47,122,95,0.16)] bg-[rgba(47,122,95,0.12)] text-[var(--success)]",
            warning: "border-[rgba(148,102,46,0.16)] bg-[rgba(148,102,46,0.12)] text-[var(--warning)]",
            error: "border-[rgba(160,79,92,0.16)] bg-[rgba(160,79,92,0.12)] text-[var(--error)]",
            hot: "border-[rgba(170,205,255,0.12)] bg-[linear-gradient(135deg,var(--shell),var(--shell-strong))] text-white",
        } as const;

        const sizes = {
            sm: "px-3 py-1 text-[10px]",
            md: "px-4 py-1.5 text-[11px]",
        } as const;

        return (
            <span
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            >
                {children}
            </span>
        );
    }
);

Badge.displayName = "Badge";

export { Badge };
