import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
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
        const inputId = id || React.useId();

        const baseInputStyles =
            "w-full px-5 py-3 rounded-full border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0";

        const normalStyles =
            "border-slate-200 focus:ring-blue-500/50 focus:border-blue-400 bg-white placeholder:text-slate-400";

        const errorStyles =
            "border-red-400 focus:ring-red-500/50 focus:border-red-400";

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-slate-700 mb-2"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftAddon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700">
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
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700">
                            {rightAddon}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-slate-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input };
