"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Globe, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function CreatePartnerPage() {
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Create is only allowed from VI mode
    useEffect(() => {
        if (locale === "en") router.replace("/admin/vi/partners/create");
    }, [locale, router]);

    const [formData, setFormData] = useState({
        name: "",
        website: "",
        description: "",
        logo: "",
        isActive: true,
    });

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) { setError("Tên đối tác là bắt buộc."); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/partners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/partners`);
            else setError(data.error || "Không thể tạo đối tác.");
        } catch { setError("Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/partners`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Thêm đối tác mới</h1>
                        <p className="text-slate-500">Thêm logo đối tác hoặc khách hàng.</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                    {loading ? "Đang lưu..." : <><Save className="w-4 h-4" />Lưu đối tác</>}
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Logo đối tác</h3>
                <ImageUpload
                    value={formData.logo}
                    onChange={(url) => handleChange("logo", url)}
                    folder="partners"
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Thông tin đối tác</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Tên đơn vị <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Nhập tên đối tác..."
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mô tả</label>
                        <Input
                            placeholder="Mô tả ngắn về đối tác..."
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                        />
                    </div>
                </div>
                {/* Shared fields */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Globe className="w-4 h-4 text-white" /> Website</label>
                    <Input type="url" placeholder="https://..." value={formData.website} onChange={(e) => handleChange("website", e.target.value)} />
                </div>
                <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isActive" className="w-4 h-4" checked={formData.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />
                    <label htmlFor="isActive" className="text-sm text-slate-700">Hiển thị trên website</label>
                </div>
            </div>
        </form>
    );
}
