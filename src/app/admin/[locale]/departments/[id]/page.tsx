"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Languages, Building } from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EditDepartmentPage({ params }: { params: Promise<{ id: string }> }) {
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
        description: "",
        sortOrder: 0,
        isActive: true,
    });

    useEffect(() => {
        fetch(`/api/admin/departments/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    const dept = d.data;
                    setFormData({
                        name: dept.name || "",
                        name_en: dept.name_en || "",
                        description: dept.description || "",
                        sortOrder: dept.sortOrder || 0,
                        isActive: dept.isActive ?? true,
                    });
                } else setError(isEn ? "Department not found." : "Không tìm thấy phòng ban.");
            })
            .catch(() => setError(isEn ? "Connection error." : "Lỗi kết nối."))
            .finally(() => setFetching(false));
    }, [id, isEn]);

    const handleChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/departments/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/departments`);
            else setError(data.error || (isEn ? "Failed to update." : "Không thể cập nhật."));
        } catch { setError(isEn ? "Connection error." : "Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Are you sure you want to delete this department?" : "Bạn có chắc chắn muốn xóa phòng ban này?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok && data.success) router.push(`/admin/${locale}/departments`);
            else alert(data.error || (isEn ? "Failed to delete." : "Không thể xóa."));
        } catch { alert(isEn ? "Connection error." : "Lỗi kết nối."); }
        finally { setLoading(false); }
    };

    if (fetching) return <FormSkeleton />;
    if (error && !formData.name) return <div className="flex flex-col items-center justify-center min-h-[400px] gap-4"><h2 className="text-xl font-bold text-slate-800">{error}</h2><Link href={`/admin/${locale}/departments`}><Button>{isEn ? "Back" : "Quay lại"}</Button></Link></div>;

    const otherLocale = isEn ? "vi" : "en";

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/departments`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Edit Department (EN)" : "Chỉnh sửa phòng ban"}</h1>
                        <p className="text-slate-500 text-xs font-mono">{id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/admin/${otherLocale}/departments/${id}`}>
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
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-white" />
                    {isEn ? "Department Information (EN)" : "Thông tin phòng ban"}
                </h3>

                {/* EN info box */}
                {isEn && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-1">
                        <p className="text-xs text-blue-700">🇬🇧 You are editing English translations. Shared settings are in the Vietnamese version.</p>
                        <Link href={`/admin/vi/departments/${id}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                            <Languages className="w-3 h-3" /> Go to Vietnamese version →
                        </Link>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {isEn ? "Department Name (EN)" : "Tên phòng ban"}
                            {!isEn && <span className="text-red-500"> *</span>}
                        </label>
                        <Input
                            placeholder={isEn ? "Enter department name in English..." : "Nhập tên phòng ban..."}
                            value={isEn ? formData.name_en : formData.name}
                            onChange={(e) => handleChange(isEn ? "name_en" : "name", e.target.value)}
                            required={!isEn}
                        />
                    </div>
                </div>

                {!isEn && (
                    <>
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-medium text-slate-700">Mô tả giới thiệu</label>
                            <Input
                                placeholder="Mô tả ngắn chức năng..."
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-medium text-slate-700">Thứ tự ưu tiên hiển thị</label>
                            <Input
                                type="number"
                                value={formData.sortOrder}
                                onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                            <input type="checkbox" id="isActive" className="w-4 h-4" checked={formData.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />
                            <label htmlFor="isActive" className="text-sm text-slate-700">Hiển thị trên website</label>
                        </div>
                    </>
                )}
            </div>
        </form>
    );
}
