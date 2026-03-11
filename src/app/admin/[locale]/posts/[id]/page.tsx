"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Trash2,
    Globe,
    Loader2,
    Languages
} from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { generateSlug } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    slug: string;
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notFound, setNotFound] = useState(false);
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
        isPublished: false,
        isFeatured: false,
        metaTitle: "",
        metaTitle_en: "",
        metaDescription: "",
        metaDescription_en: "",
    });

    // Load post data and categories
    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/posts/${id}`).then((r) => r.json()),
            fetch("/api/admin/categories?type=POST").then((r) => r.json()),
        ])
            .then(([postData, catData]) => {
                if (postData.success) {
                    const post = postData.data;
                    setFormData({
                        title: post.title || "",
                        title_en: post.title_en || "",
                        slug: post.slug || "",
                        categoryId: post.categoryId || "",
                        excerpt: post.excerpt || "",
                        excerpt_en: post.excerpt_en || "",
                        content: post.content || "",
                        content_en: post.content_en || "",
                        featuredImage: post.featuredImage?.url || "",
                        featuredImage_en: post.featuredImage_en?.url || "",
                        isPublished: post.isPublished ?? false,
                        isFeatured: post.isFeatured ?? false,
                        metaTitle: post.metaTitle || "",
                        metaTitle_en: post.metaTitle_en || "",
                        metaDescription: post.metaDescription || "",
                        metaDescription_en: post.metaDescription_en || "",
                    });
                } else {
                    setNotFound(true);
                }
                if (catData.success) setCategories(catData.data);
            })
            .catch(() => setNotFound(true))
            .finally(() => setFetching(false));
    }, [id]);

    const handleChange = (field: string, value: unknown) => {
        setFormData((prev) => {
            const updates: Record<string, unknown> = { [field]: value };
            // Auto-generate slug when title changes (only in VI mode)
            if (field === "title" && !isEn) {
                updates.slug = generateSlug(value as string);
            }
            return { ...prev, ...updates };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/posts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (data.success) {
                router.push(`/admin/${locale}/posts`);
            } else {
                alert(data.error || (isEn ? "Failed to update post" : "Không thể cập nhật bài viết"));
            }
        } catch {
            alert(isEn ? "Connection error. Please try again." : "Lỗi kết nối. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Are you sure you want to delete this post?" : "Bạn có chắc chắn muốn xóa bài viết này không?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
            if (res.ok) {
                router.push(`/admin/${locale}/posts`);
            } else {
                alert(isEn ? "Failed to delete post." : "Không thể xóa bài viết.");
            }
        } catch {
            alert(isEn ? "Connection error." : "Lỗi kết nối.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <FormSkeleton />;
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <h2 className="text-xl font-bold text-slate-800">{isEn ? "Post not found" : "Không tìm thấy bài viết"}</h2>
                <Link href={`/admin/${locale}/posts`}>
                    <Button>{isEn ? "Back to list" : "Quay lại danh sách"}</Button>
                </Link>
            </div>
        );
    }

    const otherLocale = isEn ? "vi" : "en";

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/posts`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEn ? "Edit Post (EN)" : "Chỉnh sửa bài viết"}
                        </h1>
                        <p className="text-slate-500 text-xs font-mono">{id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {/* Cross-locale link */}
                    <Link href={`/admin/${otherLocale}/posts/${id}`}>
                        <Button variant="outline" type="button" className="gap-2">
                            <Languages className="w-4 h-4" />
                            {isEn ? "🇻🇳 Sửa tiếng Việt" : "🇬🇧 Edit English"}
                        </Button>
                    </Link>
                    {!isEn && (
                        <Button
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            type="button"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                        </Button>
                    )}
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isEn ? "Saving..." : "Đang lưu..."}
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEn ? "Update" : "Cập nhật"}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "General Information (EN)" : "Thông tin chung"}
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Title (EN)" : "Tiêu đề"}
                                    {!isEn && <span className="text-red-500"> *</span>}
                                </label>
                                <Input
                                    placeholder={isEn ? "Enter title in English..." : "Nhập tiêu đề..."}
                                    value={isEn ? formData.title_en : formData.title}
                                    onChange={(e) => handleChange(isEn ? "title_en" : "title", e.target.value)}
                                    required={!isEn}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">/tin-tuc/</span>
                                    <Input className="rounded-l-none" value={formData.slug} onChange={(e) => handleChange("slug", e.target.value)} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Short Description (EN)" : "Mô tả ngắn (Excerpt)"}
                                </label>
                                <RichTextEditor
                                    placeholder={isEn ? "Brief description in English..." : "Mô tả ngắn gọn..."}
                                    value={isEn ? formData.excerpt_en : formData.excerpt}
                                    onChange={(value) => handleChange(isEn ? "excerpt_en" : "excerpt", value)}
                                    variant="mini"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Detailed Content (EN)" : "Nội dung chi tiết"}
                        </h3>
                        <RichTextEditor
                            value={isEn ? formData.content_en : formData.content}
                            onChange={(value) => handleChange(isEn ? "content_en" : "content", value)}
                            placeholder={isEn ? "Write content in English..." : "Soạn thảo nội dung..."}
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publish Settings */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Publish" : "Xuất bản"}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">
                                    {isEn ? "Category" : "Danh mục"}
                                </label>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.categoryId}
                                    onChange={(e) => handleChange("categoryId", e.target.value)}
                                >
                                    <option value="">{isEn ? "-- Select category --" : "-- Chọn danh mục --"}</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="isPublished" className="w-4 h-4 text-blue-600 rounded border-slate-300" checked={formData.isPublished} onChange={(e) => handleChange("isPublished", e.target.checked)} />
                                <label htmlFor="isPublished" className="text-sm text-slate-700 cursor-pointer">
                                    {isEn ? "Published" : "Đã xuất bản"}
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isFeatured" className="w-4 h-4 text-blue-600 rounded border-slate-300" checked={formData.isFeatured} onChange={(e) => handleChange("isFeatured", e.target.checked)} />
                                <label htmlFor="isFeatured" className="text-sm text-slate-700 cursor-pointer">
                                    {isEn ? "Featured post" : "Tin nổi bật"}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* EN info box */}
                    {isEn && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
                            <h3 className="font-bold text-blue-800 text-sm">🇬🇧 English Translation</h3>
                            <p className="text-xs text-blue-700">You are editing the English translation. Title, excerpt, and content fields edit the English version.</p>
                            <Link href={`/admin/vi/posts/${id}`} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
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
                            folder="posts"
                        />
                        <div className="mt-2">
                            <Input
                                placeholder={isEn ? "Or enter image URL..." : "Hoặc nhập URL hình ảnh..."}
                                value={isEn ? formData.featuredImage_en : formData.featuredImage}
                                onChange={(e) => handleChange(isEn ? "featuredImage_en" : "featuredImage", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" /> SEO
                        </h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">{isEn ? "Meta Title (EN)" : "Meta Title"}</label>
                                <Input value={isEn ? formData.metaTitle_en : formData.metaTitle} onChange={(e) => handleChange(isEn ? "metaTitle_en" : "metaTitle", e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">{isEn ? "Meta Description (EN)" : "Meta Description"}</label>
                                <Textarea rows={2} value={isEn ? formData.metaDescription_en : formData.metaDescription} onChange={(e) => handleChange(isEn ? "metaDescription_en" : "metaDescription", e.target.value)} />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-blue-700 text-lg font-medium truncate">{(isEn ? formData.metaTitle_en : formData.metaTitle) || (isEn ? formData.title_en : formData.title) || (isEn ? "Title" : "Tiêu đề")}</div>
                            <div className="text-green-700 text-xs truncate">sisrd.edu.vn/tin-tuc/{formData.slug}</div>
                            <div className="text-slate-600 text-sm mt-1 line-clamp-2">{(isEn ? formData.metaDescription_en : formData.metaDescription) || (isEn ? formData.excerpt_en : formData.excerpt) || (isEn ? "Description..." : "Mô tả...")}</div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
