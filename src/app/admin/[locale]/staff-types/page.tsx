"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    UsersRound,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/skeletons";

interface StaffType {
    id: string;
    name: string;
    name_en: string | null;
    level: number;
    isAdvisory: boolean;
    sortOrder: number;
}

export default function StaffTypesPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [staffTypes, setStaffTypes] = useState<StaffType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchStaffTypes = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/staff-types");
            const data = await res.json();
            if (data.success) {
                let filtered = data.data as StaffType[];
                if (searchTerm) {
                    filtered = filtered.filter((s: StaffType) =>
                        s.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setStaffTypes(filtered);
            }
        } catch (error) {
            console.error("Error fetching staff types:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => fetchStaffTypes(), 300);
        return () => clearTimeout(timer);
    }, [fetchStaffTypes]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa loại nhân sự "${name}"?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/staff-types/${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) fetchStaffTypes();
            else alert(data.error || "Không thể xóa loại nhân sự.");
        } catch (err) {
            console.error(err);
            alert("Lỗi kết nối.");
        }
        finally { setDeleting(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Staff Types Management (EN)" : "Quản lý Loại nhân sự"}</h1>
                    <p className="text-slate-500">{isEn ? "Manage English translations for staff types." : "Quản lý danh sách các loại nhân sự, tư cách thành viên."}</p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/staff-types/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm loại nhân sự
                        </Button>
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <Input placeholder={isEn ? "Search staff types..." : "Tìm kiếm loại nhân sự..."} className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <TableSkeleton rows={8} columns={6} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">#</th>
                                    <th className="px-4 py-3">{isEn ? "Staff Type Name" : "Tên loại nhân sự"}</th>
                                    <th className="px-4 py-3 text-center">{isEn ? "Level" : "Cấp độ ưu tiên"}</th>
                                    <th className="px-4 py-3 text-center">{isEn ? "Sort Order" : "Sắp xếp"}</th>
                                    <th className="px-4 py-3">{isEn ? "Type" : "Phân loại"}</th>
                                    <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {staffTypes.length > 0 ? staffTypes.map((type, index) => (
                                    <tr key={type.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800 flex items-center gap-2">
                                                <UsersRound className="w-4 h-4 text-white" />
                                                {isEn ? (type.name_en || type.name) : type.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-600">{type.level}</td>
                                        <td className="px-4 py-3 text-center text-slate-600">{type.sortOrder}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={type.isAdvisory ? "default" : "secondary"}>
                                                {type.isAdvisory ? (isEn ? "Advisory Board" : "Hội đồng Cố vấn") : (isEn ? "General Staff" : "Cán bộ Nhân sự")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/${locale}/staff-types/${type.id}`}>
                                                    <button className="p-2 hover:bg-amber-50 text-white hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                {!isEn && (
                                                    <button onClick={() => handleDelete(type.id, type.name)} disabled={deleting === type.id} className="p-2 hover:bg-red-50 text-white hover:text-red-600 rounded-lg transition-colors disabled:opacity-50" title="Xóa">
                                                        {deleting === type.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <UsersRound className="w-8 h-8 text-white" />
                                                <p>{searchTerm ? (isEn ? "No staff types match the search term." : "Không có loại nhân sự nào khớp với từ khóa.") : (isEn ? "No staff types yet." : "Chưa có loại nhân sự nào.")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
