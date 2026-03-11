"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: "sm" | "md" | "lg" | "xl";
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    size = "md",
    children,
}) => {
    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
    };

    // Handle escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50  animate-fadeIn"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative w-full mx-4 clay-card clay-card-elevated p-6 animate-scaleIn",
                    sizes[size]
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                        <h2
                            id="modal-title"
                            className="text-lg font-semibold text-slate-800"
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                            aria-label="Đóng"
                        >
                            <X className="h-5 w-5 text-slate-800" />
                        </button>
                    </div>
                )}

                {/* Close button without title */}
                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5 text-slate-800" />
                    </button>
                )}

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
};

Modal.displayName = "Modal";

export { Modal };
