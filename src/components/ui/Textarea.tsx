import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, helperText, id, ...props }, ref) => {
        const textareaId = id || React.useId();

        const baseStyles =
            "w-full px-5 py-3 rounded-2xl border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y min-h-[120px]";

        const normalStyles =
            "border-slate-200 focus:ring-blue-500/50 focus:border-blue-400 bg-white placeholder:text-slate-400";

        const errorStyles =
            "border-red-400 focus:ring-red-500/50 focus:border-red-400";

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-slate-700 mb-2"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={cn(
                        baseStyles,
                        error ? errorStyles : normalStyles,
                        className
                    )}
                    ref={ref}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${textareaId}-error` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
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

Textarea.displayName = "Textarea";

export { Textarea };
