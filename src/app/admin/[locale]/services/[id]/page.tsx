"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EditServicePage() {
    const router = useRouter();
    const { locale, id } = useParams<{ locale: string; id: string }>();
    const isEn = locale === "en";

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        title_en: "",
        slug: "",
        excerpt: "",
        excerpt_en: "",
        iconName: "",
        sortOrder: 0,
        isActive: true,
    });

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await fetch(`/api/admin/services/${id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    const s = data.data;
                    setFormData({
                        title: s.title || "",
                        title_en: s.title_en || "",
                        slug: s.slug || "",
                        excerpt: s.excerpt || "",
                        excerpt_en: s.excerpt_en || "",
                        iconName: s.iconName || "",
                        sortOrder: s.sortOrder || 0,
                        isActive: s.isActive ?? true,
                    });
                } else {
                    setError("Không tìm thấy dịch vụ.");
                }
            } catch {
                setError("Lỗi kết nối.");
            } finally {
                setFetching(false);
            }
        };
        fetchService();
    }, [id]);

    const handleChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        
        try {
            const res = await fetch(`/api/admin/services/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/admin/${locale}/services`);
                router.refresh();
            } else {
                setError(data.error || "Không thể cập nhật.");
            }
        } catch { setError("Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    if (fetching) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/services`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa dịch vụ</h1>
                        <p className="text-slate-500">Cập nhật thông tin dịch vụ.</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Cập nhật
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">{isEn ? "English Content" : "Tiếng Việt"}</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{isEn ? "Service Name (EN)" : "Tên dịch vụ"}</label>
                            <Input
                                value={isEn ? formData.title_en : formData.title}
                                onChange={(e) => handleChange(isEn ? "title_en" : "title", e.target.value)}
                                required={!isEn}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{isEn ? "Short Description (EN)" : "Mô tả ngắn"}</label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                value={isEn ? formData.excerpt_en : formData.excerpt}
                                onChange={(e) => handleChange(isEn ? "excerpt_en" : "excerpt", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {!isEn && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Cài đặt chung</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Đường dẫn (URL)</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">/dich-vu/</span>
                                    <Input className="rounded-l-none" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Icon (từ Lucide)</label>
                                <Input
                                    placeholder="Ví dụ: Monitor, ShieldCheck, Zap..."
                                    value={formData.iconName}
                                    onChange={(e) => handleChange("iconName", e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="isActive" className="w-4 h-4" checked={formData.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />
                                <label htmlFor="isActive" className="text-sm text-slate-700">Hiển thị trên website</label>
                            </div>
                            <div className="space-y-2 mt-4">
                                <label className="text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
                                <Input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
}
