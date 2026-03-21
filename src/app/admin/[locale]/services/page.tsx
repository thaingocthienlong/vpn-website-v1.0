"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Wrench,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/skeletons";

interface Service {
    id: string;
    title: string;
    title_en: string | null;
    slug: string;
    excerpt: string | null;
    excerpt_en: string | null;
    iconName: string | null;
    sortOrder: number;
    isActive: boolean;
}

export default function ServicesPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/services");
            const data = await res.json();
            if (data.success) {
                let filtered = data.data as Service[];
                if (searchTerm) {
                    filtered = filtered.filter((s: Service) =>
                        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (s.title_en?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        s.slug.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setServices(filtered);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => fetchServices(), 300);
        return () => clearTimeout(timer);
    }, [fetchServices]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${title}"?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (res.ok) fetchServices();
            else alert(data.error || "Không thể xóa dịch vụ.");
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
                    <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Services Management (EN)" : "Quản lý Dịch vụ"}</h1>
                    <p className="text-slate-500">{isEn ? "Manage services and translations." : "Quản lý danh sách các dịch vụ cung cấp."}</p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/services/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            {isEn ? "Add Service" : "Thêm dịch vụ"}
                        </Button>
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder={isEn ? "Search services..." : "Tìm kiếm dịch vụ..."} 
                        className="pl-9" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <TableSkeleton rows={8} columns={4} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">#</th>
                                    <th className="px-4 py-3">{isEn ? "Title" : "Tên dịch vụ"}</th>
                                    <th className="px-4 py-3">{isEn ? "Slug" : "Đường dẫn"}</th>
                                    <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                                    <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {services.length > 0 ? services.map((service, index) => (
                                    <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">
                                                {isEn ? (service.title_en || service.title) : service.title}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                                            /{service.slug}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={service.isActive ? "success" : "secondary"}>
                                                {service.isActive ? (isEn ? "Visible" : "Hiển thị") : (isEn ? "Hidden" : "Ẩn")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/${locale}/services/${service.id}`}>
                                                    <button className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button onClick={() => handleDelete(service.id, service.title)} disabled={deleting === service.id} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50" title={isEn ? "Delete" : "Xóa"}>
                                                    {deleting === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <Wrench className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p>{isEn ? "No services yet." : "Chưa có dịch vụ nào."}</p>
                                                {!isEn && (
                                                    <Link href={`/admin/${locale}/services/create`}>
                                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Thêm dịch vụ đầu tiên</Button>
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
