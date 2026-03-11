import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export interface SectionHeaderProps {
    badge?: string;
    title: string;
    subtitle?: string;
    alignment?: "left" | "center" | "right";
    centered?: boolean;
    variant?: "light" | "dark";
    className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    badge,
    title,
    subtitle,
    alignment,
    centered,
    variant = "light",
    className,
}) => {
    const actualAlignment = centered ? "center" : (alignment || "center");
    const alignments = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    };

    const isDark = variant === "dark";

    return (
        <div className={cn("mb-12", alignments[actualAlignment], className)}>
            {badge && (
                <Badge
                    variant={isDark ? "secondary" : "default"}
                    size="md"
                    className={cn("mb-4", isDark && "bg-white text-slate-800 border-slate-200")}
                >
                    {badge}
                </Badge>
            )}
            <h2
                className={cn(
                    "font-heading text-3xl lg:text-4xl font-bold mb-4 leading-tight",
                    isDark ? "text-white" : "text-slate-900"
                )}
            >
                {title}
            </h2>
            {/* Accent decoration */}
            {actualAlignment === "center" && (
                <div className="w-16 h-1 bg-primary rounded-full mx-auto mb-4" />
            )}
            {actualAlignment === "left" && (
                <div className="w-16 h-1 bg-primary rounded-full mb-4" />
            )}
            {subtitle && (
                <p
                    className={cn(
                        "text-lg max-w-2xl leading-relaxed",
                        actualAlignment === "center" && "mx-auto",
                        isDark ? "text-white/80" : "text-slate-500"
                    )}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
};

SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
