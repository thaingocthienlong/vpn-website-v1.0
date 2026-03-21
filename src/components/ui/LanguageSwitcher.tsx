"use client";

import { usePathname, useRouter } from "next/navigation";
import { detectLocaleFromPath, getEquivalentRoute } from "@/lib/routes";
import { Globe } from "lucide-react";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
    className?: string;
    variant?: "desktop" | "mobile";
    scrollThreshold?: number;
}

export function LanguageSwitcher({ className = "", variant = "desktop", scrollThreshold = 20 }: LanguageSwitcherProps) {
    const pathname = usePathname();
    const router = useRouter();
    const currentLocale = detectLocaleFromPath(pathname);
    
    // Track scroll state
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const shouldBeScrolled = latest > scrollThreshold;
        if (shouldBeScrolled !== isScrolled) {
            setIsScrolled(shouldBeScrolled);
        }
    });

    const handleSwitch = (targetLocale: "vi" | "en") => {
        if (targetLocale === currentLocale) return;
        const newPath = getEquivalentRoute(pathname, targetLocale);
        router.push(newPath);
    };

    if (variant === "mobile") {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <Globe className="w-4 h-4 text-slate-500" />
                <button
                    onClick={() => handleSwitch("vi")}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        currentLocale === "vi" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                >
                    🇻🇳 VI
                </button>
                <button
                    onClick={() => handleSwitch("en")}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                        currentLocale === "en" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                >
                    🇬🇧 EN
                </button>
            </div>
        );
    }

    // Desktop variant: premium animated toggle
    return (
        <motion.div 
            layout
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
                "relative flex items-center gap-1 p-1 rounded-full",
                isScrolled 
                    ? "bg-slate-200/60 backdrop-blur-md border border-slate-300/40 shadow-inner" 
                    : "bg-slate-200/40 backdrop-blur-sm border border-transparent",
                className
            )}
        >
            <button
                onClick={() => handleSwitch("vi")}
                className={cn(
                    "relative flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold z-10 transition-colors duration-200",
                    currentLocale === "vi" 
                        ? (isScrolled ? "text-blue-600" : "text-slate-800") 
                        : "text-slate-500 hover:text-slate-700"
                )}
                title="Tiếng Việt"
            >
                {currentLocale === "vi" && (
                    <motion.div
                        layoutId="active-lang-pill"
                        className={cn(
                            "absolute inset-0 rounded-full -z-10",
                            isScrolled 
                                ? "bg-white shadow-[0_2px_8px_rgb(0,0,0,0.08)] border border-slate-100/50" 
                                : "bg-white/90 shadow-sm"
                        )}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                    🇻🇳 VI
                </span>
            </button>
            <button
                onClick={() => handleSwitch("en")}
                className={cn(
                    "relative flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-semibold z-10 transition-colors duration-200",
                    currentLocale === "en" 
                        ? (isScrolled ? "text-blue-600" : "text-slate-800") 
                        : "text-slate-500 hover:text-slate-700"
                )}
                title="English"
            >
                {currentLocale === "en" && (
                    <motion.div
                        layoutId="active-lang-pill"
                        className={cn(
                            "absolute inset-0 rounded-full -z-10",
                            isScrolled 
                                ? "bg-white shadow-[0_2px_8px_rgb(0,0,0,0.08)] border border-slate-100/50" 
                                : "bg-white/90 shadow-sm"
                        )}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                    🇬🇧 EN
                </span>
            </button>
        </motion.div>
    );
}
