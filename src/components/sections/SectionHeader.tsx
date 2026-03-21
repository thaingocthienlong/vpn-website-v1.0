import * as React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
    title: string;
    alignment?: "left" | "center" | "right";
    centered?: boolean;
    variant?: "light" | "dark";
    className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    alignment,
    centered,
    variant = "light",
    className,
}) => {
    const actualAlignment = centered ? "center" : (alignment || "center");
    const flexAlignments = {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
    };

    const isDark = variant === "dark";

    return (
        <div className={cn("mb-12 flex w-full", flexAlignments[actualAlignment], className)}>
            <h2
                className={cn(
                    "inline-flex items-center justify-center text-center",
                    "px-[18px] py-[8px] rounded-[100px] border",
                    "font-medium tracking-[0.5px]",
                    isDark
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-[#38bdf81f] border-[#38bdf84d] text-[#0254c7]"
                )}
                style={{
                    fontFamily: '"Momo Signature", cursive',
                    fontSize: '1.2rem',
                    animation: 'tag-float 3s ease-in-out infinite'
                }}
            >
                {title}
            </h2>
        </div>
    );
};

SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
