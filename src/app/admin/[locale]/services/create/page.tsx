"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { generateSlug } from "@/lib/utils";
import ServiceSectionsEditor, { type ServiceSectionFormValue } from "@/components/admin/service/ServiceSectionsEditor";

function createDefaultSection(): ServiceSectionFormValue {
    return {
        sectionKey: "overview",
        title: "Tổng quan",
        title_en: "",
        content: "",
        content_en: "",
    };
}

export default function CreateServicePage() {
    const router = useRouter();
    const { locale } = useParams<{ locale: string }>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (locale === "en") router.replace("/admin/vi/services/create");
    }, [locale, router]);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: "",
        isPublished: true,
        sortOrder: 0,
        metaTitle: "",
        metaDescription: "",
        sections: [createDefaultSection()],
    });

    const handleChange = (field: string, value: string | boolean | number | ServiceSectionFormValue[]) => {
        setFormData((current) => {
            const updates: Record<string, string | boolean | number | ServiceSectionFormValue[]> = { [field]: value };
            if (field === "title" && !current.slug) {
                updates.slug = generateSlug(value as string);
            }
            return { ...current, ...updates };
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!formData.title || !formData.slug) {
            setError("Title and slug are required.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/admin/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (result.success) {
                router.push(`/admin/${locale}/services`);
            } else {
                setError(result.error?.message || result.error || "Unable to create service.");
            }
        } catch {
            setError("Unable to create service.");
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-2xl font-bold text-slate-800">Create service</h1>
                        <p className="text-slate-500">Create the service page and the structured sections used by the public detail screen.</p>
                    </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" type="submit" disabled={loading}>
                    {loading ? "Saving..." : <><Save className="w-4 h-4" />Save service</>}
                </Button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Service information</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Service title</label>
                                <Input value={formData.title} onChange={(event) => handleChange("title", event.target.value)} required />
                            </div>
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
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Lead content</h3>
                        <RichTextEditor
                            value={formData.content}
                            onChange={(value) => handleChange("content", value)}
                            placeholder="High-level introduction for the service..."
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <ServiceSectionsEditor
                            sections={formData.sections}
                            isEn={false}
                            onChange={(sections) => handleChange("sections", sections)}
                        />
                    </div>
                </div>

                <div className="space-y-6">
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
                            <label htmlFor="isPublished" className="text-sm text-slate-700">Publish immediately</label>
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

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">SEO</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Meta title</label>
                            <Input value={formData.metaTitle} onChange={(event) => handleChange("metaTitle", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Meta description</label>
                            <Textarea
                                rows={4}
                                value={formData.metaDescription}
                                onChange={(event) => handleChange("metaDescription", event.target.value)}
                                className="min-h-[130px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
