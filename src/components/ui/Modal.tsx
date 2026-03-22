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
                className="absolute inset-0 bg-[rgba(28,35,34,0.46)] backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative mx-4 w-full public-panel p-6 animate-scaleIn",
                    sizes[size]
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
            >
                {/* Header */}
                {title && (
                    <div className="mb-4 flex items-center justify-between border-b border-[rgba(73,96,164,0.12)] pb-4">
                        <h2
                            id="modal-title"
                            className="text-lg font-semibold text-[var(--ink)]"
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 transition-colors hover:bg-[rgba(46,94,196,0.08)]"
                            aria-label="Đóng"
                        >
                            <X className="h-5 w-5 text-[var(--ink)]" />
                        </button>
                    </div>
                )}

                {/* Close button without title */}
                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-[rgba(46,94,196,0.08)]"
                        aria-label="Đóng"
                    >
                        <X className="h-5 w-5 text-[var(--ink)]" />
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
