"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { generateSlug } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    name_en?: string;
    slug: string;
    type: string;
    description?: string;
    sortOrder: number;
    _count?: { posts: number; courses: number };
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        name_en: "",
        slug: "",
        type: "POST",
        description: "",
        sortOrder: 0,
    });

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/categories");
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenCreate = () => {
        setEditingCategory(null);
        setFormData({
            name: "",
            name_en: "",
            slug: "",
            type: "POST",
            description: "",
            sortOrder: 0,
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            name_en: category.name_en || "",
            slug: category.slug,
            type: category.type,
            description: category.description || "",
            sortOrder: category.sortOrder || 0,
        });
        setIsModalOpen(true);
    };

    const handleChange = (field: string, value: string | number) => {
        setFormData(prev => {
            const updates: any = { [field]: value };
            if (field === "name" && !editingCategory) {
                updates.slug = generateSlug(value as string);
            }
            return { ...prev, ...updates };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingCategory
                ? `/api/admin/categories/${editingCategory.id}`
                : "/api/admin/categories";
            const method = editingCategory ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (data.success) {
                setIsModalOpen(false);
                fetchCategories();
            } else {
                alert(data.error || "Failed to save category");
            }
        } catch (error) {
            alert("Error saving category");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchCategories();
            } else {
                alert("Failed to delete category");
            }
        } catch (error) {
            alert("Error deleting category");
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Quản lý danh mục</h1>
                    <p className="text-slate-500">Phân loại nội dung cho bài viết và khóa học.</p>
                </div>
                <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> Thêm danh mục
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm danh mục..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 w-16 text-center">STT</th>
                                <th className="px-4 py-3">Tên danh mục</th>
                                <th className="px-4 py-3">Slug</th>
                                <th className="px-4 py-3">Loại</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chưa có danh mục nào.</td></tr>
                            ) : (
                                filteredCategories.map((category, index) => (
                                    <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{category.sortOrder}</td>
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            <div>{category.name}</div>
                                            {category.name_en && (
                                                <div className="text-xs text-white mt-0.5">{category.name_en}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{category.slug}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.type === "COURSE"
                                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                                }`}>
                                                {category.type === "COURSE" ? "Khóa học" : "Bài viết"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(category)}>
                                                    <Pencil className="w-4 h-4 text-slate-600" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(category.id)}>
                                                    <Trash2 className="w-4 h-4" />
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
                title={editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Tên tiếng Việt <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.name}
                                onChange={e => handleChange("name", e.target.value)}
                                placeholder="VD: Tin tức chung"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Tên tiếng Anh</label>
                            <Input
                                value={formData.name_en}
                                onChange={e => handleChange("name_en", e.target.value)}
                                placeholder="Ex: General News"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Slug (URL) <span className="text-red-500">*</span></label>
                            <Input
                                value={formData.slug}
                                onChange={e => handleChange("slug", e.target.value)}
                                placeholder="vd: tin-tuc-chung"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Loại nội dung</label>
                            <select
                                className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.type}
                                onChange={e => handleChange("type", e.target.value)}
                            >
                                <option value="POST">Bài viết</option>
                                <option value="COURSE">Khóa học</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Mô tả</label>
                        <Input
                            value={formData.description}
                            onChange={e => handleChange("description", e.target.value)}
                            placeholder="Mô tả ngắn về danh mục này..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
                        <Input
                            type="number"
                            value={formData.sortOrder}
                            onChange={e => handleChange("sortOrder", parseInt(e.target.value) || 0)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
                        <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={saving}>
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang lưu...</> : "Lưu danh mục"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
