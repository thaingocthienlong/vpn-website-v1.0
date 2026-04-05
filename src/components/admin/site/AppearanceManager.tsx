"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers3, Loader2, Palette, Save, SlidersHorizontal } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
    type AppearanceAdminPayload,
    type AppearancePreset,
    type AppearanceRuntimeConfig,
    type AppearanceTargetDefinition,
    type AppearanceTokenGroup,
} from "@/lib/appearance/schema";

type AppearanceApiResponse = {
    success: boolean;
    data?: AppearanceAdminPayload;
    error?: string;
};

const PRESET_FIELDS: Array<{
    key: Exclude<keyof AppearancePreset, "id" | "label">;
    label: string;
    group: AppearanceTokenGroup;
}> = [
    { key: "surfaceBackground", label: "Surface Background", group: "surfaceBackground" },
    { key: "titleColor", label: "Title Color", group: "titleColor" },
    { key: "bodyColor", label: "Body Color", group: "bodyColor" },
    { key: "badgeColor", label: "Badge Color", group: "badgeColor" },
    { key: "accentColor", label: "Accent Color", group: "accentColor" },
    { key: "titleSize", label: "Title Size", group: "titleSize" },
    { key: "bodySize", label: "Body Size", group: "bodySize" },
];

const EMPTY_PAYLOAD: AppearanceAdminPayload = {
    tokens: {
        surfaceBackground: {},
        titleColor: {},
        bodyColor: {},
        badgeColor: {},
        accentColor: {},
        titleSize: {},
        bodySize: {},
    },
    presets: {},
    assignments: {},
    tokenGroups: [],
    targets: [],
};

function makePresetId(label: string, index: number) {
    const normalized = label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    return normalized || `custom-preset-${index}`;
}

export default function AppearanceManager() {
    const [payload, setPayload] = useState<AppearanceAdminPayload>(EMPTY_PAYLOAD);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"tokens" | "presets" | "assignments">("tokens");

    useEffect(() => {
        fetch("/api/admin/appearance")
            .then((response) => response.json())
            .then((result: AppearanceApiResponse) => {
                if (result.success && result.data) {
                    setPayload(result.data);
                    return;
                }

                setMessage(result.error || "Unable to load appearance settings.");
            })
            .catch(() => {
                setMessage("Unable to load appearance settings.");
            })
            .finally(() => setLoading(false));
    }, []);

    const groupedTargets = useMemo(() => {
        const groups = new Map<string, AppearanceTargetDefinition[]>();

        for (const target of payload.targets) {
            const bucket = groups.get(target.family) || [];
            bucket.push(target);
            groups.set(target.family, bucket);
        }

        return Array.from(groups.entries());
    }, [payload.targets]);

    const presetEntries = useMemo(
        () => Object.values(payload.presets).sort((left, right) => left.label.localeCompare(right.label)),
        [payload.presets],
    );

    const handleTokenChange = (group: AppearanceTokenGroup, tokenId: string, value: string) => {
        setPayload((current) => ({
            ...current,
            tokens: {
                ...current.tokens,
                [group]: {
                    ...current.tokens[group],
                    [tokenId]: value,
                },
            },
        }));
    };

    const handlePresetChange = (
        presetId: string,
        field: keyof AppearancePreset,
        value: string,
    ) => {
        setPayload((current) => ({
            ...current,
            presets: {
                ...current.presets,
                [presetId]: {
                    ...current.presets[presetId],
                    id: presetId,
                    [field]: value,
                },
            },
        }));
    };

    const addPreset = () => {
        setPayload((current) => {
            const nextIndex = Object.keys(current.presets).length + 1;
            const id = makePresetId(`custom preset ${nextIndex}`, nextIndex);

            return {
                ...current,
                presets: {
                    ...current.presets,
                    [id]: {
                        id,
                        label: `Custom Preset ${nextIndex}`,
                    },
                },
            };
        });
    };

    const handleAssignmentChange = (targetId: string, presetId: string) => {
        setPayload((current) => ({
            ...current,
            assignments: {
                ...current.assignments,
                [targetId]: presetId,
            },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        const config: AppearanceRuntimeConfig = {
            tokens: payload.tokens,
            presets: payload.presets,
            assignments: payload.assignments,
        };

        try {
            const response = await fetch("/api/admin/appearance", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });

            const result: AppearanceApiResponse = await response.json();
            if (result.success && result.data) {
                setPayload(result.data);
                setMessage("Appearance settings updated.");
                return;
            }

            setMessage(result.error || "Unable to save appearance settings.");
        } catch {
            setMessage("Unable to save appearance settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 rounded-[1.6rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(26,72,164,0.12)] bg-[rgba(220,233,255,0.46)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent-strong)]">
                        <Palette className="h-3.5 w-3.5" />
                        Site / Appearance
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Appearance System</h1>
                    <p className="max-w-3xl text-sm text-slate-500">
                        Manage semantic tokens, reusable presets, and target assignments for the main public site.
                    </p>
                </div>
                <Button className="min-w-[140px] gap-2 bg-blue-600 text-white hover:bg-blue-700" onClick={handleSave} disabled={saving}>
                    {saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save changes
                        </>
                    )}
                </Button>
            </div>

            {message && (
                <div className="rounded-[1.2rem] border border-[rgba(26,72,164,0.12)] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    {message}
                </div>
            )}

            <div className="flex gap-6 border-b border-slate-200">
                <button
                    className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === "tokens"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setActiveTab("tokens")}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Tokens
                </button>
                <button
                    className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === "presets"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setActiveTab("presets")}
                >
                    <Palette className="h-4 w-4" />
                    Presets
                </button>
                <button
                    className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === "assignments"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setActiveTab("assignments")}
                >
                    <Layers3 className="h-4 w-4" />
                    Assignments
                </button>
            </div>

            {activeTab === "tokens" && (
                <div className="space-y-5">
                    {payload.tokenGroups.map((group) => {
                        const groupEntries = Object.entries(payload.tokens[group.id]).sort(([left], [right]) => left.localeCompare(right));

                        return (
                            <section
                                key={group.id}
                                className="rounded-[1.4rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm"
                            >
                                <div className="space-y-1 border-b border-slate-100 pb-4">
                                    <h2 className="text-lg font-semibold text-slate-800">{group.label}</h2>
                                    <p className="text-sm text-slate-500">{group.description}</p>
                                </div>

                                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                                    {groupEntries.map(([tokenId, tokenValue]) => (
                                        <div key={tokenId} className="space-y-2 rounded-[1.1rem] border border-slate-100 bg-slate-50/60 p-4">
                                            <label className="text-sm font-semibold text-slate-700">{tokenId}</label>
                                            {group.input === "background" ? (
                                                <Textarea
                                                    value={tokenValue}
                                                    onChange={(event) => handleTokenChange(group.id, tokenId, event.target.value)}
                                                    rows={3}
                                                    className="min-h-[96px]"
                                                />
                                            ) : (
                                                <Input
                                                    value={tokenValue}
                                                    onChange={(event) => handleTokenChange(group.id, tokenId, event.target.value)}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            )}

            {activeTab === "presets" && (
                <div className="space-y-5">
                    <div className="flex justify-end">
                        <Button variant="outline" onClick={addPreset}>Add preset</Button>
                    </div>

                    <div className="space-y-5">
                        {presetEntries.map((preset, index) => (
                            <section
                                key={preset.id}
                                className="rounded-[1.4rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm"
                            >
                                <div className="grid gap-4 border-b border-slate-100 pb-4 md:grid-cols-[minmax(220px,0.7fr)_1fr]">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Preset label</label>
                                        <Input
                                            value={preset.label}
                                            onChange={(event) => handlePresetChange(preset.id, "label", event.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Preset ID</label>
                                        <Input
                                            value={preset.id}
                                            readOnly
                                            onFocus={(event) => event.currentTarget.select()}
                                        />
                                        <p className="text-xs text-slate-500">
                                            Generated ID: {makePresetId(preset.label, index + 1)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {PRESET_FIELDS.map((field) => (
                                        <label key={`${preset.id}-${field.key}`} className="space-y-2">
                                            <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                                            <select
                                                value={preset[field.key] || ""}
                                                onChange={(event) => handlePresetChange(preset.id, field.key, event.target.value)}
                                                className="flex h-11 w-full rounded-[1rem] border border-[rgba(26,72,164,0.12)] bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-blue-500"
                                            >
                                                <option value="">Use component default</option>
                                                {Object.keys(payload.tokens[field.group]).sort().map((tokenId) => (
                                                    <option key={`${field.group}.${tokenId}`} value={`${field.group}.${tokenId}`}>
                                                        {tokenId}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === "assignments" && (
                <div className="space-y-5">
                    {groupedTargets.map(([family, targets]) => (
                        <section
                            key={family}
                            className="rounded-[1.4rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm"
                        >
                            <div className="space-y-1 border-b border-slate-100 pb-4">
                                <h2 className="text-lg font-semibold text-slate-800">{family}</h2>
                                <p className="text-sm text-slate-500">
                                    Stable target assignments for this family of public UI elements.
                                </p>
                            </div>

                            <div className="mt-5 space-y-4">
                                {targets.map((target) => (
                                    <div
                                        key={target.id}
                                        className="grid gap-4 rounded-[1.1rem] border border-slate-100 bg-slate-50/60 p-4 md:grid-cols-[minmax(0,1fr)_280px]"
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-800">{target.label}</p>
                                            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{target.id}</p>
                                            <p className="text-sm text-slate-500">{target.description}</p>
                                        </div>

                                        <label className="space-y-2">
                                            <span className="text-sm font-semibold text-slate-700">Preset</span>
                                            <select
                                                value={payload.assignments[target.id] || target.defaultPresetId}
                                                onChange={(event) => handleAssignmentChange(target.id, event.target.value)}
                                                className="flex h-11 w-full rounded-[1rem] border border-[rgba(26,72,164,0.12)] bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition-colors focus:border-blue-500"
                                            >
                                                {presetEntries.map((preset) => (
                                                    <option key={`${target.id}-${preset.id}`} value={preset.id}>
                                                        {preset.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
