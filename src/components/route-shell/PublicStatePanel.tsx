import * as React from "react";
import { cn } from "@/lib/utils";

export interface PublicStatePanelProps {
    icon: React.ElementType;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function PublicStatePanel({
    icon: Icon,
    title,
    description,
    action,
    className,
}: PublicStatePanelProps) {
    return (
        <div className={cn("public-panel rounded-[2.2rem] px-6 py-16 text-center", className)}>
            <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-[1.5rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                <Icon className="h-8 w-8" weight="duotone" />
            </div>
            <h2 className="font-heading text-2xl text-[var(--ink)]">{title}</h2>
            {description && (
                <p className="mx-auto mt-3 max-w-xl text-base leading-8 text-[var(--ink-soft)]">
                    {description}
                </p>
            )}
            {action && <div className="mt-6 flex justify-center">{action}</div>}
        </div>
    );
}

export default PublicStatePanel;
