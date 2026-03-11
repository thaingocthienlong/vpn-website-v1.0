"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CreateStaffTypePage() {
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Create is only allowed from VI mode
    useEffect(() => {
        if (locale === "en") router.replace("/admin/vi/staff-types/create");
    }, [locale, router]);

    const [formData, setFormData] = useState({
        name: "",
        level: 99,
        sortOrder: 0,
        isAdvisory: false,
    });

    const handleChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) { setError("Tên loại nhân sự là bắt buộc."); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/staff-types", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/staff-types`);
            else setError(data.error || "Không thể tạo loại nhân sự.");
        } catch { setError("Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/staff-types`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Thêm loại nhân sự mới</h1>
                        <p className="text-slate-500">Thêm loại nhân sự để phân tích và quản lý nhân viên.</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                    {loading ? "Đang lưu..." : <><Save className="w-4 h-4" />Lưu loại nhân sự</>}
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <UsersRound className="w-5 h-5 text-white" />
                    Thông tin phân loại
                </h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">
                            Tên phân loại <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Nhập tên phân loại..."
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Cấp độ (1: Cao nhất)</label>
                        <Input
                            type="number"
                            value={formData.level}
                            onChange={(e) => handleChange("level", parseInt(e.target.value) || 99)}
                        />
                        <p className="text-xs text-slate-500">Cấp độ dùng để phân định ưu tiên, Level 1 là Ban Cố vấn / Viện Trưởng, mức độ giảm dần theo số.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Thứ tự ưu tiên hiển thị</label>
                        <Input
                            type="number"
                            value={formData.sortOrder}
                            onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>
                {/* Shared fields */}
                <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" id="isAdvisory" className="w-4 h-4" checked={formData.isAdvisory} onChange={(e) => handleChange("isAdvisory", e.target.checked)} />
                    <label htmlFor="isAdvisory" className="text-sm text-slate-700">Thuộc danh sách Hội đồng Cố vấn Khoa học</label>
                </div>
            </div>
        </form>
    );
}
