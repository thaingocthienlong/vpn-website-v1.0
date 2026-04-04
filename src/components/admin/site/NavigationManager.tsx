"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Loader2,
    Save,
    Menu,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Settings,
    Pencil,
    Eye,
    EyeOff,
    GripVertical,
    X,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
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

export default function NavigationManager() {
    const [data, setData] = useState<LayoutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [activeTab, setActiveTab] = useState<"menu" | "header" | "footer">("menu");
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MenuFormData>(emptyForm);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch("/api/admin/layout");
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const showMessage = (nextMessage: string) => {
        setMessage(nextMessage);
        setTimeout(() => setMessage(""), 3000);
    };

    const saveConfig = async (group: string, configs: Record<string, string>) => {
        setSaving(true);
        setMessage("");
        try {
            const response = await fetch("/api/admin/layout", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group, configs }),
            });
            const result = await response.json();
            if (result.success) showMessage("Saved site configuration.");
            else showMessage(result.error || "Unable to save configuration.");
        } catch {
            showMessage("Unable to save configuration.");
        } finally {
            setSaving(false);
        }
    };

    const addMenuItem = async () => {
        if (!formData.label || !formData.url) {
            showMessage("Label and URL are required.");
            return;
        }

        setActionLoading("add");
        try {
            const response = await fetch("/api/admin/layout", {
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
            const result = await response.json();
            if (result.success) {
                showMessage("Navigation item created.");
                setFormData(emptyForm);
                setShowAddForm(false);
                await fetchData();
            } else {
                showMessage(result.error || "Unable to create navigation item.");
            }
        } catch {
            showMessage("Unable to create navigation item.");
        } finally {
            setActionLoading(null);
        }
    };

    const updateMenuItem = async () => {
        if (!editingId || !formData.label || !formData.url) return;

        setActionLoading("edit");
        try {
            const response = await fetch("/api/admin/layout", {
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
            const result = await response.json();
            if (result.success) {
                showMessage("Navigation item updated.");
                setEditingId(null);
                setFormData(emptyForm);
                await fetchData();
            } else {
                showMessage(result.error || "Unable to update navigation item.");
            }
        } catch {
            showMessage("Unable to update navigation item.");
        } finally {
            setActionLoading(null);
        }
    };

    const toggleMenuItem = async (id: string) => {
        setActionLoading(id);
        try {
            const response = await fetch("/api/admin/layout", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "toggleMenuItem", id }),
            });
            const result = await response.json();
            if (result.success) {
                await fetchData();
            } else {
                showMessage(result.error || "Unable to update visibility.");
            }
        } catch {
            showMessage("Unable to update visibility.");
        } finally {
            setActionLoading(null);
        }
    };

    const deleteMenuItem = async (id: string, label: string) => {
        if (!confirm(`Delete "${label}" and all of its children?`)) return;

        setActionLoading(id);
        try {
            const response = await fetch(`/api/admin/layout?id=${id}`, { method: "DELETE" });
            const result = await response.json();
            if (result.success) {
                showMessage("Navigation item deleted.");
                await fetchData();
            } else {
                showMessage(result.error || "Unable to delete navigation item.");
            }
        } catch {
            showMessage("Unable to delete navigation item.");
        } finally {
            setActionLoading(null);
        }
    };

    const moveMenuItem = async (items: MenuItem[], index: number, direction: "up" | "down") => {
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;

        const reordered = items.map((item, currentIndex) => ({
            id: item.id,
            sortOrder:
                currentIndex === index
                    ? items[newIndex].sortOrder
                    : currentIndex === newIndex
                        ? items[index].sortOrder
                        : item.sortOrder,
        }));

        setActionLoading("reorder");
        try {
            const response = await fetch("/api/admin/layout", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reorderMenu", items: reordered }),
            });
            const result = await response.json();
            if (result.success) {
                await fetchData();
            } else {
                showMessage(result.error || "Unable to reorder navigation.");
            }
        } catch {
            showMessage("Unable to reorder navigation.");
        } finally {
            setActionLoading(null);
        }
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

    if (loading) {
        return <DashboardSkeleton />;
    }

    const tabs = [
        { key: "menu" as const, label: "Navigation", icon: Menu },
        { key: "header" as const, label: "Header", icon: ChevronUp },
        { key: "footer" as const, label: "Footer", icon: ChevronDown },
    ];

    const allMenuItems = data?.menuItems || [];

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-800">Navigation, Header, and Footer</h1>
                <p className="text-sm text-slate-500">
                    This keeps the site shell in one place, while still using the existing configuration and menu storage.
                </p>
            </div>

            {message && (
                <div className="rounded-[1rem] border border-[rgba(26,72,164,0.12)] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                    {message}
                </div>
            )}

            <div className="flex gap-2 border-b border-slate-200 pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab.key
                                ? "border border-blue-200 bg-blue-50 text-blue-700"
                                : "text-slate-500 hover:bg-slate-50"
                        }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "menu" && (
                <div className="rounded-[1.3rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Navigation items</h3>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                            onClick={() => {
                                setShowAddForm(true);
                                setEditingId(null);
                                setFormData(emptyForm);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add item
                        </Button>
                    </div>

                    {(showAddForm || editingId) && (
                        <div className="mb-4 space-y-3 rounded-[1rem] border border-blue-200 bg-blue-50/50 p-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-blue-800">
                                    {editingId ? "Edit navigation item" : "Create navigation item"}
                                </h4>
                                <button onClick={cancelEdit} className="cursor-pointer text-slate-500 hover:text-slate-700">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Label (VI)</label>
                                    <Input
                                        value={formData.label}
                                        onChange={(event) => setFormData((current) => ({ ...current, label: event.target.value }))}
                                        placeholder="Giới thiệu"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Label (EN)</label>
                                    <Input
                                        value={formData.label_en}
                                        onChange={(event) => setFormData((current) => ({ ...current, label_en: event.target.value }))}
                                        placeholder="About"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">URL</label>
                                    <Input
                                        value={formData.url}
                                        onChange={(event) => setFormData((current) => ({ ...current, url: event.target.value }))}
                                        placeholder="/gioi-thieu"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Icon</label>
                                    <Input
                                        value={formData.icon}
                                        onChange={(event) => setFormData((current) => ({ ...current, icon: event.target.value }))}
                                        placeholder="info"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Target</label>
                                    <select
                                        value={formData.target}
                                        onChange={(event) => setFormData((current) => ({ ...current, target: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="_self">Same tab</option>
                                        <option value="_blank">New tab</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-600">Parent item</label>
                                    <select
                                        value={formData.parentId}
                                        onChange={(event) => setFormData((current) => ({ ...current, parentId: event.target.value }))}
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="">Top level</option>
                                        {allMenuItems.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={cancelEdit}>
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                    onClick={editingId ? updateMenuItem : addMenuItem}
                                    disabled={actionLoading === "add" || actionLoading === "edit"}
                                >
                                    {(actionLoading === "add" || actionLoading === "edit") ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {editingId ? "Update" : "Create"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {allMenuItems.length > 0 ? (
                        <div className="space-y-2">
                            {allMenuItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`rounded-lg border transition-colors ${
                                        item.isActive ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 p-3">
                                        <GripVertical className="h-4 w-4 flex-shrink-0 text-slate-400" />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate font-medium text-slate-800">{item.label}</span>
                                                {item.label_en && <span className="truncate text-xs text-slate-500">/ {item.label_en}</span>}
                                            </div>
                                            <span className="text-xs text-slate-500">{item.url}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Badge variant={item.isActive ? "success" : "secondary"}>
                                                {item.isActive ? "Live" : "Hidden"}
                                            </Badge>
                                            <button
                                                onClick={() => moveMenuItem(allMenuItems, index, "up")}
                                                disabled={index === 0 || actionLoading === "reorder"}
                                                className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                                                title="Move up"
                                            >
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => moveMenuItem(allMenuItems, index, "down")}
                                                disabled={index === allMenuItems.length - 1 || actionLoading === "reorder"}
                                                className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                                                title="Move down"
                                            >
                                                <ArrowDown className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => toggleMenuItem(item.id)}
                                                disabled={actionLoading === item.id}
                                                className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                                title={item.isActive ? "Hide" : "Show"}
                                            >
                                                {item.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                                title="Edit"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => deleteMenuItem(item.id, item.label)}
                                                disabled={actionLoading === item.id}
                                                className="cursor-pointer rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {item.children && item.children.length > 0 && (
                                        <div className="border-t border-slate-100 bg-slate-50/50">
                                            {item.children.map((child, childIndex) => (
                                                <div
                                                    key={child.id}
                                                    className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 last:border-b-0 ml-6"
                                                >
                                                    <span className="text-sm text-slate-400">↳</span>
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-sm text-slate-700">{child.label}</span>
                                                        {child.label_en && <span className="ml-1 text-xs text-slate-500">/ {child.label_en}</span>}
                                                        <span className="ml-2 text-xs text-slate-500">{child.url}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Badge variant={child.isActive ? "success" : "secondary"}>
                                                            {child.isActive ? "Live" : "Hidden"}
                                                        </Badge>
                                                        <button
                                                            onClick={() => moveMenuItem(item.children, childIndex, "up")}
                                                            disabled={childIndex === 0}
                                                            className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                                                        >
                                                            <ArrowUp className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => moveMenuItem(item.children, childIndex, "down")}
                                                            disabled={childIndex === item.children.length - 1}
                                                            className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30"
                                                        >
                                                            <ArrowDown className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => toggleMenuItem(child.id)}
                                                            className="cursor-pointer rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                                                        >
                                                            {child.isActive ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                        </button>
                                                        <button
                                                            onClick={() => startEdit(child)}
                                                            className="cursor-pointer rounded p-1 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMenuItem(child.id, child.label)}
                                                            className="cursor-pointer rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
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
                        <div className="py-8 text-center text-slate-500">
                            <Settings className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                            <p>No navigation items yet.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === "header" && (
                <ConfigEditor
                    title="Header configuration"
                    configs={data?.header || {}}
                    onSave={(configs) => saveConfig("header", configs)}
                    saving={saving}
                    fields={[
                        { key: "logo_url", label: "Logo URL" },
                        { key: "logo_text", label: "Display name" },
                        { key: "phone", label: "Phone" },
                        { key: "email", label: "Email" },
                    ]}
                />
            )}

            {activeTab === "footer" && (
                <ConfigEditor
                    title="Footer configuration"
                    configs={data?.footer || {}}
                    onSave={(configs) => saveConfig("footer", configs)}
                    saving={saving}
                    fields={[
                        { key: "address", label: "Address" },
                        { key: "phone", label: "Phone" },
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

    useEffect(() => {
        setValues(configs);
    }, [configs]);

    return (
        <div className="rounded-[1.3rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{title}</h3>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={() => onSave(values)} disabled={saving}>
                    <Save className="h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                </Button>
            </div>
            <div className="space-y-4">
                {fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                        <label className="text-sm font-medium text-slate-700">{field.label}</label>
                        <Input
                            value={values[field.key] || ""}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    [field.key]: event.target.value,
                                }))
                            }
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
