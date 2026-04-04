"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Trash2,
    Globe,
    Loader2,
    Languages,
} from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { generateSlug } from "@/lib/utils";
import TagSelector, { type TagOption } from "@/components/admin/post/TagSelector";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface PostResponse {
    success: boolean;
    data?: {
        title: string;
        title_en?: string | null;
        slug: string;
        categoryId: string;
        excerpt?: string | null;
        excerpt_en?: string | null;
        content: string;
        content_en?: string | null;
        featuredImage?: { url: string } | null;
        featuredImage_en?: { url: string } | null;
        isPublished: boolean;
        isFeatured: boolean;
        metaTitle?: string | null;
        metaTitle_en?: string | null;
        metaDescription?: string | null;
        metaDescription_en?: string | null;
        tags?: Array<{ tag: TagOption }>;
    };
    error?: string | { message?: string };
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
    const [tags, setTags] = useState<TagOption[]>([]);

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
        tagIds: [] as string[],
    });

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/posts/${id}`).then((response) => response.json()),
            fetch("/api/admin/categories?type=POST").then((response) => response.json()),
            fetch("/api/admin/tags").then((response) => response.json()),
        ])
            .then(([postResult, categoryResult, tagResult]: [PostResponse, { success: boolean; data?: Category[] }, { success: boolean; data?: TagOption[] }]) => {
                if (!postResult.success || !postResult.data) {
                    setNotFound(true);
                    return;
                }

                const post = postResult.data;
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
                    tagIds: post.tags?.map((entry) => entry.tag.id) || [],
                });

                if (categoryResult.success && categoryResult.data) setCategories(categoryResult.data);
                if (tagResult.success && tagResult.data) setTags(tagResult.data);
            })
            .catch(() => setNotFound(true))
            .finally(() => setFetching(false));
    }, [id]);

    const handleChange = (field: string, value: unknown) => {
        setFormData((current) => {
            const updates: Record<string, unknown> = { [field]: value };
            if (field === "title" && !isEn) {
                updates.slug = generateSlug(value as string);
            }
            return { ...current, ...updates };
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/admin/posts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result: PostResponse = await response.json();

            if (result.success) {
                router.push(`/admin/${locale}/posts`);
            } else {
                const message = typeof result.error === "string" ? result.error : result.error?.message;
                alert(message || (isEn ? "Unable to update post." : "Không thể cập nhật bài viết."));
            }
        } catch {
            alert(isEn ? "Connection error. Please try again." : "Lỗi kết nối. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Delete this post?" : "Bạn có chắc chắn muốn xóa bài viết này không?")) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
            const result = await response.json();
            if (result.success) {
                router.push(`/admin/${locale}/posts`);
            } else {
                alert(result.error?.message || result.error || (isEn ? "Unable to delete post." : "Không thể xóa bài viết."));
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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/posts`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEn ? "Edit post translation" : "Edit post"}
                        </h1>
                        <p className="text-slate-500 text-xs font-mono">{id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/admin/${otherLocale}/posts/${id}`}>
                        <Button variant="outline" type="button" className="gap-2">
                            <Languages className="w-4 h-4" />
                            {isEn ? "Open Vietnamese" : "Open English"}
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
                            Delete
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
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Translation fields" : "General information"}
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Post title (EN)" : "Post title"}
                                </label>
                                <Input
                                    value={isEn ? formData.title_en : formData.title}
                                    onChange={(event) => handleChange(isEn ? "title_en" : "title", event.target.value)}
                                    required={!isEn}
                                />
                            </div>

                            {!isEn && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Slug</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                                            /tin-tuc/
                                        </span>
                                        <Input
                                            className="rounded-l-none"
                                            value={formData.slug}
                                            onChange={(event) => handleChange("slug", event.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Excerpt (EN)" : "Excerpt"}
                                </label>
                                <RichTextEditor
                                    placeholder={isEn ? "Short English summary..." : "Short Vietnamese summary..."}
                                    value={isEn ? formData.excerpt_en : formData.excerpt}
                                    onChange={(value) => handleChange(isEn ? "excerpt_en" : "excerpt", value)}
                                    variant="mini"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Detailed content (EN)" : "Detailed content"}
                        </h3>
                        <RichTextEditor
                            value={isEn ? formData.content_en : formData.content}
                            onChange={(value) => handleChange(isEn ? "content_en" : "content", value)}
                            placeholder={isEn ? "Write the English article..." : "Write the Vietnamese article..."}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {!isEn ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Publishing</h3>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Category</label>
                                <select
                                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.categoryId}
                                    onChange={(event) => handleChange("categoryId", event.target.value)}
                                >
                                    <option value="">-- Select category --</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Tags</label>
                                <TagSelector
                                    tags={tags}
                                    selectedIds={formData.tagIds}
                                    onChange={(tagIds) => handleChange("tagIds", tagIds)}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="isPublished" className="w-4 h-4" checked={formData.isPublished} onChange={(event) => handleChange("isPublished", event.target.checked)} />
                                <label htmlFor="isPublished" className="text-sm text-slate-700">Published</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isFeatured" className="w-4 h-4" checked={formData.isFeatured} onChange={(event) => handleChange("isFeatured", event.target.checked)} />
                                <label htmlFor="isFeatured" className="text-sm text-slate-700">Featured post</label>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
                            <h3 className="font-bold text-blue-800 text-sm">English translation mode</h3>
                            <p className="text-xs text-blue-700">
                                Category, tags, and publication state are shared with the Vietnamese source post.
                            </p>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Featured image (EN)" : "Featured image"}
                        </h3>
                        <ImageUpload
                            value={isEn ? formData.featuredImage_en : formData.featuredImage}
                            onChange={(url) => handleChange(isEn ? "featuredImage_en" : "featuredImage", url)}
                            folder="posts"
                        />
                        <Input
                            placeholder={isEn ? "Or paste an English image URL..." : "Or paste an image URL..."}
                            value={isEn ? formData.featuredImage_en : formData.featuredImage}
                            onChange={(event) => handleChange(isEn ? "featuredImage_en" : "featuredImage", event.target.value)}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" /> SEO
                        </h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">{isEn ? "Meta title (EN)" : "Meta title"}</label>
                                <Input
                                    value={isEn ? formData.metaTitle_en : formData.metaTitle}
                                    onChange={(event) => handleChange(isEn ? "metaTitle_en" : "metaTitle", event.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">{isEn ? "Meta description (EN)" : "Meta description"}</label>
                                <Textarea
                                    rows={3}
                                    value={isEn ? formData.metaDescription_en : formData.metaDescription}
                                    onChange={(event) => handleChange(isEn ? "metaDescription_en" : "metaDescription", event.target.value)}
                                    className="min-h-[120px]"
                                />
                            </div>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <div className="truncate text-lg font-medium text-blue-700">
                                {(isEn ? formData.metaTitle_en : formData.metaTitle) || (isEn ? formData.title_en : formData.title) || "Post title"}
                            </div>
                            <div className="truncate text-xs text-green-700">sisrd.edu.vn/tin-tuc/{formData.slug}</div>
                            <div className="mt-1 line-clamp-2 text-sm text-slate-600">
                                {(isEn ? formData.metaDescription_en : formData.metaDescription) ||
                                    (isEn ? formData.excerpt_en : formData.excerpt) ||
                                    "Post description preview..."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
