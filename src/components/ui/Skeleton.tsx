import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "text" | "circular" | "rectangular";
    width?: string | number;
    height?: string | number;
    animation?: "pulse" | "wave";
}

const Skeleton: React.FC<SkeletonProps> = ({
    className,
    variant = "text",
    width,
    height,
    animation = "pulse",
    style,
    ...props
}) => {
    const baseStyles = "bg-slate-200";

    const variants = {
        text: "rounded h-4",
        circular: "rounded-full",
        rectangular: "rounded-lg",
    };

    const animations = {
        pulse: "animate-pulse",
        wave: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
    };

    const styles: React.CSSProperties = {
        width: width ?? (variant === "text" ? "100%" : undefined),
        height:
            height ??
            (variant === "text" ? undefined : variant === "circular" ? width : 100),
        ...style,
    };

    return (
        <div
            className={cn(
                baseStyles,
                variants[variant],
                animations[animation],
                className
            )}
            style={styles}
            aria-hidden="true"
            {...props}
        />
    );
};

Skeleton.displayName = "Skeleton";

export { Skeleton };
