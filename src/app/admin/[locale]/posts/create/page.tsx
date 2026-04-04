"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Globe, Loader2, Save } from "lucide-react";
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
    type: string;
}

export default function CreatePostPage() {
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<TagOption[]>([]);

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
        featuredImage_en: "",
        isPublished: false,
        isFeatured: false,
        metaTitle: "",
        metaDescription: "",
        tagIds: [] as string[],
    });

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/categories?type=POST").then((response) => response.json()),
            fetch("/api/admin/tags").then((response) => response.json()),
        ])
            .then(([categoryResult, tagResult]) => {
                if (categoryResult.success) setCategories(categoryResult.data);
                if (tagResult.success) setTags(tagResult.data);
            })
            .catch(console.error);
    }, []);

    const handleChange = (field: string, value: unknown) => {
        setFormData((current) => {
            const updates: Record<string, unknown> = { [field]: value };
            if (field === "title") {
                updates.slug = generateSlug(value as string);
            }
            return { ...current, ...updates };
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/admin/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                router.push(`/admin/${locale}/posts`);
            } else {
                alert(result.error?.message || result.error || "Unable to create post.");
            }
        } catch {
            alert("Connection error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-2xl font-bold text-slate-800">Create post</h1>
                        <p className="text-slate-500">Create the Vietnamese source post and assign the tags used by the public news detail page.</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save post
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">General information</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Post title</label>
                                <Input value={formData.title} onChange={(event) => handleChange("title", event.target.value)} required />
                            </div>

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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Excerpt</label>
                                <RichTextEditor
                                    placeholder="Short summary for cards and previews..."
                                    value={formData.excerpt}
                                    onChange={(value) => handleChange("excerpt", value)}
                                    variant="mini"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Detailed content</h3>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(value) => handleChange("content", value)}
                            placeholder="Write the full article..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
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
                            <input
                                type="checkbox"
                                id="isPublished"
                                className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                checked={formData.isPublished}
                                onChange={(event) => handleChange("isPublished", event.target.checked)}
                            />
                            <label htmlFor="isPublished" className="text-sm text-slate-700 cursor-pointer">
                                Publish immediately
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                className="w-4 h-4 text-blue-600 rounded border-slate-300"
                                checked={formData.isFeatured}
                                onChange={(event) => handleChange("isFeatured", event.target.checked)}
                            />
                            <label htmlFor="isFeatured" className="text-sm text-slate-700 cursor-pointer">
                                Mark as featured
                            </label>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Featured image</h3>

                        <ImageUpload
                            value={formData.featuredImage}
                            onChange={(url) => handleChange("featuredImage", url)}
                            folder="posts"
                        />
                        <Input
                            placeholder="Or paste an image URL..."
                            value={formData.featuredImage}
                            onChange={(event) => handleChange("featuredImage", event.target.value)}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-500" />
                            SEO
                        </h3>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Meta title</label>
                                <Input value={formData.metaTitle} onChange={(event) => handleChange("metaTitle", event.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Meta description</label>
                                <Textarea
                                    rows={3}
                                    value={formData.metaDescription}
                                    onChange={(event) => handleChange("metaDescription", event.target.value)}
                                    className="min-h-[120px]"
                                />
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                            <div className="truncate text-lg font-medium text-blue-700">
                                {formData.metaTitle || formData.title || "Post title"}
                            </div>
                            <div className="truncate text-xs text-green-700">
                                sisrd.edu.vn/tin-tuc/{formData.slug || "post-slug"}
                            </div>
                            <div className="mt-1 line-clamp-2 text-sm text-slate-600">
                                {formData.metaDescription || formData.excerpt || "Post description preview..."}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
