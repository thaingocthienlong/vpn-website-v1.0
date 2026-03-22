"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { motion as motionPrimitive, useReducedMotion } from "framer-motion";
import { MagneticButton, publicMotionTokens } from "@/components/motion/PublicMotion";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "text" | "cta";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    asChild?: boolean;
    motion?: "none" | "lift" | "magnetic";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = "primary",
            size = "md",
            isLoading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            asChild = false,
            motion = "lift",
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const shouldReduceMotion = useReducedMotion();
        const baseStyles = cn(
            "relative isolate inline-flex items-center justify-center overflow-hidden border font-medium tracking-[0.01em]",
            "transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50",
            "active:translate-y-px"
        );

        const sharedFx =
            "before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100";

        const variants = {
            primary: cn(
                "border-transparent bg-[var(--accent)] text-[var(--color-primary-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--accent-strong)]",
                "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.24),transparent_58%)]",
                "focus:ring-[rgba(23,88,216,0.28)]"
            ),
            cta: cn(
                "border-[rgba(176,207,255,0.16)] bg-[linear-gradient(135deg,var(--shell),var(--shell-strong))] text-white shadow-[var(--shadow-md)]",
                "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_56%)]",
                "focus:ring-[rgba(12,45,107,0.28)]"
            ),
            secondary: cn(
                "border-[rgba(26,72,164,0.14)] bg-[rgba(255,255,255,0.78)] text-[var(--ink)] shadow-[var(--shadow-xs)] hover:bg-[rgba(255,255,255,0.94)]",
                "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.7),transparent_60%)]",
                "focus:ring-[rgba(23,88,216,0.16)]"
            ),
            outline: cn(
                "border-[rgba(23,88,216,0.24)] bg-transparent text-[var(--accent-strong)] hover:bg-[rgba(23,88,216,0.08)]",
                "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.5),transparent_62%)]",
                "focus:ring-[rgba(23,88,216,0.18)]"
            ),
            ghost: cn(
                "border-transparent bg-transparent text-[var(--ink-soft)] hover:bg-[rgba(255,255,255,0.62)] hover:text-[var(--ink)]",
                "before:bg-[linear-gradient(135deg,rgba(255,255,255,0.42),transparent_60%)]",
                "focus:ring-[rgba(23,88,216,0.14)]"
            ),
            text: "min-h-0 border-transparent bg-transparent p-0 text-[var(--accent-strong)] hover:text-[var(--accent)] hover:underline focus:ring-[rgba(23,88,216,0.14)]",
        } as const;

        const sizes = {
            sm: "h-10 rounded-[1rem] px-4 text-sm gap-2",
            md: "h-12 rounded-[1.15rem] px-6 text-[15px] gap-2.5",
            lg: "h-14 rounded-[1.3rem] px-7 text-base gap-3",
            icon: "h-11 w-11 rounded-[1rem] p-0",
        } as const;

        const wrapWithMotion = (node: React.ReactNode) => {
            if (motion === "none") {
                return node;
            }

            if (motion === "magnetic") {
                return (
                    <MagneticButton className={cn(fullWidth ? "w-full" : "inline-flex")} strength={size === "icon" ? 8 : 14}>
                        {node}
                    </MagneticButton>
                );
            }

            if (shouldReduceMotion) {
                return node;
            }

            return (
                <motionPrimitive.div
                    className={cn(fullWidth ? "w-full" : "inline-flex")}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ y: 1, scale: 0.985 }}
                    transition={publicMotionTokens.hoverSpring}
                >
                    {node}
                </motionPrimitive.div>
            );
        };

        if (asChild) {
            return wrapWithMotion(
                <Slot
                    className={cn(
                        baseStyles,
                        variant !== "text" && sharedFx,
                        variants[variant],
                        sizes[size],
                        fullWidth && "w-full",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </Slot>
            );
        }

        return wrapWithMotion(
            <button
                className={cn(
                    baseStyles,
                    variant !== "text" && sharedFx,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg
                        className="-ml-1 mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
                {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
                <span className="relative z-[1]">{children}</span>
                {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
