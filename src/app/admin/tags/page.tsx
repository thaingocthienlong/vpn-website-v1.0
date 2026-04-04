"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { generateSlug } from "@/lib/utils";

interface TagRecord {
    id: string;
    name: string;
    slug: string;
    _count?: {
        posts: number;
    };
}

export default function TagsPage() {
    const [tags, setTags] = useState<TagRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<TagRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
    });

    const fetchTags = async (query = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.set("search", query);
            const response = await fetch(`/api/admin/tags?${params.toString()}`);
            const result = await response.json();
            if (result.success) {
                setTags(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchTags(search), 200);
        return () => clearTimeout(timer);
    }, [search]);

    const handleOpenCreate = () => {
        setEditingTag(null);
        setFormData({ name: "", slug: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (tag: TagRecord) => {
        setEditingTag(tag);
        setFormData({ name: tag.name, slug: tag.slug });
        setIsModalOpen(true);
    };

    const handleChange = (field: "name" | "slug", value: string) => {
        setFormData((current) => {
            const updates: Record<string, string> = { [field]: value };
            if (field === "name" && !editingTag) {
                updates.slug = generateSlug(value);
            }
            return { ...current, ...updates };
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const url = editingTag ? `/api/admin/tags/${editingTag.id}` : "/api/admin/tags";
            const method = editingTag ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (result.success) {
                setIsModalOpen(false);
                setMessage(editingTag ? "Tag updated." : "Tag created.");
                await fetchTags(search);
            } else {
                setMessage(result.error?.message || result.error || "Unable to save tag.");
            }
        } catch {
            setMessage("Unable to save tag.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (tag: TagRecord) => {
        if (!confirm(`Delete tag "${tag.name}"?`)) return;

        try {
            const response = await fetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" });
            const result = await response.json();

            if (result.success) {
                setMessage("Tag deleted.");
                await fetchTags(search);
            } else {
                setMessage(result.error?.message || result.error || "Unable to delete tag.");
            }
        } catch {
            setMessage("Unable to delete tag.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tags</h1>
                    <p className="text-slate-500">Manage reusable topic tags for news posts.</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Add tag
                </Button>
            </div>

            {message && (
                <div className="rounded-[1rem] border border-[rgba(26,72,164,0.12)] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    {message}
                </div>
            )}

            <div className="rounded-[1.3rem] border border-[rgba(26,72,164,0.12)] bg-white p-4 shadow-sm">
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search tags..."
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-[1.3rem] border border-[rgba(26,72,164,0.12)] bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium">
                            <tr>
                                <th className="px-4 py-3 w-16 text-center">#</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Slug</th>
                                <th className="px-4 py-3">Posts</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                                        Loading tags...
                                    </td>
                                </tr>
                            ) : tags.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                                <Tag className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <p>No tags found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tags.map((tag, index) => (
                                    <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{tag.name}</td>
                                        <td className="px-4 py-3 text-slate-500">{tag.slug}</td>
                                        <td className="px-4 py-3 text-slate-500">{tag._count?.posts || 0}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(tag)}>
                                                    <Pencil className="h-4 w-4 text-slate-600" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDelete(tag)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTag ? "Edit tag" : "Create tag"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Name</label>
                        <Input value={formData.name} onChange={(event) => handleChange("name", event.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Slug</label>
                        <Input value={formData.slug} onChange={(event) => handleChange("slug", event.target.value)} required />
                    </div>
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : editingTag ? (
                                "Update tag"
                            ) : (
                                "Create tag"
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
