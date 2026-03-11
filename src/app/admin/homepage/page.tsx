"use client";

import { useState, useEffect } from "react";
import { Save, GripVertical, Eye, EyeOff, Settings } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface HomepageSection {
    id: string;
    sectionKey: string;
    locale: string;
    title: string | null;
    subtitle: string | null;
    isEnabled: boolean;
    sortOrder: number;
    config: string | null;
}

const SECTION_LABELS: Record<string, string> = {
    hero: "🏠 Hero Banner",
    reviews: "⭐ Đánh giá",
    partners: "🤝 Đối tác",
    services: "🔧 Dịch vụ",
    video: "🎬 Video",
    training: "📚 Đào tạo",
    news: "📰 Tin tức",
    gallery: "🖼️ Thư viện ảnh",
    cta: "📢 Call to Action",
    contact: "📞 Liên hệ",
};

export default function HomepagePage() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("/api/admin/homepage")
            .then(r => r.json())
            .then(data => {
                if (data.success) setSections(data.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleSection = (index: number) => {
        setSections(prev => prev.map((s, i) =>
            i === index ? { ...s, isEnabled: !s.isEnabled } : s
        ));
    };

    const updateTitle = (index: number, title: string) => {
        setSections(prev => prev.map((s, i) =>
            i === index ? { ...s, title } : s
        ));
    };

    const saveAll = async () => {
        setSaving(true);
        setMessage("");
        try {
            for (const section of sections) {
                await fetch("/api/admin/homepage", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: section.id,
                        isEnabled: section.isEnabled,
                        sortOrder: section.sortOrder,
                        title: section.title,
                        subtitle: section.subtitle,
                    }),
                });
            }
            setMessage("✅ Đã lưu thành công!");
        } catch {
            setMessage("❌ Lỗi khi lưu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý Trang chủ</h1>
                    <p className="text-slate-500">Bật/tắt và cấu hình từng section của trang chủ.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={saveAll} disabled={saving}>
                    {saving ? "Đang lưu..." : <><Save className="w-4 h-4" />Lưu thay đổi</>}
                </Button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm ${message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {message}
                </div>
            )}

            {sections.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                    <Settings className="w-12 h-12 text-white mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-700">Chưa có section nào</h3>
                    <p className="text-slate-500 mt-2">Các section trang chủ sẽ được tạo tự động khi seed database.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sections.map((section, index) => (
                        <div key={section.id} className={`bg-white rounded-xl shadow-sm border ${section.isEnabled ? "border-blue-200" : "border-slate-200"} p-4 transition-all`}>
                            <div className="flex items-center gap-4">
                                <GripVertical className="w-5 h-5 text-white cursor-grab" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-slate-800">
                                            {SECTION_LABELS[section.sectionKey] || section.sectionKey}
                                        </span>
                                        <Badge variant={section.isEnabled ? "success" : "secondary"}>
                                            {section.isEnabled ? "Bật" : "Tắt"}
                                        </Badge>
                                        <span className="text-xs text-white font-mono">{section.locale}</span>
                                    </div>
                                    <div className="mt-2">
                                        <Input
                                            placeholder="Tiêu đề section..."
                                            value={section.title || ""}
                                            onChange={(e) => updateTitle(index, e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSection(index)}
                                    className={`p-2 rounded-lg transition-colors ${section.isEnabled
                                        ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        : "bg-slate-50 text-white hover:bg-slate-100"
                                        }`}
                                >
                                    {section.isEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
