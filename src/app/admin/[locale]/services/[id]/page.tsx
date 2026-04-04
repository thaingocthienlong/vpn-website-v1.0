"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Languages, Save, Trash2 } from "lucide-react";
import { FormSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import ServiceSectionsEditor, { type ServiceSectionFormValue } from "@/components/admin/service/ServiceSectionsEditor";

interface ServiceResponse {
    success: boolean;
    data?: {
        title: string;
        title_en?: string | null;
        slug: string;
        content: string;
        content_en?: string | null;
        isPublished: boolean;
        sortOrder: number;
        metaTitle?: string | null;
        metaTitle_en?: string | null;
        metaDescription?: string | null;
        metaDescription_en?: string | null;
        sections?: Array<{
            sectionKey: string;
            title: string;
            title_en?: string | null;
            content: string;
            content_en?: string | null;
        }>;
    };
    error?: string | { message?: string };
}

function createFallbackSection(): ServiceSectionFormValue {
    return {
        sectionKey: "overview",
        title: "Tổng quan",
        title_en: "",
        content: "",
        content_en: "",
    };
}

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const otherLocale = isEn ? "vi" : "en";

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        title_en: "",
        slug: "",
        content: "",
        content_en: "",
        isPublished: true,
        sortOrder: 0,
        metaTitle: "",
        metaTitle_en: "",
        metaDescription: "",
        metaDescription_en: "",
        sections: [createFallbackSection()] as ServiceSectionFormValue[],
    });

    useEffect(() => {
        fetch(`/api/admin/services/${id}`)
            .then((response) => response.json())
            .then((result: ServiceResponse) => {
                if (!result.success || !result.data) {
                    setNotFound(true);
                    return;
                }

                const service = result.data;
                setFormData({
                    title: service.title || "",
                    title_en: service.title_en || "",
                    slug: service.slug || "",
                    content: service.content || "",
                    content_en: service.content_en || "",
                    isPublished: service.isPublished ?? true,
                    sortOrder: service.sortOrder || 0,
                    metaTitle: service.metaTitle || "",
                    metaTitle_en: service.metaTitle_en || "",
                    metaDescription: service.metaDescription || "",
                    metaDescription_en: service.metaDescription_en || "",
                    sections: service.sections?.length
                        ? service.sections.map((section) => ({
                            sectionKey: section.sectionKey,
                            title: section.title,
                            title_en: section.title_en || "",
                            content: section.content,
                            content_en: section.content_en || "",
                        }))
                        : [createFallbackSection()],
                });
            })
            .catch(() => setNotFound(true))
            .finally(() => setFetching(false));
    }, [id]);

    const handleChange = (field: string, value: string | boolean | number | ServiceSectionFormValue[]) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/admin/services/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result: ServiceResponse = await response.json();
            if (result.success) {
                router.push(`/admin/${locale}/services`);
            } else {
                const message = typeof result.error === "string" ? result.error : result.error?.message;
                setError(message || "Unable to update service.");
            }
        } catch {
            setError("Unable to update service.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(isEn ? "Delete this service?" : "Xóa dịch vụ này?")) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
            const result = await response.json();
            if (result.success) {
                router.push(`/admin/${locale}/services`);
            } else {
                setError(result.error?.message || result.error || "Unable to delete service.");
            }
        } catch {
            setError("Unable to delete service.");
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
                <h2 className="text-xl font-bold text-slate-800">{isEn ? "Service not found" : "Không tìm thấy dịch vụ"}</h2>
                <Link href={`/admin/${locale}/services`}>
                    <Button>{isEn ? "Back to list" : "Quay lại danh sách"}</Button>
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${locale}/services`}>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Edit service translation" : "Edit service"}</h1>
                        <p className="text-slate-500">ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link href={`/admin/${otherLocale}/services/${id}`}>
                        <Button variant="outline" type="button" className="gap-2">
                            <Languages className="w-4 h-4" />
                            {isEn ? "Open Vietnamese" : "Open English"}
                        </Button>
                    </Link>
                    {!isEn && (
                        <Button variant="outline" type="button" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    )}
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                        {loading ? "Saving..." : <><Save className="w-4 h-4" />Save changes</>}
                    </Button>
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Translation fields" : "Service information"}
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    {isEn ? "Service title (EN)" : "Service title"}
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
                                            /dich-vu/
                                        </span>
                                        <Input
                                            className="rounded-l-none"
                                            value={formData.slug}
                                            onChange={(event) => handleChange("slug", event.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
                            {isEn ? "Lead content (EN)" : "Lead content"}
                        </h3>
                        <RichTextEditor
                            value={isEn ? formData.content_en : formData.content}
                            onChange={(value) => handleChange(isEn ? "content_en" : "content", value)}
                            placeholder={isEn ? "English introduction..." : "Vietnamese introduction..."}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <ServiceSectionsEditor
                            sections={formData.sections}
                            isEn={isEn}
                            onChange={(sections) => handleChange("sections", sections)}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {isEn && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 space-y-2">
                            <h3 className="font-bold text-blue-800 text-sm">English translation mode</h3>
                            <p className="text-xs text-blue-700">
                                Structure, publication, and ordering are controlled from the Vietnamese version.
                            </p>
                        </div>
                    )}

                    {!isEn && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Publishing</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    className="w-4 h-4"
                                    checked={formData.isPublished}
                                    onChange={(event) => handleChange("isPublished", event.target.checked)}
                                />
                                <label htmlFor="isPublished" className="text-sm text-slate-700">Published</label>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Sort order</label>
                                <Input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(event) => handleChange("sortOrder", parseInt(event.target.value, 10) || 0)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">SEO</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{isEn ? "Meta title (EN)" : "Meta title"}</label>
                            <Input
                                value={isEn ? formData.metaTitle_en : formData.metaTitle}
                                onChange={(event) => handleChange(isEn ? "metaTitle_en" : "metaTitle", event.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">
                                {isEn ? "Meta description (EN)" : "Meta description"}
                            </label>
                            <Textarea
                                rows={4}
                                value={isEn ? formData.metaDescription_en : formData.metaDescription}
                                onChange={(event) => handleChange(isEn ? "metaDescription_en" : "metaDescription", event.target.value)}
                                className="min-h-[130px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
