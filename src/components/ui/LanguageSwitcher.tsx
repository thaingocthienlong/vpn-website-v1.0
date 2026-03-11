"use client";

import { usePathname, useRouter } from "next/navigation";
import { detectLocaleFromPath, getEquivalentRoute } from "@/lib/routes";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
    className?: string;
    variant?: "desktop" | "mobile";
}

export function LanguageSwitcher({ className = "", variant = "desktop" }: LanguageSwitcherProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentLocale = detectLocaleFromPath(pathname);

    const handleSwitch = (targetLocale: "vi" | "en") => {
        if (targetLocale === currentLocale) return;
        const newPath = getEquivalentRoute(pathname, targetLocale);
        router.push(newPath);
    };

    if (variant === "mobile") {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <Globe className="w-4 h-4 text-slate-500" />
                <button
                    onClick={() => handleSwitch("vi")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentLocale === "vi"
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                >
                    🇻🇳 VI
                </button>
                <button
                    onClick={() => handleSwitch("en")}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentLocale === "en"
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                >
                    🇬🇧 EN
                </button>
            </div>
        );
    }

    // Desktop variant: compact toggle
    return (
        <div className={`flex items-center gap-1 bg-slate-100/60 rounded-lg p-0.5 ${className}`}>
            <button
                onClick={() => handleSwitch("vi")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${currentLocale === "vi"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                title="Tiếng Việt"
            >
                🇻🇳 VI
            </button>
            <button
                onClick={() => handleSwitch("en")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${currentLocale === "en"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                title="English"
            >
                🇬🇧 EN
            </button>
        </div>
    );
}
