"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { SiteLayoutData } from "@/lib/services/site-content";

export interface SiteLayoutContextValue {
    vi: SiteLayoutData;
    en: SiteLayoutData;
}

const SiteLayoutContext = React.createContext<SiteLayoutContextValue | null>(null);

interface SiteLayoutProviderProps {
    value: SiteLayoutContextValue;
    children: React.ReactNode;
}

type SiteLayoutLocale = keyof SiteLayoutContextValue;

interface SiteLayoutApiResponse {
    success: boolean;
    data: SiteLayoutData;
}

async function fetchSiteLayout(locale: SiteLayoutLocale, signal?: AbortSignal): Promise<SiteLayoutData> {
    const response = await fetch(`/api/layout?locale=${locale}`, {
        cache: "no-store",
        signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to refresh ${locale} site layout`);
    }

    const payload = await response.json() as SiteLayoutApiResponse;
    return payload.data;
}

export function SiteLayoutProvider({ value, children }: SiteLayoutProviderProps) {
    const pathname = usePathname();
    const [layouts, setLayouts] = React.useState(value);

    React.useEffect(() => {
        setLayouts(value);
    }, [value]);

    const refreshLayouts = React.useCallback(async (signal?: AbortSignal) => {
        const [vi, en] = await Promise.all([
            fetchSiteLayout("vi", signal),
            fetchSiteLayout("en", signal),
        ]);

        setLayouts({
            vi,
            en,
        });
    }, []);

    React.useEffect(() => {
        if (!pathname || pathname.startsWith("/admin")) {
            return;
        }

        const controller = new AbortController();
        void refreshLayouts(controller.signal).catch((error) => {
            if (controller.signal.aborted) {
                return;
            }

            console.error("Failed to refresh site layouts:", error);
        });

        return () => controller.abort();
    }, [pathname, refreshLayouts]);

    React.useEffect(() => {
        const refreshOnFocus = () => {
            if (document.visibilityState !== "visible" || window.location.pathname.startsWith("/admin")) {
                return;
            }

            void refreshLayouts().catch((error) => {
                console.error("Failed to refresh site layouts on focus:", error);
            });
        };

        document.addEventListener("visibilitychange", refreshOnFocus);
        window.addEventListener("focus", refreshOnFocus);

        return () => {
            document.removeEventListener("visibilitychange", refreshOnFocus);
            window.removeEventListener("focus", refreshOnFocus);
        };
    }, [refreshLayouts]);

    return (
        <SiteLayoutContext.Provider value={layouts}>
            {children}
        </SiteLayoutContext.Provider>
    );
}

export function useSiteLayouts() {
    return React.useContext(SiteLayoutContext);
}
