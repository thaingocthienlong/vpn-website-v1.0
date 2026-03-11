"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Languages } from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        title_en: "",
        slug: "",
        content: "",
        content_en: "",
        isPublished: true,
        sortOrder: 0,
        metaTitle: "",
        metaDescription: "",
    });

    useEffect(() => {
        fetch(`/api/admin/services/${id}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const s = data.data;
                    setFormData({
                        title: s.title || "",
                        title_en: s.title_en || "",
                        slug: s.slug || "",
                        content: s.content || "",
                        content_en: s.content_en || "",
                        isPublished: s.isPublished ?? true,
                        sortOrder: s.sortOrder || 0,
                        metaTitle: s.metaTitle || "",
                        metaDescription: s.metaDescription || "",
                    });
                } else {
                    setNotFound(true);
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setFetching(false));
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
            if (data.success) router.push(`/admin/${locale}/services`);
            else setError(data.error || (isEn ? "Failed to update." : "Không thể cập nhật."));
        } catch { setError(isEn ? "Connection error." : "Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Are you sure you want to delete this service?" : "Bạn có chắc chắn muốn xóa dịch vụ này?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/services`);
            else alert(data.error || (isEn ? "Failed to delete." : "Không thể xóa."));
        } catch { alert(isEn ? "Connection error." : "Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    if (fetching) {
        return <FormSkeleton />;
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h2 className="text-xl font-bold text-slate-800">{isEn ? "Service not found" : "Không tìm thấy dịch vụ"}</h2>
                <Link href={`/admin/${locale}/services`}><Button>{isEn ? "Back to list" : "Quay lại danh sách"}</Button></Link>
            </div>
        );
    }

    const otherLocale = isEn ? "vi" : "en";

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/services`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Edit Service (EN)" : "Chỉnh sửa dịch vụ"}</h1>
                        <p className="text-slate-500">ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/admin/${otherLocale}/services/${id}`}>
                        <Button variant="outline" type="button" className="gap-2">
                            <Languages className="w-4 h-4" />
                            {isEn ? "🇻🇳 Sửa tiếng Việt" : "🇬🇧 Edit English"}
                        </Button>
                    </Link>
                    {!isEn && (
                        <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" type="button" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />Xóa
                        </Button>
                    )}
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                        {loading ? (isEn ? "Saving..." : "Đang lưu...") : <><Save className="w-4 h-4" />{isEn ? "Update" : "Cập nhật"}</>}
                    </Button>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Service Information (EN)" : "Thông tin dịch vụ"}
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Service Name (EN)" : "Tên dịch vụ"}
                                    {!isEn && <span className="text-red-500"> *</span>}
                                </label>
                                <Input
                                    placeholder={isEn ? "Enter service name in English..." : "Nhập tên dịch vụ..."}
                                    value={isEn ? formData.title_en : formData.title}
                                    onChange={(e) => handleChange(isEn ? "title_en" : "title", e.target.value)}
                                    required={!isEn}
                                />
                            </div>
                            {!isEn && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">/dich-vu/</span>
                                        <Input className="rounded-l-none" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Detailed Content (EN)" : "Nội dung chi tiết"}
                        </h3>
                        <RichTextEditor
                            value={isEn ? formData.content_en : formData.content}
                            onChange={(value) => handleChange(isEn ? "content_en" : "content", value)}
                            placeholder={isEn ? "Detailed service description in English..." : "Mô tả chi tiết dịch vụ..."}
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    {/* EN info box */}
                    {isEn && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
                            <h3 className="font-bold text-blue-800 text-sm">🇬🇧 English Translation</h3>
                            <p className="text-xs text-blue-700">You are editing the English translation. Shared settings (publish status, sort order, SEO) are managed in the Vietnamese version.</p>
                            <Link href={`/admin/vi/services/${id}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                <Languages className="w-3 h-3" /> Go to Vietnamese version →
                            </Link>
                        </div>
                    )}

                    {/* Config — only in VI */}
                    {!isEn && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Cấu hình</h3>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isPublished" className="w-4 h-4" checked={formData.isPublished} onChange={(e) => handleChange("isPublished", e.target.checked)} />
                                <label htmlFor="isPublished" className="text-sm text-slate-700">Công khai</label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Thứ tự</label>
                                <Input type="number" value={formData.sortOrder} onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)} />
                            </div>
                        </div>
                    )}

                    {/* SEO — only in VI */}
                    {!isEn && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">SEO</h3>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Meta Title</label>
                                <Input placeholder="Tiêu đề SEO..." value={formData.metaTitle} onChange={(e) => handleChange("metaTitle", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Meta Description</label>
                                <Textarea placeholder="Mô tả SEO..." rows={3} value={formData.metaDescription} onChange={(e) => handleChange("metaDescription", e.target.value)} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
