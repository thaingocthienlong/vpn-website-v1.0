import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const generatedId = React.useId();
        const textareaId = id ?? generatedId;

        const baseStyles =
            "public-input-surface min-h-[156px] w-full resize-y rounded-[1.55rem] px-4 py-3.5 text-sm text-[var(--ink)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-0";

        const normalStyles =
            "placeholder:text-[var(--ink-muted)] focus:border-[rgba(23,88,216,0.28)] focus:ring-[rgba(23,88,216,0.18)]";

        const errorStyles =
            "border-[rgba(160,79,92,0.45)] focus:border-[rgba(160,79,92,0.45)] focus:ring-[rgba(160,79,92,0.16)]";

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className="mb-2 block text-sm font-medium text-[var(--ink)]">
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={cn(baseStyles, error ? errorStyles : normalStyles, className)}
                    ref={ref}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${textareaId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${textareaId}-error`} className="mt-1 text-sm text-[var(--error)]">
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

Textarea.displayName = "Textarea";

export { Textarea };
