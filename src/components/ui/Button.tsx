import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "text" | "cta";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    asChild?: boolean;
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
            disabled,
            children,
            ...props
        },
        ref
    ) => {

        const baseStyles =
            "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary:
                "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white hover:from-[#1D4ED8] hover:to-[#1E40AF] focus:ring-blue-500 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]",
            cta:
                "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white hover:from-[#1D4ED8] hover:to-[#1E40AF] focus:ring-blue-500 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 active:scale-[0.98]",
            secondary:
                "bg-white text-slate-900 border-slate-200",
            outline:
                "bg-white text-blue-600 border-blue-200",
            ghost:
                "text-slate-700 hover:bg-slate-100",
            text:
                "bg-transparent text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500 p-0 min-h-0",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm gap-2",
            md: "h-12 px-6 text-base gap-2",
            lg: "h-14 px-8 text-lg gap-3",
            icon: "h-10 w-10 p-0",
        };

        // When asChild, just pass through the single child element with merged props
        // Don't render loading/icons as they would create multiple children
        if (asChild) {
            return (
                <Slot
                    className={cn(
                        baseStyles,
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

        return (
            <button
                className={cn(
                    baseStyles,
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
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                {!isLoading && leftIcon && <span>{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span>{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button };
