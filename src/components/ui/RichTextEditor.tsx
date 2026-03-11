"use client";

import dynamic from "next/dynamic";
import "ckeditor5/ckeditor5.css";

const CKEditorWrapper = dynamic(
    () => import("@/components/ui/CKEditorWrapper").then((mod) => ({ default: mod.CKEditorWrapper })),
    {
        ssr: false,
        loading: () => (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-slate-500 text-sm animate-pulse min-h-[200px] flex items-center justify-center">
                Đang tải trình soạn thảo...
            </div>
        ),
    }
);

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    variant?: "full" | "mini";
}

export function RichTextEditor({ value, onChange, label, placeholder, variant = "full" }: RichTextEditorProps) {
    return (
        <div className="space-y-2">
            {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
            <CKEditorWrapper value={value} onChange={onChange} placeholder={placeholder} variant={variant} />
        </div>
    );
}
