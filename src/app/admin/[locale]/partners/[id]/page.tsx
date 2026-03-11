"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Globe, Languages } from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        name_en: "",
        website: "",
        description: "",
        description_en: "",
        logo: "",
        logo_en: "",
        isActive: true,
    });

    useEffect(() => {
        fetch(`/api/admin/partners/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    const p = d.data;
                    setFormData({
                        name: p.name || "",
                        name_en: p.name_en || "",
                        website: p.website || "",
                        description: p.description || "",
                        description_en: p.description_en || "",
                        logo: p.logo?.url || "",
                        logo_en: p.logo_en?.url || "",
                        isActive: p.isActive ?? true,
                    });
                } else setError(isEn ? "Partner not found." : "Không tìm thấy đối tác.");
            })
            .catch(() => setError(isEn ? "Connection error." : "Lỗi kết nối."))
            .finally(() => setFetching(false));
    }, [id, isEn]);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/partners/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/partners`);
            else setError(data.error || (isEn ? "Failed to update." : "Không thể cập nhật."));
        } catch { setError(isEn ? "Connection error." : "Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Are you sure you want to delete this partner?" : "Bạn có chắc chắn muốn xóa đối tác này?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
            if (res.ok) router.push(`/admin/${locale}/partners`);
            else alert(isEn ? "Failed to delete." : "Không thể xóa.");
        } catch { alert(isEn ? "Connection error." : "Lỗi kết nối."); }
        finally { setLoading(false); }
    };

    if (fetching) return <FormSkeleton />;
    if (error && !formData.name) return <div className="flex flex-col items-center justify-center min-h-[400px] gap-4"><h2 className="text-xl font-bold text-slate-800">{error}</h2><Link href={`/admin/${locale}/partners`}><Button>{isEn ? "Back" : "Quay lại"}</Button></Link></div>;

    const otherLocale = isEn ? "vi" : "en";

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/partners`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Edit Partner (EN)" : "Chỉnh sửa đối tác"}</h1>
                        <p className="text-slate-500 text-xs font-mono">{id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/admin/${otherLocale}/partners/${id}`}>
                        <Button variant="outline" type="button" className="gap-2">
                            <Languages className="w-4 h-4" />
                            {isEn ? "🇻🇳 Sửa tiếng Việt" : "🇬🇧 Edit English"}
                        </Button>
                    </Link>
                    {!isEn && (
                        <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" type="button" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" />Xóa</Button>
                    )}
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                        {loading ? (isEn ? "Saving..." : "Đang lưu...") : <><Save className="w-4 h-4" />{isEn ? "Update" : "Cập nhật"}</>}
                    </Button>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                    {isEn ? "Partner Information (EN)" : "Thông tin đối tác"}
                </h3>

                {/* EN info box */}
                {isEn && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-1">
                        <p className="text-xs text-blue-700">🇬🇧 You are editing English translations. Shared settings are in the Vietnamese version.</p>
                        <Link href={`/admin/vi/partners/${id}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                            <Languages className="w-3 h-3" /> Go to Vietnamese version →
                        </Link>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {isEn ? "Partner Name (EN)" : "Tên đơn vị"}
                            {!isEn && <span className="text-red-500"> *</span>}
                        </label>
                        <Input
                            placeholder={isEn ? "Enter partner name in English..." : "Nhập tên đối tác..."}
                            value={isEn ? formData.name_en : formData.name}
                            onChange={(e) => handleChange(isEn ? "name_en" : "name", e.target.value)}
                            required={!isEn}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {isEn ? "Description (EN)" : "Mô tả"}
                        </label>
                        <Input
                            placeholder={isEn ? "Brief description in English..." : "Mô tả ngắn về đối tác..."}
                            value={isEn ? formData.description_en : formData.description}
                            onChange={(e) => handleChange(isEn ? "description_en" : "description", e.target.value)}
                        />
                    </div>
                </div>

                {/* Logo */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-medium text-slate-700">
                        {isEn ? "Partner Logo (EN)" : "Logo đối tác"}
                    </h4>
                    <ImageUpload
                        value={isEn ? formData.logo_en : formData.logo}
                        onChange={(url) => handleChange(isEn ? "logo_en" : "logo", url)}
                        folder="partners"
                    />
                </div>

                {/* Shared fields — only in VI */}
                {!isEn && (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Globe className="w-4 h-4 text-white" /> Website</label>
                            <Input type="url" value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="isActive" className="w-4 h-4" checked={formData.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />
                            <label htmlFor="isActive" className="text-sm text-slate-700">Hiển thị</label>
                        </div>
                    </>
                )}
            </div>
        </form>
    );
}
