"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Mail, Phone, Briefcase, Building, Languages } from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface StaffTypeOption { id: string; name: string; }
interface DepartmentOption { id: string; name: string; }

export default function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [staffTypes, setStaffTypes] = useState<StaffTypeOption[]>([]);
    const [departments, setDepartments] = useState<DepartmentOption[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        name_en: "",
        title: "",
        title_en: "",
        email: "",
        phone: "",
        bio: "",
        bio_en: "",
        avatar: "",
        avatar_en: "",
        staffTypeId: "",
        departmentId: "",
        sortOrder: 0,
        isActive: true,
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/staff/${id}`).then(r => r.json()),
            fetch("/api/admin/staff-types").then(r => r.json()),
            fetch("/api/admin/departments").then(r => r.json()),
        ]).then(([staffData, typesData, deptsData]) => {
            if (staffData.success) {
                const s = staffData.data;
                setFormData({
                    name: s.name || "",
                    name_en: s.name_en || "",
                    title: s.title || "",
                    title_en: s.title_en || "",
                    email: s.email || "",
                    phone: s.phone || "",
                    bio: s.bio || "",
                    bio_en: s.bio_en || "",
                    staffTypeId: s.staffTypeId || "",
                    departmentId: s.departmentId || "",
                    sortOrder: s.sortOrder || 0,
                    isActive: s.isActive ?? true,
                    avatar: s.avatar?.url || "",
                    avatar_en: s.avatar_en?.url || "",
                });
            } else setError(isEn ? "Staff member not found." : "Không tìm thấy nhân sự.");
            if (typesData.success) setStaffTypes(typesData.data);
            if (deptsData.success) setDepartments(deptsData.data);
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
            const res = await fetch(`/api/admin/staff/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/advisory`);
            else setError(data.error || (isEn ? "Failed to update." : "Không thể cập nhật."));
        } catch { setError(isEn ? "Connection error." : "Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Are you sure you want to delete?" : "Bạn có chắc chắn muốn xóa?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
            if (res.ok) router.push(`/admin/${locale}/advisory`);
            else alert(isEn ? "Failed to delete." : "Không thể xóa.");
        } catch { alert(isEn ? "Connection error." : "Lỗi kết nối."); }
        finally { setLoading(false); }
    };

    if (fetching) return <FormSkeleton />;
    if (error && !formData.name) return <div className="flex flex-col items-center justify-center min-h-[400px] gap-4"><h2 className="text-xl font-bold text-slate-800">{error}</h2><Link href={`/admin/${locale}/advisory`}><Button>{isEn ? "Back" : "Quay lại"}</Button></Link></div>;

    const otherLocale = isEn ? "vi" : "en";

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/advisory`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Edit Advisory (EN)" : "Chỉnh sửa thành viên hội đồng"}</h1>
                        <p className="text-slate-500 text-xs font-mono">{id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/admin/${otherLocale}/advisory/${id}`}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Personal Information (EN)" : "Thông tin cá nhân"}
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Full Name (EN)" : "Họ và tên"}
                                    {!isEn && <span className="text-red-500"> *</span>}
                                </label>
                                <Input
                                    placeholder={isEn ? "Enter full name in English..." : "Nhập họ và tên..."}
                                    value={isEn ? formData.name_en : formData.name}
                                    onChange={(e) => handleChange(isEn ? "name_en" : "name", e.target.value)}
                                    required={!isEn}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-white" />
                                    {isEn ? "Position (EN)" : "Chức danh"}
                                </label>
                                <Input
                                    placeholder={isEn ? "e.g. Director" : "VD: Viện trưởng"}
                                    value={isEn ? formData.title_en : formData.title}
                                    onChange={(e) => handleChange(isEn ? "title_en" : "title", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Biography (EN)" : "Tiểu sử"}
                                </label>
                                <RichTextEditor
                                    value={isEn ? formData.bio_en : formData.bio}
                                    onChange={(v) => handleChange(isEn ? "bio_en" : "bio", v)}
                                    placeholder={isEn ? "Enter biography in English..." : "Nhập tiểu sử..."}
                                />
                            </div>
                        </div>

                        {/* Shared fields — only in VI */}
                        {!isEn && (
                            <>
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
                                        <Input type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2"><Phone className="w-4 h-4 text-white" /> Điện thoại</label>
                                        <Input value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="space-y-6">
                    {/* EN info box */}
                    {isEn && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
                            <h3 className="font-bold text-blue-800 text-sm">🇬🇧 English Translation</h3>
                            <p className="text-xs text-blue-700">You are editing the English translation. Shared settings (contact info, department, status) are managed in the Vietnamese version.</p>
                            <Link href={`/admin/vi/advisory/${id}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                <Languages className="w-3 h-3" /> Go to Vietnamese version →
                            </Link>
                        </div>
                    )}

                    {/* Avatar */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Avatar (EN)" : "Ảnh đại diện"}
                        </h3>
                        <ImageUpload
                            value={isEn ? formData.avatar_en : formData.avatar}
                            onChange={(url) => handleChange(isEn ? "avatar_en" : "avatar", url)}
                            folder="staff"
                        />
                    </div>

                    {/* Status — only in VI */}
                    {!isEn && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Trạng thái</h3>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isActive" className="w-4 h-4" checked={formData.isActive} onChange={(e) => handleChange("isActive", e.target.checked)} />
                                <label htmlFor="isActive" className="text-sm text-slate-700">Hoạt động</label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
