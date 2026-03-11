"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Globe, Share2, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface Settings {
    // General
    site_name: string;
    site_name_en: string;
    logo_url: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    contact_address_en: string;

    // Social
    social_facebook: string;
    social_youtube: string;
    social_zalo: string;
    social_tiktok: string;

    // SEO
    seo_title: string;
    seo_description: string;
    seo_keywords: string;

    [key: string]: any;
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

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/settings");
            const data = await res.json();
            if (data.success) {
                setSettings({ ...defaultSettings, ...data.data }); // Merge with defaults
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings }),
            });
            const data = await res.json();
            if (data.success) {
                alert("Đã lưu cấu hình thành công!");
            } else {
                alert("Lỗi lưu cấu hình: " + (data.error || "Unknown"));
            }
        } catch (error) {
            alert("Lỗi lưu cấu hình");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Đang tải cấu hình...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Cấu hình hệ thống</h1>
                    <p className="text-slate-500">Quản lý các thông tin chung của website.</p>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
                    {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu</> : <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>}
                </Button>
            </div>

            <div className="flex border-b border-slate-200 gap-6">
                <button
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "general" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    onClick={() => setActiveTab("general")}
                >
                    <div className="flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Thông tin chung
                    </div>
                </button>
                <button
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "social" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    onClick={() => setActiveTab("social")}
                >
                    <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Mạng xã hội
                    </div>
                </button>
                <button
                    className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "seo" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                    onClick={() => setActiveTab("seo")}
                >
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Cấu hình SEO
                    </div>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                {activeTab === "general" && (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-800 border-b pb-2">Thông tin cơ bản</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tên Website (VI)</label>
                                    <Input value={settings.site_name} onChange={e => handleChange("site_name", e.target.value)} placeholder="Tên hiển thị tiếng Việt" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tên Website (EN)</label>
                                    <Input value={settings.site_name_en} onChange={e => handleChange("site_name_en", e.target.value)} placeholder="Display name English" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Logo Website</label>
                                    <ImageUpload
                                        value={settings.logo_url}
                                        onChange={url => handleChange("logo_url", url)}
                                        folder="settings"
                                        className="h-32"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-800 border-b pb-2">Thông tin liên hệ</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email liên hệ</label>
                                    <Input value={settings.contact_email} onChange={e => handleChange("contact_email", e.target.value)} placeholder="contact@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
                                    <Input value={settings.contact_phone} onChange={e => handleChange("contact_phone", e.target.value)} placeholder="+84 ..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Địa chỉ (VI)</label>
                                    <Textarea value={settings.contact_address} onChange={e => handleChange("contact_address", e.target.value)} placeholder="Địa chỉ tiếng Việt" rows={3} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Địa chỉ (EN)</label>
                                    <Textarea value={settings.contact_address_en} onChange={e => handleChange("contact_address_en", e.target.value)} placeholder="Address in English" rows={3} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "social" && (
                    <div className="space-y-6 animate-fadeIn max-w-2xl">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 border-b pb-2">Liên kết mạng xã hội</h3>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-600" /> Facebook URL
                                </label>
                                <Input value={settings.social_facebook} onChange={e => handleChange("social_facebook", e.target.value)} placeholder="https://facebook.com/..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-red-600" /> Youtube URL
                                </label>
                                <Input value={settings.social_youtube} onChange={e => handleChange("social_youtube", e.target.value)} placeholder="https://youtube.com/..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-400" /> Zalo URL
                                </label>
                                <Input value={settings.social_zalo} onChange={e => handleChange("social_zalo", e.target.value)} placeholder="https://zalo.me/..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-black" /> TikTok URL
                                </label>
                                <Input value={settings.social_tiktok} onChange={e => handleChange("social_tiktok", e.target.value)} placeholder="https://tiktok.com/..." />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "seo" && (
                    <div className="space-y-6 animate-fadeIn max-w-2xl">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-800 border-b pb-2">Cấu hình SEO mặc định</h3>
                            <p className="text-sm text-slate-500">Các thông tin này sẽ được sử dụng làm mặc định cho trang chủ và các trang không có cấu hình SEO riêng.</p>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Meta Title (Tiêu đề trang)</label>
                                <Input value={settings.seo_title} onChange={e => handleChange("seo_title", e.target.value)} placeholder="Tiêu đề hiển thị trên Google..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Meta Description (Mô tả)</label>
                                <Textarea value={settings.seo_description} onChange={e => handleChange("seo_description", e.target.value)} placeholder="Mô tả ngắn gọn về website (150-160 ký tự)..." rows={4} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Meta Keywords (Từ khóa)</label>
                                <Input value={settings.seo_keywords} onChange={e => handleChange("seo_keywords", e.target.value)} placeholder="từ khóa 1, từ khóa 2, ..." />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
