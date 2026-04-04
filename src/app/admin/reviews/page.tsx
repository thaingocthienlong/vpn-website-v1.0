"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

interface ReviewRecord {
    id: string;
    name: string;
    role: string | null;
    role_en: string | null;
    company: string | null;
    company_en: string | null;
    content: string;
    content_en: string | null;
    rating: number;
    avatarId: string | null;
    sortOrder: number;
    isActive: boolean;
    avatar?: {
        id: string;
        url: string;
        alt: string | null;
    } | null;
}

type ReviewFormState = {
    name: string;
    role: string;
    role_en: string;
    company: string;
    company_en: string;
    content: string;
    content_en: string;
    rating: number;
    avatarId: string;
    sortOrder: number;
    isActive: boolean;
};

const emptyForm: ReviewFormState = {
    name: "",
    role: "",
    role_en: "",
    company: "",
    company_en: "",
    content: "",
    content_en: "",
    rating: 5,
    avatarId: "",
    sortOrder: 0,
    isActive: true,
};

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<ReviewRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<ReviewRecord | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState<ReviewFormState>(emptyForm);

    const fetchReviews = async (query = "") => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.set("search", query);
            const response = await fetch(`/api/admin/reviews?${params.toString()}`);
            const result = await response.json();
            if (result.success) {
                setReviews(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => fetchReviews(search), 200);
        return () => clearTimeout(timer);
    }, [search]);

    const openCreate = () => {
        setEditingReview(null);
        setFormData(emptyForm);
        setIsModalOpen(true);
    };

    const openEdit = (review: ReviewRecord) => {
        setEditingReview(review);
        setFormData({
            name: review.name,
            role: review.role || "",
            role_en: review.role_en || "",
            company: review.company || "",
            company_en: review.company_en || "",
            content: review.content,
            content_en: review.content_en || "",
            rating: review.rating,
            avatarId: review.avatar?.url || review.avatarId || "",
            sortOrder: review.sortOrder,
            isActive: review.isActive,
        });
        setIsModalOpen(true);
    };

    const handleChange = (field: keyof ReviewFormState, value: string | number | boolean) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const url = editingReview ? `/api/admin/reviews/${editingReview.id}` : "/api/admin/reviews";
            const method = editingReview ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const result = await response.json();

            if (result.success) {
                setIsModalOpen(false);
                setMessage(editingReview ? "Review updated." : "Review created.");
                await fetchReviews(search);
            } else {
                setMessage(result.error?.message || result.error || "Unable to save review.");
            }
        } catch {
            setMessage("Unable to save review.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (review: ReviewRecord) => {
        if (!confirm(`Delete review by "${review.name}"?`)) return;

        try {
            const response = await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
            const result = await response.json();
            if (result.success) {
                setMessage("Review deleted.");
                await fetchReviews(search);
            } else {
                setMessage(result.error?.message || result.error || "Unable to delete review.");
            }
        } catch {
            setMessage("Unable to delete review.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Reviews</h1>
                    <p className="text-slate-500">Manage customer testimonials and bilingual review content.</p>
                </div>
                <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Add review
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
                        placeholder="Search reviews..."
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
                                <th className="px-4 py-3">Reviewer</th>
                                <th className="px-4 py-3">Company</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                                        Loading reviews...
                                    </td>
                                </tr>
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        No reviews found.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review, index) => (
                                    <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">{review.name}</div>
                                            {review.role && <div className="text-xs text-slate-500">{review.role}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{review.company || "—"}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-amber-500">
                                                {Array.from({ length: review.rating }).map((_, starIndex) => (
                                                    <Star key={`${review.id}-${starIndex}`} className="h-4 w-4 fill-current" />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={review.isActive ? "success" : "secondary"}>
                                                {review.isActive ? "Live" : "Hidden"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(review)}>
                                                    <Pencil className="h-4 w-4 text-slate-600" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDelete(review)}
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
                title={editingReview ? "Edit review" : "Create review"}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Reviewer name</label>
                            <Input value={formData.name} onChange={(event) => handleChange("name", event.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Sort order</label>
                            <Input
                                type="number"
                                value={formData.sortOrder}
                                onChange={(event) => handleChange("sortOrder", Number(event.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Role (VI)</label>
                            <Input value={formData.role} onChange={(event) => handleChange("role", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Role (EN)</label>
                            <Input value={formData.role_en} onChange={(event) => handleChange("role_en", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Company (VI)</label>
                            <Input value={formData.company} onChange={(event) => handleChange("company", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Company (EN)</label>
                            <Input value={formData.company_en} onChange={(event) => handleChange("company_en", event.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Avatar</label>
                        <ImageUpload
                            value={formData.avatarId}
                            onChange={(url) => handleChange("avatarId", url)}
                            folder="reviews"
                            className="h-32"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Review content (VI)</label>
                            <Textarea
                                value={formData.content}
                                onChange={(event) => handleChange("content", event.target.value)}
                                rows={5}
                                className="min-h-[140px]"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Review content (EN)</label>
                            <Textarea
                                value={formData.content_en}
                                onChange={(event) => handleChange("content_en", event.target.value)}
                                rows={5}
                                className="min-h-[140px]"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Rating</label>
                            <select
                                value={formData.rating}
                                onChange={(event) => handleChange("rating", Number(event.target.value))}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                            >
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <option key={rating} value={rating}>
                                        {rating} star{rating > 1 ? "s" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-3">
                            <button
                                type="button"
                                onClick={() => handleChange("isActive", !formData.isActive)}
                                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                                    formData.isActive
                                        ? "border-[rgba(47,122,95,0.18)] bg-[rgba(47,122,95,0.12)] text-[var(--success)]"
                                        : "border-slate-200 bg-slate-50 text-slate-600"
                                }`}
                            >
                                {formData.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                {formData.isActive ? "Visible on site" : "Hidden from site"}
                            </button>
                        </div>
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
                            ) : editingReview ? (
                                "Update review"
                            ) : (
                                "Create review"
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
