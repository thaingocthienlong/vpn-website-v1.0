import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftAddon?: React.ReactNode;
    rightAddon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = "text",
            label,
            error,
            helperText,
            leftAddon,
            rightAddon,
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = React.useId();
        const inputId = id ?? generatedId;

        const baseInputStyles =
            "public-input-surface w-full rounded-[1.35rem] px-4 py-3.5 text-sm text-[var(--ink)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0";

        const normalStyles =
            "placeholder:text-[var(--ink-muted)] focus:border-[rgba(23,88,216,0.28)] focus:ring-[rgba(23,88,216,0.18)]";

        const errorStyles =
            "border-[rgba(160,79,92,0.45)] focus:border-[rgba(160,79,92,0.45)] focus:ring-[rgba(160,79,92,0.16)]";

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-[var(--ink)]">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftAddon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]">
                            {leftAddon}
                        </div>
                    )}
                    <input
                        type={type}
                        id={inputId}
                        className={cn(
                            baseInputStyles,
                            error ? errorStyles : normalStyles,
                            leftAddon && "pl-12",
                            rightAddon && "pr-12",
                            className
                        )}
                        ref={ref}
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        {...props}
                    />
                    {rightAddon && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]">
                            {rightAddon}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-sm text-[var(--error)]">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-[var(--ink-muted)]">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
