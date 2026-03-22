import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
    options: SelectOption[];
    label?: string;
    error?: string;
    placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        { className, options, label, error, placeholder, id, ...props },
        ref
    ) => {
        const generatedId = React.useId();
        const selectId = id ?? generatedId;

        const baseStyles =
            "public-input-surface w-full appearance-none rounded-[1.35rem] px-4 py-3.5 pr-11 text-sm text-[var(--ink)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0";

        const normalStyles =
            "placeholder:text-[var(--ink-muted)] focus:border-[rgba(46,94,196,0.28)] focus:ring-[rgba(46,94,196,0.24)]";

        const errorStyles =
            "border-[rgba(155,74,69,0.45)] focus:border-[rgba(155,74,69,0.45)] focus:ring-[rgba(155,74,69,0.2)]";

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="mb-2 block text-sm font-medium text-[var(--ink)]"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        className={cn(
                            baseStyles,
                            error ? errorStyles : normalStyles,
                            className
                        )}
                        ref={ref}
                        aria-invalid={error ? "true" : "false"}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--ink-muted)]" />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-[var(--error)]">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";

export { Select };
