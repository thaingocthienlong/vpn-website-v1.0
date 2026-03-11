"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Loader2, X, UploadCloud } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    disabled?: boolean;
    folder?: string;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    disabled = false,
    folder = "uploads",
    className,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(value);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Vui lòng chọn file ảnh (JPG, PNG, WebP)");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File quá lớn. Vui lòng chọn ảnh dưới 5MB");
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("folder", folder);

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            // Update state
            const url = data.data?.url || data.url; // Support both response formats
            setPreview(url);
            onChange(url);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Có lỗi khi upload ảnh. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPreview("");
        onChange("");
        onRemove?.();
    };

    return (
        <div className={cn("space-y-4 w-full", className)}>
            <div
                onClick={() => !disabled && fileInputRef.current?.click()}
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-4 transition-all flex flex-col items-center justify-center gap-2 text-center h-64 bg-slate-50 hover:bg-slate-100 cursor-pointer overflow-hidden group",
                    disabled && "opacity-50 cursor-not-allowed",
                    isUploading && "pointer-events-none"
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    disabled={disabled}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                        <p className="text-sm text-slate-500">Đang tải lên...</p>
                    </div>
                ) : preview ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={preview}
                            alt="Upload preview"
                            fill
                            className="object-contain"
                            unoptimized // Since we might use external URLs initially or local ones
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleRemove}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 rounded-full bg-blue-50 text-blue-500 mb-2">
                            <UploadCloud className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-700">
                                Click để tải ảnh lên
                            </p>
                            <p className="text-xs text-slate-500">
                                PNG, JPG, WebP (Tối đa 5MB)
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
