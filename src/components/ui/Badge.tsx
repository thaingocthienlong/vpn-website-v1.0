import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "hot";
    size?: "sm" | "md";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", size = "sm", children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center font-medium rounded-full";

        const variants = {
            default: "bg-blue-50 text-blue-600",
            primary: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
            secondary: "bg-slate-100 text-slate-700",
            accent: "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",
            success: "bg-green-50 text-green-700",
            warning: "bg-orange-50 text-orange-700",
            error: "bg-red-50 text-red-700",
            hot: "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg",
        };

        const sizes = {
            sm: "px-3 py-1 text-xs",
            md: "px-4 py-1.5 text-sm",
        };

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
