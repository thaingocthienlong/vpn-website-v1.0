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
        const selectId = id || React.useId();

        const baseStyles =
            "w-full px-5 py-3 pr-10 rounded-full border-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none cursor-pointer";

        const normalStyles =
            "border-slate-200 focus:ring-blue-500/50 focus:border-blue-400 bg-white text-slate-700";

        const errorStyles =
            "border-red-400 focus:ring-red-500/50 focus:border-red-400 text-slate-700";

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-slate-700 mb-2"
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
                            <option value="" disabled className="bg-slate-800 text-slate-700">
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-800 text-slate-700">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700 pointer-events-none" />
                </div>
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";

export { Select };
