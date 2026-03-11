"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Users,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/skeletons";

interface StaffMember {
    id: string;
    name: string;
    name_en: string | null;
    title: string | null;
    title_en: string | null;
    email: string | null;
    phone: string | null;
    isActive: boolean;
    sortOrder: number;
    staffType: { id: string; name: string; level: number } | null;
    department: { id: string; name: string } | null;
}

export default function StaffPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchStaff = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set("search", searchTerm);
            params.set("type", "advisory");
            const res = await fetch(`/api/admin/staff?${params}`);
            const data = await res.json();
            if (data.success) setStaff(data.data);
        } catch (error) {
            console.error("Error fetching staff:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => fetchStaff(), 300);
        return () => clearTimeout(timer);
    }, [fetchStaff]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa "${name}"?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
            if (res.ok) fetchStaff();
            else alert("Không thể xóa nhân sự.");
        } catch { alert("Lỗi kết nối."); }
        finally { setDeleting(null); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Advisory Board (EN)" : "Hội đồng Cố vấn"}</h1>
                    <p className="text-slate-500">{isEn ? "Manage advisory board members." : "Quản lý thông tin Hội đồng Cố vấn Khoa học."}</p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/advisory/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm thành viên
                        </Button>
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <Input placeholder="Tìm kiếm theo tên..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <TableSkeleton rows={8} columns={7} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">#</th>
                                    <th className="px-4 py-3">{isEn ? "Full Name" : "Họ và tên"}</th>
                                    <th className="px-4 py-3">{isEn ? "Title" : "Chức danh"}</th>
                                    <th className="px-4 py-3">{isEn ? "Department" : "Phòng ban"}</th>
                                    <th className="px-4 py-3">{isEn ? "Type" : "Loại"}</th>
                                    <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                                    <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {staff.length > 0 ? staff.map((s, index) => (
                                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">{isEn ? (s.name_en || s.name) : s.name}</div>
                                            {s.email && <div className="text-xs text-slate-500">{s.email}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{isEn ? (s.title_en || s.title || "—") : (s.title || "—")}</td>
                                        <td className="px-4 py-3 text-slate-600">{s.department?.name || "—"}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                {s.staffType?.name || "—"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={s.isActive ? "success" : "secondary"}>
                                                {s.isActive ? (isEn ? "Active" : "Hoạt động") : (isEn ? "Hidden" : "Ẩn")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/${locale}/advisory/${s.id}`}>
                                                    <button className="p-2 hover:bg-amber-50 text-white hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button onClick={() => handleDelete(s.id, s.name)} disabled={deleting === s.id} className="p-2 hover:bg-red-50 text-white hover:text-red-600 rounded-lg transition-colors disabled:opacity-50" title="Xóa">
                                                    {deleting === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-white" />
                                                </div>
                                                <p>{isEn ? "No advisory board members yet." : "Chưa có thành viên hội đồng nào."}</p>
                                                {!isEn && (
                                                    <Link href={`/admin/${locale}/advisory/create`}>
                                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Thêm thành viên đầu tiên</Button>
                                                    </Link>
                                                )}
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
