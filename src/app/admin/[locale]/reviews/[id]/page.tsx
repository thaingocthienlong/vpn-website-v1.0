"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function EditReviewPage() {
    const router = useRouter();
    const { locale, id } = useParams<{ locale: string; id: string }>();
    const isEn = locale === "en";
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        company: "",
        content: "",
        content_en: "",
        avatarId: "",
        rating: 5,
        isActive: true,
        sortOrder: 0,
    });

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await fetch(`/api/admin/reviews/${id}`);
                const data = await res.json();
                if (data.success) {
                    const r = data.data;
                    setFormData({
                        name: r.name || "",
                        role: r.role || "",
                        company: r.company || "",
                        content: r.content || "",
                        content_en: r.content_en || "",
                        avatarId: r.avatarId || "",
                        rating: r.rating || 5,
                        isActive: r.isActive,
                        sortOrder: r.sortOrder || 0,
                    });
                } else {
                    setError("Không tìm thấy đánh giá.");
                }
            } catch {
                setError("Lỗi kết nối.");
            } finally {
                setLoading(false);
            }
        };
        fetchReview();
    }, [id]);

    const handleChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        
        try {
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                router.push(`/admin/${locale}/reviews`);
                router.refresh();
            } else {
                setError(data.error || "Không thể cập nhật.");
            }
        } catch { setError("Lỗi kết nối."); }
        finally { setSaving(false); }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/reviews`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Edit Review (EN)" : "Sửa đánh giá"}</h1>
                        <p className="text-slate-500">{isEn ? "Update review content in English." : "Cập nhật thông tin và nội dung đánh giá."}</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={saving}>
                    {saving ? "Đang lưu..." : <><Save className="w-4 h-4" />Lưu thay đổi</>}
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            {!isEn && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Avatar</h3>
                    <ImageUpload
                        value={formData.avatarId}
                        onChange={(url) => handleChange("avatarId", url)}
                        folder="reviews"
                    />
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Thông tin người đánh giá</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
                        <Input
                            placeholder="Nhập họ tên..."
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            disabled={isEn}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Chức vụ</label>
                            <Input
                                placeholder="VD: Giám đốc"
                                value={formData.role}
                                onChange={(e) => handleChange("role", e.target.value)}
                                disabled={isEn}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Công ty / Tổ chức</label>
                            <Input
                                placeholder="VD: Công ty TNHH ABC"
                                value={formData.company}
                                onChange={(e) => handleChange("company", e.target.value)}
                                disabled={isEn}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Số sao đánh giá (1-5)</label>
                        <Input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.rating}
                            onChange={(e) => handleChange("rating", parseInt(e.target.value) || 5)}
                            disabled={isEn}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Nội dung đánh giá</h3>
                <div className="space-y-4">
                    {(!isEn) && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nội dung (Tiếng Việt) <span className="text-red-500">*</span></label>
                            <textarea
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                placeholder="Nội dung đánh giá..."
                                value={formData.content}
                                onChange={(e) => handleChange("content", e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nội dung (Tiếng Anh)</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                            placeholder="Review content in English..."
                            value={formData.content_en}
                            onChange={(e) => handleChange("content_en", e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {!isEn && (
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
            )}
        </form>
    );
}
