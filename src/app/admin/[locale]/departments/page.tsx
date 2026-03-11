"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Building,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/skeletons";

interface Department {
    id: string;
    name: string;
    name_en: string | null;
    slug: string;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
}

export default function DepartmentsPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/departments");
            const data = await res.json();
            if (data.success) {
                let filtered = data.data as Department[];
                if (searchTerm) {
                    filtered = filtered.filter((d: Department) =>
                        d.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setDepartments(filtered);
            }
        } catch (error) {
            console.error("Error fetching departments:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => fetchDepartments(), 300);
        return () => clearTimeout(timer);
    }, [fetchDepartments]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa phòng ban "${name}"?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) fetchDepartments();
            else alert(data.error || "Không thể xóa phòng ban.");
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
                    <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Departments Management (EN)" : "Quản lý Phòng ban"}</h1>
                    <p className="text-slate-500">{isEn ? "Manage English translations for departments." : "Quản lý danh sách cấu trúc các phòng ban và viện."}</p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/departments/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm phòng ban
                        </Button>
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <Input placeholder={isEn ? "Search departments..." : "Tìm kiếm phòng ban..."} className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <TableSkeleton rows={8} columns={5} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">#</th>
                                    <th className="px-4 py-3">{isEn ? "Department Name" : "Tên phòng ban"}</th>
                                    <th className="px-4 py-3 text-center">{isEn ? "Sort Order" : "Sắp xếp"}</th>
                                    <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                                    <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {departments.length > 0 ? departments.map((dept, index) => (
                                    <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800 flex items-center gap-2">
                                                <Building className="w-4 h-4 text-white" />
                                                {isEn ? (dept.name_en || dept.name) : dept.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-600">
                                            {dept.sortOrder}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={dept.isActive ? "success" : "secondary"}>
                                                {dept.isActive ? (isEn ? "Visible" : "Hoạt động") : (isEn ? "Hidden" : "Ẩn")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/${locale}/departments/${dept.id}`}>
                                                    <button className="p-2 hover:bg-amber-50 text-white hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                {!isEn && (
                                                    <button onClick={() => handleDelete(dept.id, dept.name)} disabled={deleting === dept.id} className="p-2 hover:bg-red-50 text-white hover:text-red-600 rounded-lg transition-colors disabled:opacity-50" title="Xóa">
                                                        {deleting === dept.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Building className="w-8 h-8 text-white" />
                                                <p>{searchTerm ? (isEn ? "No departments match the search term." : "Không có phòng ban nào khớp với từ khóa.") : (isEn ? "No departments yet." : "Chưa có phòng ban nào.")}</p>
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
