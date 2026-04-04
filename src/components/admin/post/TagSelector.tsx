"use client";

import { Badge } from "@/components/ui/Badge";

export interface TagOption {
    id: string;
    name: string;
    slug: string;
}

interface TagSelectorProps {
    tags: TagOption[];
    selectedIds: string[];
    onChange: (nextSelectedIds: string[]) => void;
}

export default function TagSelector({ tags, selectedIds, onChange }: TagSelectorProps) {
    const toggleTag = (tagId: string) => {
        if (selectedIds.includes(tagId)) {
            onChange(selectedIds.filter((currentId) => currentId !== tagId));
            return;
        }

        onChange([...selectedIds, tagId]);
    };

    if (tags.length === 0) {
        return <p className="text-sm text-slate-500">No tags available yet.</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
                const active = selectedIds.includes(tag.id);

                return (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className="cursor-pointer"
                    >
                        <Badge variant={active ? "primary" : "secondary"} className="normal-case tracking-normal">
                            {tag.name}
                        </Badge>
                    </button>
                );
            })}
        </div>
    );
}
