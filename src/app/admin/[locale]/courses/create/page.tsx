"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { generateSlug } from "@/lib/utils";

interface Category { id: string; name: string }

export default function CreateCoursePage() {
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    // Create is only allowed from VI mode
    useEffect(() => {
        if (locale === "en") router.replace("/admin/vi/courses/create");
    }, [locale, router]);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        categoryId: "",
        excerpt: "",
        content: "",
        featuredImage: "",
        type: "SHORT_COURSE",
        isPublished: false,
        isFeatured: false,
        isRegistrationOpen: true,
    });

    useEffect(() => {
        fetch("/api/admin/categories?type=COURSE")
            .then(r => r.json())
            .then(d => { if (d.success) setCategories(d.data); })
            .catch(console.error);
    }, []);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => {
            const updates: Record<string, string | boolean> = { [field]: value };
            if (field === "title" && !prev.slug) updates.slug = generateSlug(value as string);
            return { ...prev, ...updates };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.slug) { setError("Tên và slug là bắt buộc."); return; }
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/courses`);
            else setError(data.error || "Không thể tạo khóa học.");
        } catch { setError("Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/courses`}>
                        <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Thêm khóa học mới</h1>
                        <p className="text-slate-500">Tạo chương trình đào tạo mới.</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                    {loading ? "Đang lưu..." : <><Save className="w-4 h-4" />Lưu khóa học</>}
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Thông tin cơ bản</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Tên khóa học <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Nhập tên khóa học..."
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Slug (URL) <span className="text-red-500">*</span></label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">/dao-tao/</span>
                                    <Input className="rounded-l-none" placeholder="ten-khoa-hoc" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
                                <RichTextEditor
                                    placeholder="Mô tả ngắn gọn về khóa học..."
                                    value={formData.excerpt}
                                    onChange={(value) => handleChange("excerpt", value)}
                                    variant="full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Nội dung chi tiết</h3>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(value) => handleChange("content", value)}
                            placeholder="Nội dung chi tiết khóa học, đề cương..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Featured Image */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Hình đại diện</h3>
                        <ImageUpload
                            value={formData.featuredImage}
                            onChange={(url) => handleChange("featuredImage", url)}
                            folder="courses"
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Cấu hình</h3>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Loại khóa học</label>
                            <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.type} onChange={(e) => handleChange("type", e.target.value)}>
                                <option value="ADMISSION">Tuyển sinh</option>
                                <option value="SHORT_COURSE">Bồi dưỡng ngắn hạn</option>
                                <option value="STUDY_ABROAD">Du học</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Danh mục</label>
                            <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)}>
                                <option value="">— Chọn danh mục —</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="isPublished" className="w-4 h-4 text-blue-600 rounded" checked={formData.isPublished} onChange={(e) => handleChange("isPublished", e.target.checked)} />
                            <label htmlFor="isPublished" className="text-sm text-slate-700 cursor-pointer">Xuất bản ngay</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isFeatured" className="w-4 h-4 text-blue-600 rounded" checked={formData.isFeatured} onChange={(e) => handleChange("isFeatured", e.target.checked)} />
                            <label htmlFor="isFeatured" className="text-sm text-slate-700 cursor-pointer">Khóa học nổi bật</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isRegistrationOpen" className="w-4 h-4 text-blue-600 rounded" checked={formData.isRegistrationOpen} onChange={(e) => handleChange("isRegistrationOpen", e.target.checked)} />
                            <label htmlFor="isRegistrationOpen" className="text-sm text-slate-700 cursor-pointer">Mở đăng ký</label>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
