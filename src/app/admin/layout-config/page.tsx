"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, Menu, Plus, Trash2, ChevronDown, ChevronUp, Settings, Pencil, Eye, EyeOff, GripVertical, X, ArrowUp, ArrowDown } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

interface MenuItem {
    id: string;
    label: string;
    label_en: string | null;
    url: string;
    locale: string;
    parentId: string | null;
    icon: string | null;
    target: string;
    sortOrder: number;
    isActive: boolean;
    children: MenuItem[];
}

interface LayoutData {
    header: Record<string, string>;
    footer: Record<string, string>;
    general: Record<string, string>;
    menuItems: MenuItem[];
}

interface MenuFormData {
    label: string;
    label_en: string;
    url: string;
    icon: string;
    target: string;
    parentId: string;
}

const emptyForm: MenuFormData = {
    label: "",
    label_en: "",
    url: "",
    icon: "",
    target: "_self",
    parentId: "",
};

export default function LayoutConfigPage() {
    const [data, setData] = useState<LayoutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState<"menu" | "header" | "footer">("menu");

    // Menu management states
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MenuFormData>(emptyForm);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/layout");
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(""), 3000);
    };

    // --- Config save ---
    const saveConfig = async (group: string, configs: Record<string, string>) => {
        setSaving(true);
        setMessage("");
        try {
            const res = await fetch("/api/admin/layout", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group, configs }),
            });
            const result = await res.json();
            if (result.success) showMessage("✅ Đã lưu thành công!");
            else showMessage("❌ " + (result.error || "Lỗi"));
        } catch {
            showMessage("❌ Lỗi kết nối server.");
        } finally {
            setSaving(false);
        }
    };

    // --- Menu CRUD ---
    const addMenuItem = async () => {
        if (!formData.label || !formData.url) return showMessage("❌ Cần nhập tên và URL");
        setActionLoading("add");
        try {
            const res = await fetch("/api/admin/layout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    label: formData.label,
                    label_en: formData.label_en || null,
                    url: formData.url,
                    icon: formData.icon || null,
                    target: formData.target,
                    parentId: formData.parentId || null,
                }),
            });
            const result = await res.json();
            if (result.success) {
                showMessage("✅ Đã thêm menu item!");
                setFormData(emptyForm);
                setShowAddForm(false);
                await fetchData();
            } else showMessage("❌ " + result.error);
        } catch { showMessage("❌ Lỗi kết nối"); }
        finally { setActionLoading(null); }
    };

    const updateMenuItem = async () => {
        if (!editingId || !formData.label || !formData.url) return;
        setActionLoading("edit");
        try {
            const res = await fetch("/api/admin/layout", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "updateMenuItem",
                    id: editingId,
                    data: {
                        label: formData.label,
                        label_en: formData.label_en || null,
                        url: formData.url,
                        icon: formData.icon || null,
                        target: formData.target,
                        parentId: formData.parentId || null,
                    },
                }),
            });
            const result = await res.json();
            if (result.success) {
                showMessage("✅ Đã cập nhật!");
                setEditingId(null);
                setFormData(emptyForm);
                await fetchData();
            } else showMessage("❌ " + result.error);
        } catch { showMessage("❌ Lỗi kết nối"); }
        finally { setActionLoading(null); }
    };

    const toggleMenuItem = async (id: string) => {
        setActionLoading(id);
        try {
            const res = await fetch("/api/admin/layout", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "toggleMenuItem", id }),
            });
            const result = await res.json();
            if (result.success) await fetchData();
            else showMessage("❌ " + result.error);
        } catch { showMessage("❌ Lỗi kết nối"); }
        finally { setActionLoading(null); }
    };

    const deleteMenuItem = async (id: string, label: string) => {
        if (!confirm(`Xóa menu "${label}" và tất cả mục con?`)) return;
        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/layout?id=${id}`, { method: "DELETE" });
            const result = await res.json();
            if (result.success) {
                showMessage("✅ Đã xóa!");
                await fetchData();
            } else showMessage("❌ " + result.error);
        } catch { showMessage("❌ Lỗi kết nối"); }
        finally { setActionLoading(null); }
    };

    const moveMenuItem = async (items: MenuItem[], index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;

        const reordered = items.map((item, i) => ({
            id: item.id,
            sortOrder: i === index ? items[newIndex].sortOrder : i === newIndex ? items[index].sortOrder : item.sortOrder,
        }));

        setActionLoading("reorder");
        try {
            const res = await fetch("/api/admin/layout", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reorderMenu", items: reordered }),
            });
            const result = await res.json();
            if (result.success) await fetchData();
        } catch { showMessage("❌ Lỗi kết nối"); }
        finally { setActionLoading(null); }
    };

    const startEdit = (item: MenuItem) => {
        setEditingId(item.id);
        setShowAddForm(false);
        setFormData({
            label: item.label,
            label_en: item.label_en || "",
            url: item.url,
            icon: item.icon || "",
            target: item.target,
            parentId: item.parentId || "",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setShowAddForm(false);
        setFormData(emptyForm);
    };

    // --- Render ---
    if (loading) {
        return <DashboardSkeleton />;
    }

    const tabs = [
        { key: "menu" as const, label: "Menu điều hướng", icon: Menu },
        { key: "header" as const, label: "Header", icon: ChevronUp },
        { key: "footer" as const, label: "Footer", icon: ChevronDown },
    ];

    const allMenuItems = data?.menuItems || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Quản lý Giao diện</h1>
                <p className="text-slate-500">Cấu hình header, footer và menu điều hướng.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-xl text-sm ${message.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {message}
                </div>
            )}

            <div className="flex gap-2 border-b border-slate-200 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${activeTab === tab.key
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ======== MENU TAB ======== */}
            {activeTab === "menu" && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">Menu Items</h3>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            onClick={() => { setShowAddForm(true); setEditingId(null); setFormData(emptyForm); }}
                        >
                            <Plus className="w-4 h-4" /> Thêm mới
                        </Button>
                    </div>

                    {/* Add / Edit Form */}
                    {(showAddForm || editingId) && (
                        <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 mb-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-blue-800 text-sm">
                                    {editingId ? "✏️ Sửa menu item" : "➕ Thêm menu item mới"}
                                </h4>
                                <button onClick={cancelEdit} className="text-white hover:text-slate-600 cursor-pointer">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Tên (VI) *</label>
                                    <Input
                                        value={formData.label}
                                        onChange={(e) => setFormData(p => ({ ...p, label: e.target.value }))}
                                        placeholder="VD: Giới thiệu"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Tên (EN)</label>
                                    <Input
                                        value={formData.label_en}
                                        onChange={(e) => setFormData(p => ({ ...p, label_en: e.target.value }))}
                                        placeholder="VD: About Us"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">URL *</label>
                                    <Input
                                        value={formData.url}
                                        onChange={(e) => setFormData(p => ({ ...p, url: e.target.value }))}
                                        placeholder="VD: /gioi-thieu"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Icon (Lucide name)</label>
                                    <Input
                                        value={formData.icon}
                                        onChange={(e) => setFormData(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="VD: info, book"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Target</label>
                                    <select
                                        value={formData.target}
                                        onChange={(e) => setFormData(p => ({ ...p, target: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    >
                                        <option value="_self">Cùng tab (_self)</option>
                                        <option value="_blank">Tab mới (_blank)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Menu cha</label>
                                    <select
                                        value={formData.parentId}
                                        onChange={(e) => setFormData(p => ({ ...p, parentId: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                    >
                                        <option value="">— Menu gốc —</option>
                                        {allMenuItems.map(item => (
                                            <option key={item.id} value={item.id}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={cancelEdit}>Hủy</Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                    onClick={editingId ? updateMenuItem : addMenuItem}
                                    disabled={actionLoading === "add" || actionLoading === "edit"}
                                >
                                    {(actionLoading === "add" || actionLoading === "edit") ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {editingId ? "Cập nhật" : "Thêm"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Menu Tree */}
                    {allMenuItems.length > 0 ? (
                        <div className="space-y-2">
                            {allMenuItems.map((item, index) => (
                                <div key={item.id} className={`border rounded-lg transition-colors ${item.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}>
                                    <div className="flex items-center gap-2 p-3">
                                        <GripVertical className="w-4 h-4 text-white flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-800 truncate">{item.label}</span>
                                                {item.label_en && (
                                                    <span className="text-xs text-white truncate">/ {item.label_en}</span>
                                                )}
                                            </div>
                                            <span className="text-xs text-white">{item.url}</span>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <Badge variant={item.isActive ? "success" : "secondary"} className="text-xs">
                                                {item.isActive ? "Bật" : "Tắt"}
                                            </Badge>
                                            {/* Move up */}
                                            <button
                                                onClick={() => moveMenuItem(allMenuItems, index, "up")}
                                                disabled={index === 0 || actionLoading === "reorder"}
                                                className="p-1.5 rounded hover:bg-slate-100 text-white hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                                                title="Di chuyển lên"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            {/* Move down */}
                                            <button
                                                onClick={() => moveMenuItem(allMenuItems, index, "down")}
                                                disabled={index === allMenuItems.length - 1 || actionLoading === "reorder"}
                                                className="p-1.5 rounded hover:bg-slate-100 text-white hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                                                title="Di chuyển xuống"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                            {/* Toggle */}
                                            <button
                                                onClick={() => toggleMenuItem(item.id)}
                                                disabled={actionLoading === item.id}
                                                className="p-1.5 rounded hover:bg-slate-100 text-white hover:text-slate-600 cursor-pointer"
                                                title={item.isActive ? "Tắt hiển thị" : "Bật hiển thị"}
                                            >
                                                {item.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                            {/* Edit */}
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="p-1.5 rounded hover:bg-blue-50 text-white hover:text-blue-600 cursor-pointer"
                                                title="Chỉnh sửa"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            {/* Delete */}
                                            <button
                                                onClick={() => deleteMenuItem(item.id, item.label)}
                                                disabled={actionLoading === item.id}
                                                className="p-1.5 rounded hover:bg-red-50 text-white hover:text-red-600 cursor-pointer"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Children */}
                                    {item.children && item.children.length > 0 && (
                                        <div className="border-t border-slate-100 bg-slate-50/50">
                                            {item.children.map((child, childIdx) => (
                                                <div key={child.id} className="flex items-center gap-2 px-3 py-2 ml-6 border-b border-slate-100 last:border-b-0">
                                                    <span className="text-white text-sm">↳</span>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-sm text-slate-700">{child.label}</span>
                                                        {child.label_en && (
                                                            <span className="text-xs text-white ml-1">/ {child.label_en}</span>
                                                        )}
                                                        <span className="text-xs text-white ml-2">{child.url}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <Badge variant={child.isActive ? "success" : "secondary"} className="text-xs">
                                                            {child.isActive ? "Bật" : "Tắt"}
                                                        </Badge>
                                                        <button
                                                            onClick={() => moveMenuItem(item.children, childIdx, "up")}
                                                            disabled={childIdx === 0}
                                                            className="p-1 rounded hover:bg-slate-100 text-white hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                                                        >
                                                            <ArrowUp className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => moveMenuItem(item.children, childIdx, "down")}
                                                            disabled={childIdx === item.children.length - 1}
                                                            className="p-1 rounded hover:bg-slate-100 text-white hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                                                        >
                                                            <ArrowDown className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleMenuItem(child.id)}
                                                            className="p-1 rounded hover:bg-slate-100 text-white hover:text-slate-600 cursor-pointer"
                                                        >
                                                            {child.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                                        </button>
                                                        <button
                                                            onClick={() => startEdit(child)}
                                                            className="p-1 rounded hover:bg-blue-50 text-white hover:text-blue-600 cursor-pointer"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMenuItem(child.id, child.label)}
                                                            className="p-1 rounded hover:bg-red-50 text-white hover:text-red-600 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <Settings className="w-10 h-10 text-white mx-auto mb-3" />
                            <p>Chưa có menu items. Nhấn &quot;Thêm mới&quot; để bắt đầu.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ======== HEADER TAB ======== */}
            {activeTab === "header" && (
                <ConfigEditor
                    title="Cấu hình Header"
                    configs={data?.header || {}}
                    onSave={(configs) => saveConfig("header", configs)}
                    saving={saving}
                    fields={[
                        { key: "logo_url", label: "URL Logo" },
                        { key: "logo_text", label: "Tên hiển thị" },
                        { key: "phone", label: "Số điện thoại" },
                        { key: "email", label: "Email" },
                    ]}
                />
            )}

            {/* ======== FOOTER TAB ======== */}
            {activeTab === "footer" && (
                <ConfigEditor
                    title="Cấu hình Footer"
                    configs={data?.footer || {}}
                    onSave={(configs) => saveConfig("footer", configs)}
                    saving={saving}
                    fields={[
                        { key: "address", label: "Địa chỉ" },
                        { key: "phone", label: "Số điện thoại" },
                        { key: "email", label: "Email" },
                        { key: "facebook", label: "Facebook URL" },
                        { key: "youtube", label: "YouTube URL" },
                        { key: "copyright", label: "Copyright text" },
                    ]}
                />
            )}
        </div>
    );
}

function ConfigEditor({
    title,
    configs,
    onSave,
    saving,
    fields,
}: {
    title: string;
    configs: Record<string, string>;
    onSave: (configs: Record<string, string>) => void;
    saving: boolean;
    fields: { key: string; label: string }[];
}) {
    const [values, setValues] = useState<Record<string, string>>(configs);

    useEffect(() => { setValues(configs); }, [configs]);

    const handleChange = (key: string, value: string) => {
        setValues(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800">{title}</h3>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    onClick={() => onSave(values)}
                    disabled={saving}
                >
                    {saving ? "Đang lưu..." : <><Save className="w-4 h-4" />Lưu</>}
                </Button>
            </div>
            <div className="space-y-4">
                {fields.map(field => (
                    <div key={field.key} className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">{field.label}</label>
                        <Input
                            value={values[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={`Nhập ${field.label.toLowerCase()}...`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
