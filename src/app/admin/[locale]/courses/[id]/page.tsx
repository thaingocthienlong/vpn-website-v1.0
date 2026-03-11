"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Trash2, Languages } from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface Category { id: string; name: string }

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        title_en: "",
        slug: "",
        categoryId: "",
        excerpt: "",
        excerpt_en: "",
        content: "",
        content_en: "",
        featuredImage: "",
        featuredImage_en: "",
        featuredImageId: "",
        featuredImageId_en: "",
        type: "SHORT_COURSE",
        isPublished: false,
        isFeatured: false,
        isRegistrationOpen: true,
        metaTitle: "",
        metaTitle_en: "",
        metaDescription: "",
        metaDescription_en: "",
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/courses/${id}`).then(r => r.json()),
            fetch("/api/admin/categories?type=COURSE").then(r => r.json()),
        ]).then(([courseData, catData]) => {
            if (courseData.success) {
                const c = courseData.data;
                setFormData({
                    title: c.title || "",
                    title_en: c.title_en || "",
                    slug: c.slug || "",
                    categoryId: c.categoryId || "",
                    excerpt: c.excerpt || "",
                    excerpt_en: c.excerpt_en || "",
                    content: c.content || "",
                    content_en: c.content_en || "",
                    type: c.type || "SHORT_COURSE",
                    isPublished: c.isPublished || false,
                    isFeatured: c.isFeatured || false,
                    isRegistrationOpen: c.isRegistrationOpen ?? true,
                    featuredImage: c.featuredImage?.url || "",
                    featuredImage_en: c.featuredImage_en?.url || "",
                    featuredImageId: c.featuredImageId || "",
                    featuredImageId_en: c.featuredImageId_en || "",
                    metaTitle: c.metaTitle || "",
                    metaTitle_en: c.metaTitle_en || "",
                    metaDescription: c.metaDescription || "",
                    metaDescription_en: c.metaDescription_en || "",
                });
            } else {
                setError(isEn ? "Course not found." : "Không tìm thấy khóa học.");
            }
            if (catData.success) setCategories(catData.data);
        }).catch(() => setError(isEn ? "Connection error." : "Lỗi kết nối."))
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
            const res = await fetch(`/api/admin/courses/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) router.push(`/admin/${locale}/courses`);
            else setError(data.error || (isEn ? "Failed to update." : "Không thể cập nhật."));
        } catch { setError(isEn ? "Connection error." : "Lỗi kết nối server."); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Are you sure you want to delete this course?" : "Bạn có chắc chắn muốn xóa khóa học này?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
            if (res.ok) router.push(`/admin/${locale}/courses`);
            else alert(isEn ? "Failed to delete." : "Không thể xóa.");
        } catch { alert(isEn ? "Connection error." : "Lỗi kết nối."); }
        finally { setLoading(false); }
    };

    if (fetching) return <FormSkeleton />;
    if (error && !formData.title) return <div className="flex flex-col items-center justify-center min-h-[400px] gap-4"><h2 className="text-xl font-bold text-slate-800">{error}</h2><Link href={`/admin/${locale}/courses`}><Button>{isEn ? "Back to list" : "Quay lại danh sách"}</Button></Link></div>;

    const otherLocale = isEn ? "vi" : "en";

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/courses`}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Edit Course (EN)" : "Chỉnh sửa khóa học"}</h1>
                        <p className="text-slate-500 text-xs font-mono">{id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/admin/${otherLocale}/courses/${id}`}>
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
                            {isEn ? "Basic Information (EN)" : "Thông tin cơ bản"}
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Course Name (EN)" : "Tên khóa học"}
                                    {!isEn && <span className="text-red-500"> *</span>}
                                </label>
                                <Input
                                    placeholder={isEn ? "Enter course name in English..." : "Nhập tên khóa học..."}
                                    value={isEn ? formData.title_en : formData.title}
                                    onChange={(e) => handleChange(isEn ? "title_en" : "title", e.target.value)}
                                    required={!isEn}
                                />
                            </div>
                            {!isEn && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Slug <span className="text-red-500">*</span></label>
                                    <Input value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} required />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Short Description (EN)" : "Mô tả ngắn"}
                                </label>
                                <RichTextEditor
                                    placeholder={isEn ? "Brief description in English..." : "Mô tả ngắn gọn..."}
                                    value={isEn ? formData.excerpt_en : formData.excerpt}
                                    onChange={(value) => handleChange(isEn ? "excerpt_en" : "excerpt", value)}
                                    variant="full"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Content (EN)" : "Nội dung"}
                        </h3>
                        <RichTextEditor
                            value={isEn ? formData.content_en : formData.content}
                            onChange={(v) => handleChange(isEn ? "content_en" : "content", v)}
                            placeholder={isEn ? "Detailed content in English..." : "Nội dung chi tiết..."}
                        />
                    </div>
                </div>
                <div className="space-y-6">
                    {/* EN info box */}
                    {isEn && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
                            <h3 className="font-bold text-blue-800 text-sm">🇬🇧 English Translation</h3>
                            <p className="text-xs text-blue-700">You are editing the English translation. Shared settings (type, category, publish status) are managed in the Vietnamese version.</p>
                            <Link href={`/admin/vi/courses/${id}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
                                <Languages className="w-3 h-3" /> Go to Vietnamese version →
                            </Link>
                        </div>
                    )}

                    {/* Featured Image */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Featured Image (EN)" : "Hình đại diện"}
                        </h3>
                        <ImageUpload
                            value={isEn ? formData.featuredImage_en : formData.featuredImage}
                            onChange={(url) => handleChange(isEn ? "featuredImage_en" : "featuredImage", url)}
                            folder="courses"
                        />
                    </div>

                    {/* Config — only in VI */}
                    {!isEn && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Cấu hình</h3>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Loại</label>
                                <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={formData.type} onChange={(e) => handleChange("type", e.target.value)}>
                                    <option value="ADMISSION">Tuyển sinh</option>
                                    <option value="SHORT_COURSE">Bồi dưỡng</option>
                                    <option value="STUDY_ABROAD">Du học</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Danh mục</label>
                                <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={formData.categoryId} onChange={(e) => handleChange("categoryId", e.target.value)}>
                                    <option value="">— Chọn —</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="isPublished" className="w-4 h-4" checked={formData.isPublished} onChange={(e) => handleChange("isPublished", e.target.checked)} />
                                <label htmlFor="isPublished" className="text-sm text-slate-700">Xuất bản</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isFeatured" className="w-4 h-4" checked={formData.isFeatured} onChange={(e) => handleChange("isFeatured", e.target.checked)} />
                                <label htmlFor="isFeatured" className="text-sm text-slate-700">Nổi bật</label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isRegistrationOpen" className="w-4 h-4" checked={formData.isRegistrationOpen} onChange={(e) => handleChange("isRegistrationOpen", e.target.checked)} />
                                <label htmlFor="isRegistrationOpen" className="text-sm text-slate-700">Mở đăng ký</label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
