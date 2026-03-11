"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Languages, UsersRound } from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function EditStaffTypePage({ params }: { params: Promise<{ id: string }> }) {
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
        level: 99,
        sortOrder: 0,
        isAdvisory: false,
    });

    useEffect(() => {
        fetch(`/api/admin/staff-types/${id}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    const type = d.data;
                    setFormData({
                        name: type.name || "",
                        name_en: type.name_en || "",
                        level: type.level ?? 99,
                        sortOrder: type.sortOrder || 0,
                        isAdvisory: type.isAdvisory ?? false,
                    });
                } else setError(isEn ? "Staff type not found." : "Không tìm thấy loại nhân sự.");
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
            const res = await fetch(`/api/admin/staff-types/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/staff-types`);
            else setError(data.error || (isEn ? "Failed to update." : "Không thể cập nhật."));
        } catch { setError(isEn ? "Connection error." : "Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Are you sure you want to delete this staff type?" : "Bạn có chắc chắn muốn xóa loại nhân sự này?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/staff-types/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (res.ok && data.success) router.push(`/admin/${locale}/staff-types`);
            else alert(data.error || (isEn ? "Failed to delete." : "Không thể xóa. Có phải nó đã bị gắn vào hồ sơ nhân sự rồi không?"));
        } catch { alert(isEn ? "Connection error." : "Lỗi kết nối."); }
        finally { setLoading(false); }
    };

    if (fetching) return <FormSkeleton />;
    if (error && !formData.name) return <div className="flex flex-col items-center justify-center min-h-[400px] gap-4"><h2 className="text-xl font-bold text-slate-800">{error}</h2><Link href={`/admin/${locale}/staff-types`}><Button>{isEn ? "Back" : "Quay lại"}</Button></Link></div>;

    const otherLocale = isEn ? "vi" : "en";

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/staff-types`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Edit Staff Type (EN)" : "Chỉnh sửa loại nhân sự"}</h1>
                        <p className="text-slate-500 text-xs font-mono">{id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/admin/${otherLocale}/staff-types/${id}`}>
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
                    <UsersRound className="w-5 h-5 text-white" />
                    {isEn ? "Staff Type Information (EN)" : "Thông tin phân loại"}
                </h3>

                {/* EN info box */}
                {isEn && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-1">
                        <p className="text-xs text-blue-700">🇬🇧 You are editing English translations. Shared settings are in the Vietnamese version.</p>
                        <Link href={`/admin/vi/staff-types/${id}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                            <Languages className="w-3 h-3" /> Go to Vietnamese version →
                        </Link>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            {isEn ? "Staff Type Name (EN)" : "Tên loại nhân sự"}
                            {!isEn && <span className="text-red-500"> *</span>}
                        </label>
                        <Input
                            placeholder={isEn ? "Enter staff type name in English..." : "Nhập tên loại nhân sự..."}
                            value={isEn ? formData.name_en : formData.name}
                            onChange={(e) => handleChange(isEn ? "name_en" : "name", e.target.value)}
                            required={!isEn}
                        />
                    </div>
                </div>

                {!isEn && (
                    <>
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-medium text-slate-700">Cấp độ (1: Cao nhất)</label>
                            <Input
                                type="number"
                                value={formData.level}
                                onChange={(e) => handleChange("level", parseInt(e.target.value) || 99)}
                            />
                            <p className="text-xs text-slate-500">Cấp độ dùng để phân định ưu tiên, Level 1 là Ban Cố vấn / Viện Trưởng, mức độ giảm dần theo số.</p>
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
                            <input type="checkbox" id="isAdvisory" className="w-4 h-4" checked={formData.isAdvisory} onChange={(e) => handleChange("isAdvisory", e.target.checked)} />
                            <label htmlFor="isAdvisory" className="text-sm text-slate-700">Thuộc danh sách Hội đồng Cố vấn Khoa học</label>
                        </div>
                    </>
                )}
            </div>
        </form>
    );
}
