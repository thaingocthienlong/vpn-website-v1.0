"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Mail, Phone, Briefcase, Building } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface StaffTypeOption { id: string; name: string; }
interface DepartmentOption { id: string; name: string; }

export default function CreateStaffPage() {
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [staffTypes, setStaffTypes] = useState<StaffTypeOption[]>([]);
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);

    // Create is only allowed from VI mode
    useEffect(() => {
        if (locale === "en") router.replace("/admin/vi/advisory/create");
    }, [locale, router]);

    const [formData, setFormData] = useState({
        name: "",
        title: "",
        email: "",
        phone: "",
        bio: "",
        avatar: "",
        staffTypeId: "",
        departmentId: "",
        sortOrder: 0,
        isActive: true,
    });

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/staff-types").then(r => r.json()),
            fetch("/api/admin/departments").then(r => r.json()),
        ]).then(([typesData, deptsData]) => {
            if (typesData.success) setStaffTypes(typesData.data);
            if (deptsData.success) setDepartments(deptsData.data);
        }).catch(console.error);
    }, []);

    const handleChange = (field: string, value: string | boolean | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.staffTypeId) {
            setError("Họ tên và loại nhân sự là bắt buộc.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/advisory`);
            else setError(data.error || "Không thể tạo nhân sự.");
        } catch { setError("Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/advisory`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Thêm thành viên hội đồng mới</h1>
                        <p className="text-slate-500">Tạo hồ sơ Hội đồng Cố vấn Khoa học.</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                    {loading ? "Đang lưu..." : <><Save className="w-4 h-4" />Lưu hồ sơ</>}
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Thông tin cá nhân</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Nhập họ và tên..."
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-white" />
                                    Chức danh
                                </label>
                                <Input
                                    placeholder="VD: Viện trưởng"
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Tiểu sử / Giới thiệu</label>
                                <RichTextEditor
                                    value={formData.bio}
                                    onChange={(value) => handleChange("bio", value)}
                                    placeholder="Nhập tiểu sử..."
                                />
                            </div>
                        </div>
                        {/* Shared fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Building className="w-4 h-4 text-white" /> Loại nhân sự <span className="text-red-500">*</span></label>
                                <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.staffTypeId} onChange={(e) => handleChange("staffTypeId", e.target.value)} required>
                                    <option value="">-- Chọn loại --</option>
                                    {staffTypes.map(t => (<option key={t.id} value={t.id}>{t.name}</option>))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Building className="w-4 h-4 text-white" /> Phòng ban</label>
                                <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.departmentId} onChange={(e) => handleChange("departmentId", e.target.value)}>
                                    <option value="">-- Không thuộc phòng ban --</option>
                                    {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
                                <Input type="number" value={formData.sortOrder} onChange={(e) => handleChange("sortOrder", parseInt(e.target.value) || 0)} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Mail className="w-4 h-4 text-white" /> Email</label>
                                <Input type="email" placeholder="email@sisrd.edu.vn" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Phone className="w-4 h-4 text-white" /> Điện thoại</label>
                                <Input placeholder="090..." value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Ảnh đại diện</h3>
                        <ImageUpload
                            value={formData.avatar}
                            onChange={(url) => handleChange("avatar", url)}
                            folder="staff"
                        />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Trạng thái</h3>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isActive" className="w-4 h-4" checked={formData.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />
                            <label htmlFor="isActive" className="text-sm text-slate-700">Hoạt động (hiển thị trên website)</label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
