"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Save, Sparkles } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CURRENT_RENDERED_KEYS, SECTION_LABELS } from "@/lib/admin/homepage-sections";
import type { AdminHomepageSectionPayload } from "@/types";

type HomepageApiResponse = {
    success: boolean;
    data?: {
        sections: AdminHomepageSectionPayload[];
    };
    error?: string;
};

const sectionDescriptions: Record<string, string> = {
    hero: "Controls the homepage hero copy plus the hero-specific CTA and video metadata.",
    training: "Headline copy only. Cards are sourced from the current training and course data.",
    services: "Headline copy only. Service cards come from the live service pages.",
    partners: "Headline copy only. Partner logos and links stay managed in the partners module.",
    news: "Headline copy only. News cards stay sourced from published posts.",
    gallery: "Headline copy plus curated gallery images for the homepage montage.",
    cta: "Endcap CTA content rendered at the bottom of the homepage.",
    contact: "Endcap contact block content rendered beside the CTA section.",
};

function normalizeConfig(config: Record<string, unknown> | null | undefined) {
    return config ?? {};
}

function getStringConfig(section: AdminHomepageSectionPayload, key: string) {
    const value = normalizeConfig(section.config)[key];
    return typeof value === "string" ? value : "";
}

function getStringArrayConfig(section: AdminHomepageSectionPayload, key: string) {
    const value = normalizeConfig(section.config)[key];
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export default function HomepageManager() {
    const [sections, setSections] = useState<AdminHomepageSectionPayload[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/homepage")
            .then((response) => response.json())
            .then((result: HomepageApiResponse) => {
                if (result.success && result.data?.sections) {
                    setSections(result.data.sections);
                    return;
                }

                setMessage(result.error || "Unable to load homepage sections.");
            })
            .catch(() => {
                setMessage("Unable to load homepage sections.");
            })
            .finally(() => setLoading(false));
    }, []);

    const supportedSections = useMemo(
        () => sections.filter((section) => CURRENT_RENDERED_KEYS.has(section.sectionKey)),
        [sections],
    );
    const inactiveSections = useMemo(
        () => sections.filter((section) => !CURRENT_RENDERED_KEYS.has(section.sectionKey)),
        [sections],
    );

    const updateSection = (sectionKey: string, updater: (section: AdminHomepageSectionPayload) => AdminHomepageSectionPayload) => {
        setSections((current) =>
            current.map((section) => (section.sectionKey === sectionKey ? updater(section) : section)),
        );
    };

    const updateLocaleField = (
        sectionKey: string,
        locale: "vi" | "en",
        field: "title" | "subtitle",
        value: string,
    ) => {
        updateSection(sectionKey, (section) => ({
            ...section,
            [locale]: {
                ...section[locale],
                [field]: value,
            },
        }));
    };

    const updateConfigField = (sectionKey: string, key: string, value: string | string[]) => {
        updateSection(sectionKey, (section) => ({
            ...section,
            config: {
                ...normalizeConfig(section.config),
                [key]: value,
            },
        }));
    };

    const toggleSection = (sectionKey: string) => {
        updateSection(sectionKey, (section) => ({
            ...section,
            isEnabled: !section.isEnabled,
        }));
    };

    const saveAll = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/homepage", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sections }),
            });
            const result: HomepageApiResponse = await response.json();

            if (!result.success) {
                setMessage(result.error || "Unable to save homepage changes.");
                return;
            }

            setMessage("Homepage sections updated.");
        } catch {
            setMessage("Unable to save homepage changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 rounded-[1.6rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(26,72,164,0.12)] bg-[rgba(220,233,255,0.46)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Site / Homepage
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Homepage Sections</h1>
                    <p className="max-w-3xl text-sm text-slate-500">
                        This editor now follows the public homepage renderer directly. Core sections stay aligned with the live
                        training, services, partners, and news modules, while the bottom CTA and contact blocks are managed here.
                    </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={saveAll} disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save homepage"}
                </Button>
            </div>

            {message && (
                <div className="rounded-[1.2rem] border border-[rgba(26,72,164,0.12)] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    {message}
                </div>
            )}

            <div className="space-y-4">
                {supportedSections.map((section) => (
                    <div
                        key={section.sectionKey}
                        className="rounded-[1.4rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm"
                    >
                        <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        {SECTION_LABELS[section.sectionKey] || section.sectionKey}
                                    </h2>
                                    <Badge variant={section.isEnabled ? "success" : "secondary"}>
                                        {section.isEnabled ? "Live" : "Hidden"}
                                    </Badge>
                                    <Badge variant="secondary">Order {section.sortOrder}</Badge>
                                </div>
                                <p className="max-w-3xl text-sm text-slate-500">
                                    {sectionDescriptions[section.sectionKey] || "Managed from the homepage section registry."}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-2"
                                onClick={() => toggleSection(section.sectionKey)}
                            >
                                {section.isEnabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {section.isEnabled ? "Hide section" : "Show section"}
                            </Button>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Vietnamese copy</h3>
                                <Input
                                    value={section.vi.title}
                                    onChange={(event) => updateLocaleField(section.sectionKey, "vi", "title", event.target.value)}
                                    placeholder="Section title (VI)"
                                />
                                <Textarea
                                    value={section.vi.subtitle}
                                    onChange={(event) => updateLocaleField(section.sectionKey, "vi", "subtitle", event.target.value)}
                                    placeholder="Section subtitle (VI)"
                                    rows={4}
                                    className="min-h-[120px]"
                                />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">English copy</h3>
                                <Input
                                    value={section.en.title}
                                    onChange={(event) => updateLocaleField(section.sectionKey, "en", "title", event.target.value)}
                                    placeholder="Section title (EN)"
                                />
                                <Textarea
                                    value={section.en.subtitle}
                                    onChange={(event) => updateLocaleField(section.sectionKey, "en", "subtitle", event.target.value)}
                                    placeholder="Section subtitle (EN)"
                                    rows={4}
                                    className="min-h-[120px]"
                                />
                            </div>
                        </div>

                        {section.sectionKey === "hero" && (
                            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                                <Input
                                    value={getStringConfig(section, "featuredVideo")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "featuredVideo", event.target.value)}
                                    placeholder="Featured video URL"
                                />
                                <Input
                                    value={getStringConfig(section, "ctaPrimary")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "ctaPrimary", event.target.value)}
                                    placeholder="Primary CTA label"
                                />
                                <Input
                                    value={getStringConfig(section, "ctaSecondary")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "ctaSecondary", event.target.value)}
                                    placeholder="Secondary CTA label"
                                />
                            </div>
                        )}

                        {section.sectionKey === "gallery" && (
                            <div className="mt-6 space-y-2">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Gallery image URLs</h3>
                                <Textarea
                                    value={getStringArrayConfig(section, "images").join("\n")}
                                    onChange={(event) =>
                                        updateConfigField(
                                            section.sectionKey,
                                            "images",
                                            event.target.value
                                                .split("\n")
                                                .map((item) => item.trim())
                                                .filter(Boolean),
                                        )
                                    }
                                    placeholder="One image URL per line"
                                    rows={6}
                                    className="min-h-[180px]"
                                />
                            </div>
                        )}

                        {section.sectionKey === "cta" && (
                            <div className="mt-6 grid gap-4 lg:grid-cols-3">
                                <Input
                                    value={getStringConfig(section, "primaryCTA")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "primaryCTA", event.target.value)}
                                    placeholder="Primary CTA label"
                                />
                                <Input
                                    value={getStringConfig(section, "secondaryCTA")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "secondaryCTA", event.target.value)}
                                    placeholder="Secondary CTA label"
                                />
                                <Input
                                    value={getStringConfig(section, "phone")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "phone", event.target.value)}
                                    placeholder="Support phone"
                                />
                            </div>
                        )}

                        {section.sectionKey === "contact" && (
                            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                                <Input
                                    value={getStringConfig(section, "phone")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "phone", event.target.value)}
                                    placeholder="Contact phone"
                                />
                                <Input
                                    value={getStringConfig(section, "email")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "email", event.target.value)}
                                    placeholder="Contact email"
                                />
                                <Textarea
                                    value={getStringConfig(section, "address")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "address", event.target.value)}
                                    placeholder="Office address"
                                    rows={4}
                                    className="min-h-[120px]"
                                />
                                <Textarea
                                    value={getStringConfig(section, "hours")}
                                    onChange={(event) => updateConfigField(section.sectionKey, "hours", event.target.value)}
                                    placeholder="Opening hours"
                                    rows={4}
                                    className="min-h-[120px]"
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {inactiveSections.length > 0 && (
                <div className="rounded-[1.4rem] border border-dashed border-[rgba(148,102,46,0.22)] bg-[rgba(255,248,233,0.54)] p-6">
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-slate-800">Stored but not rendered on the homepage</h2>
                        <p className="text-sm text-slate-600">
                            These section records still exist in the database, but the public renderer no longer reads them.
                            They stay visible here so we do not silently lose older content.
                        </p>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {inactiveSections.map((section) => (
                            <div key={section.sectionKey} className="rounded-[1rem] border border-[rgba(148,102,46,0.18)] bg-white px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-800">
                                        {SECTION_LABELS[section.sectionKey] || section.sectionKey}
                                    </span>
                                    <Badge variant="warning">Runtime unused</Badge>
                                </div>
                                <p className="mt-2 text-sm text-slate-500">
                                    VI: {section.vi.title || "No Vietnamese title"} | EN: {section.en.title || "No English title"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
