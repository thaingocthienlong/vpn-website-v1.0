"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export interface ServiceSectionFormValue {
    sectionKey: string;
    title: string;
    title_en: string;
    content: string;
    content_en: string;
}

interface ServiceSectionsEditorProps {
    sections: ServiceSectionFormValue[];
    isEn: boolean;
    onChange: (sections: ServiceSectionFormValue[]) => void;
}

function createEmptySection(index: number): ServiceSectionFormValue {
    return {
        sectionKey: `section-${index + 1}`,
        title: "",
        title_en: "",
        content: "",
        content_en: "",
    };
}

export default function ServiceSectionsEditor({
    sections,
    isEn,
    onChange,
}: ServiceSectionsEditorProps) {
    const updateSection = (index: number, field: keyof ServiceSectionFormValue, value: string) => {
        onChange(
            sections.map((section, currentIndex) =>
                currentIndex === index ? { ...section, [field]: value } : section,
            ),
        );
    };

    const addSection = () => {
        onChange([...sections, createEmptySection(sections.length)]);
    };

    const removeSection = (index: number) => {
        onChange(sections.filter((_, currentIndex) => currentIndex !== index));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800">Structured sections</h3>
                    <p className="text-sm text-slate-500">
                        {isEn
                            ? "Translate the English title and content for each existing service section."
                            : "Define the structured content blocks used by the public service detail pages."}
                    </p>
                </div>
                {!isEn && (
                    <Button type="button" variant="outline" className="gap-2" onClick={addSection}>
                        <Plus className="h-4 w-4" />
                        Add section
                    </Button>
                )}
            </div>

            {sections.length === 0 ? (
                <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                    No structured sections yet. Add your first section to shape the service detail page.
                </div>
            ) : (
                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <div key={`${section.sectionKey}-${index}`} className="rounded-[1rem] border border-slate-200 bg-slate-50/60 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="font-medium text-slate-800">
                                    Section {index + 1}
                                </div>
                                {!isEn && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => removeSection(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {!isEn && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Section key</label>
                                    <Input
                                        value={section.sectionKey}
                                        onChange={(event) => updateSection(index, "sectionKey", event.target.value)}
                                        placeholder="overview"
                                    />
                                </div>
                            )}

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        {isEn ? "Section title (EN)" : "Section title (VI)"}
                                    </label>
                                    <Input
                                        value={isEn ? section.title_en : section.title}
                                        onChange={(event) =>
                                            updateSection(index, isEn ? "title_en" : "title", event.target.value)
                                        }
                                        placeholder={isEn ? "English title" : "Vietnamese title"}
                                    />
                                </div>
                                {isEn && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Vietnamese reference</label>
                                        <Input value={section.title} readOnly className="bg-slate-100" />
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        {isEn ? "Section content (EN)" : "Section content (VI)"}
                                    </label>
                                    <Textarea
                                        value={isEn ? section.content_en : section.content}
                                        onChange={(event) =>
                                            updateSection(index, isEn ? "content_en" : "content", event.target.value)
                                        }
                                        rows={6}
                                        className="min-h-[180px]"
                                    />
                                </div>
                                {isEn && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Vietnamese reference</label>
                                        <Textarea value={section.content} readOnly rows={6} className="min-h-[180px] bg-slate-100" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
