"use client";

import { useEffect, useState } from "react";
import { Globe, Info, Loader2, Save, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface Settings {
    site_name: string;
    site_name_en: string;
    logo_url: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    contact_address_en: string;
    social_facebook: string;
    social_youtube: string;
    social_zalo: string;
    social_tiktok: string;
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    [key: string]: unknown;
}

const defaultSettings: Settings = {
    site_name: "",
    site_name_en: "",
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    contact_address_en: "",
    social_facebook: "",
    social_youtube: "",
    social_zalo: "",
    social_tiktok: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
};

export default function SettingsManager() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((response) => response.json())
            .then((result) => {
                if (result.success) {
                    setSettings({ ...defaultSettings, ...result.data });
                } else {
                    setMessage("Unable to load site settings.");
                }
            })
            .catch(() => {
                setMessage("Unable to load site settings.");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (field: string, value: string) => {
        setSettings((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings }),
            });
            const result = await response.json();
            if (result.success) {
                setMessage("Site settings updated.");
            } else {
                setMessage(result.error || "Unable to save site settings.");
            }
        } catch {
            setMessage("Unable to save site settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading site settings...</div>;
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-800">Global Site Settings</h1>
                    <p className="text-sm text-slate-500">
                        Shared brand, contact, social, and default SEO settings for the public site.
                    </p>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save changes
                        </>
                    )}
                </Button>
            </div>

            {message && (
                <div className="rounded-[1rem] border border-[rgba(26,72,164,0.12)] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    {message}
                </div>
            )}

            <div className="flex gap-6 border-b border-slate-200">
                <button
                    className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === "general"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setActiveTab("general")}
                >
                    <Info className="h-4 w-4" />
                    General
                </button>
                <button
                    className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === "social"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setActiveTab("social")}
                >
                    <Share2 className="h-4 w-4" />
                    Social
                </button>
                <button
                    className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                        activeTab === "seo"
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setActiveTab("seo")}
                >
                    <Search className="h-4 w-4" />
                    SEO
                </button>
            </div>

            <div className="min-h-[400px] rounded-[1.3rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm">
                {activeTab === "general" && (
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="border-b border-slate-100 pb-2 font-semibold text-slate-800">Brand</h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Site name (VI)</label>
                                <Input value={settings.site_name} onChange={(event) => handleChange("site_name", event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Site name (EN)</label>
                                <Input value={settings.site_name_en} onChange={(event) => handleChange("site_name_en", event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Site logo</label>
                                <ImageUpload
                                    value={settings.logo_url}
                                    onChange={(url) => handleChange("logo_url", url)}
                                    folder="settings"
                                    className="h-32"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b border-slate-100 pb-2 font-semibold text-slate-800">Contact</h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Contact email</label>
                                <Input value={settings.contact_email} onChange={(event) => handleChange("contact_email", event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Contact phone</label>
                                <Input value={settings.contact_phone} onChange={(event) => handleChange("contact_phone", event.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Address (VI)</label>
                                <Textarea
                                    value={settings.contact_address}
                                    onChange={(event) => handleChange("contact_address", event.target.value)}
                                    rows={3}
                                    className="min-h-[110px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Address (EN)</label>
                                <Textarea
                                    value={settings.contact_address_en}
                                    onChange={(event) => handleChange("contact_address_en", event.target.value)}
                                    rows={3}
                                    className="min-h-[110px]"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "social" && (
                    <div className="max-w-2xl space-y-4">
                        <h3 className="border-b border-slate-100 pb-2 font-semibold text-slate-800">Social links</h3>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Globe className="h-4 w-4 text-blue-600" />
                                Facebook URL
                            </label>
                            <Input value={settings.social_facebook} onChange={(event) => handleChange("social_facebook", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Globe className="h-4 w-4 text-red-600" />
                                YouTube URL
                            </label>
                            <Input value={settings.social_youtube} onChange={(event) => handleChange("social_youtube", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Globe className="h-4 w-4 text-cyan-600" />
                                Zalo URL
                            </label>
                            <Input value={settings.social_zalo} onChange={(event) => handleChange("social_zalo", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Globe className="h-4 w-4 text-slate-700" />
                                TikTok URL
                            </label>
                            <Input value={settings.social_tiktok} onChange={(event) => handleChange("social_tiktok", event.target.value)} />
                        </div>
                    </div>
                )}

                {activeTab === "seo" && (
                    <div className="max-w-2xl space-y-4">
                        <h3 className="border-b border-slate-100 pb-2 font-semibold text-slate-800">Default SEO</h3>
                        <p className="text-sm text-slate-500">
                            These values act as the shared fallback for homepage and content modules that do not have specific SEO overrides.
                        </p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Meta title</label>
                            <Input value={settings.seo_title} onChange={(event) => handleChange("seo_title", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Meta description</label>
                            <Textarea
                                value={settings.seo_description}
                                onChange={(event) => handleChange("seo_description", event.target.value)}
                                rows={4}
                                className="min-h-[130px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Meta keywords</label>
                            <Input value={settings.seo_keywords} onChange={(event) => handleChange("seo_keywords", event.target.value)} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
