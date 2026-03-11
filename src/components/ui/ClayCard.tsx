import * as React from "react";
import { cn } from "@/lib/utils";

export interface ClayCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "elevated" | "flat";
    hoverEffect?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

const ClayCard = React.forwardRef<HTMLDivElement, ClayCardProps>(
    (
        {
            className,
            variant = "default",
            hoverEffect = true,
            padding = "md",
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = "rounded-2xl transition-all duration-300";

        const variants = {
            default: "clay-card",
            elevated: "clay-card clay-card-elevated",
            flat: "bg-white border border-slate-200",
        };

        const paddings = {
            none: "",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        return (
            <div
                className={cn(
                    baseStyles,
                    variants[variant],
                    paddings[padding],
                    hoverEffect && variant !== "flat" && "hover:-translate-y-1",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </div>
        );
    }
);

ClayCard.displayName = "ClayCard";

export { ClayCard };
