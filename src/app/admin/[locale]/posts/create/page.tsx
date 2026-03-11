"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Globe,
    Loader2
} from "lucide-react";
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
    type: string;
}

export default function CreatePostPage() {
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Create is only allowed from VI mode
    useEffect(() => {
        if (locale === "en") router.replace("/admin/vi/posts/create");
    }, [locale, router]);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        categoryId: "",
        excerpt: "",
        content: "",
        featuredImage: "",
        isPublished: false,
        isFeatured: false,
        metaTitle: "",
        metaDescription: "",
    });

    // Load categories
    useEffect(() => {
        fetch("/api/admin/categories?type=POST")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setCategories(data.data);
            })
            .catch(console.error);
    }, []);

    const handleChange = (field: string, value: unknown) => {
        setFormData((prev) => {
            const updates: Record<string, unknown> = { [field]: value };
            if (field === "title") {
                updates.slug = generateSlug(value as string);
            }
            return { ...prev, ...updates };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/admin/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                router.push(`/admin/${locale}/posts`);
            } else {
                alert(data.error || "Không thể tạo bài viết");
            }
        } catch {
            alert("Lỗi kết nối. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-2xl font-bold text-slate-800">Thêm bài viết mới</h1>
                        <p className="text-slate-500">Tạo tin tức, thông báo hoặc sự kiện mới.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Lưu bài viết
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left - 2cols) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Thông tin chung</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Tiêu đề bài viết <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Nhập tiêu đề bài viết..."
                                    value={formData.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Slug (URL) <span className="text-red-500">*</span></label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                                        /tin-tuc/
                                    </span>
                                    <Input
                                        className="rounded-l-none"
                                        placeholder="tieu-de-bai-viet"
                                        value={formData.slug}
                                        onChange={(e) => handleChange("slug", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Mô tả ngắn (Excerpt)</label>
                                <RichTextEditor
                                    placeholder="Mô tả ngắn gọn về nội dung bài viết..."
                                    value={formData.excerpt}
                                    onChange={(value) => handleChange("excerpt", value)}
                                    variant="mini"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Nội dung chi tiết</h3>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(value) => handleChange("content", value)}
                            placeholder="Soạn thảo nội dung bài viết..."
                        />
                    </div>
                </div>

                {/* Sidebar (Right - 1col) */}
                <div className="space-y-6">
                    {/* Status & Visibility */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Xuất bản</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Danh mục</label>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.categoryId}
                                    onChange={(e) => handleChange("categoryId", e.target.value)}
                                >
                                    <option value="">-- Chọn danh mục --</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    checked={formData.isPublished}
                                    onChange={(e) => handleChange("isPublished", e.target.checked)}
                                />
                                <label htmlFor="isPublished" className="text-sm text-slate-700 cursor-pointer">
                                    Xuất bản ngay
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    checked={formData.isFeatured}
                                    onChange={(e) => handleChange("isFeatured", e.target.checked)}
                                />
                                <label htmlFor="isFeatured" className="text-sm text-slate-700 cursor-pointer">
                                    Đánh dấu là Tin nổi bật
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Hình đại diện</h3>

                        <ImageUpload
                            value={formData.featuredImage}
                            onChange={(url) => handleChange("featuredImage", url)}
                            folder="posts"
                        />
                        <div className="mt-2">
                            <Input
                                placeholder="Hoặc nhập URL hình ảnh..."
                                value={formData.featuredImage}
                                onChange={(e) => handleChange("featuredImage", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            SEO Setting
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Meta Title</label>
                                <Input
                                    placeholder="Tiêu đề SEO..."
                                    value={formData.metaTitle}
                                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Meta Description</label>
                                <Textarea
                                    placeholder="Mô tả SEO..."
                                    rows={2}
                                    value={formData.metaDescription}
                                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                                />
                            </div>
                        </div>

                        <p className="text-xs text-slate-500">Preview:</p>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <div className="text-blue-700 text-lg font-medium truncate">
                                {formData.metaTitle || formData.title || "Tiêu đề bài viết"}
                            </div>
                            <div className="text-green-700 text-xs truncate">
                                sisrd.edu.vn/tin-tuc/{formData.slug || "duong-dan-bai-viet"}
                            </div>
                            <div className="text-slate-600 text-sm mt-1 line-clamp-2">
                                {formData.metaDescription || formData.excerpt || "Mô tả ngắn của bài viết..."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
