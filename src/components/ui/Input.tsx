import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelClassName?: string;
    error?: string;
    helperText?: string;
    helperTextClassName?: string;
    leftAddon?: React.ReactNode;
    rightAddon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = "text",
            label,
            labelClassName,
            error,
            helperText,
            helperTextClassName,
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
            "public-input-surface w-full rounded-[1rem] px-4 py-3.5 text-sm text-[var(--ink)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0";

        const normalStyles =
            "placeholder:text-[var(--ink-muted)] focus:border-[rgba(77,111,147,0.28)] focus:ring-[rgba(94,130,166,0.18)]";

        const errorStyles =
            "border-[rgba(138,79,93,0.42)] focus:border-[rgba(138,79,93,0.42)] focus:ring-[rgba(138,79,93,0.16)]";

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className={cn("mb-2 block text-sm font-medium text-[var(--ink)]", labelClassName)}>
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
                    <p className={cn("mt-1 text-sm text-[var(--ink-muted)]", helperTextClassName)}>{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
