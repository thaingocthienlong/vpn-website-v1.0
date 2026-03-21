"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { generateSlug } from "@/lib/utils";

export default function CreateServicePage() {
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Create is only allowed from VI mode
    useEffect(() => {
        if (locale === "en") router.replace("/admin/vi/services/create");
    }, [locale, router]);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        iconName: "",
        sortOrder: 0,
        isActive: true,
    });

    const handleChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => {
            const updates: Record<string, unknown> = { [field]: value };
            if (field === "title" && !prev.slug) {
                updates.slug = generateSlug(value as string);
            }
            return { ...prev, ...updates };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.slug) { setError("Tên và đường dẫn là bắt buộc."); return; }
        setLoading(true);
        setError("");
        
        try {
            const res = await fetch("/api/admin/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/admin/${locale}/services`);
                router.refresh();
            } else {
                setError(data.error || "Không thể tạo dịch vụ.");
            }
        } catch { setError("Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/services`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Thêm dịch vụ mới</h1>
                        <p className="text-slate-500">Tạo dịch vụ tư vấn hoặc giải pháp mới.</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu dịch vụ
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Thông tin dịch vụ</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Tên dịch vụ <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="Nhập tên dịch vụ..."
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Đường dẫn (URL) <span className="text-red-500">*</span></label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">/dich-vu/</span>
                            <Input className="rounded-l-none" placeholder="ten-dich-vu" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                            placeholder="Nhập mô tả ngắn về dịch vụ..."
                            value={formData.excerpt}
                            onChange={(e) => handleChange("excerpt", e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Icon (từ Lucide)</label>
                        <Input
                            placeholder="Ví dụ: Monitor, ShieldCheck, Zap..."
                            value={formData.iconName}
                            onChange={(e) => handleChange("iconName", e.target.value)}
                        />
                        <p className="text-xs text-slate-500">Tên biểu tượng từ thư viện Lucide (viết hoa chữ cái đầu).</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Cài đặt</h3>
                <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isActive" className="w-4 h-4" checked={formData.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />
                    <label htmlFor="isActive" className="text-sm text-slate-700">Hiển thị trên website</label>
                </div>
                <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
                    <Input
                        type="number"
                        placeholder="0"
                        value={formData.sortOrder}
                        onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                    />
                </div>
            </div>
        </form>
    );
}
