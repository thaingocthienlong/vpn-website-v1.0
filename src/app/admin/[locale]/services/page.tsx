"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus, Search, Eye, Edit, Trash2, Briefcase
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
    content: string | null;
    isPublished: boolean;
    sortOrder: number;
}

export default function ServicesPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [services, setServices] = useState<Service[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set("search", searchTerm);
            const res = await fetch(`/api/admin/services?${params}`);
            const data = await res.json();
            if (data.success) setServices(data.data);
        } catch (e) {
            console.error("Error fetching services:", e);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${title}"?`)) return;
        try {
            const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) fetchServices();
            else alert(data.error || "Không thể xóa.");
        } catch { alert("Lỗi kết nối server."); }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Services Management (EN)" : "Quản lý Dịch vụ"}</h1>
                    <p className="text-slate-500">{isEn ? "Manage English translations for services." : "Quản lý các dịch vụ cung cấp cho doanh nghiệp và đối tác."}</p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/services/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm dịch vụ
                        </Button>
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <Input
                        placeholder="Tìm kiếm dịch vụ..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <TableSkeleton rows={6} columns={5} />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">#</th>
                                    <th className="px-4 py-3">{isEn ? "Service Name" : "Tên dịch vụ"}</th>
                                    <th className="px-4 py-3">Slug</th>
                                    <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                                    <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {services.length > 0 ? (
                                    services.map((service, index) => (
                                        <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">{isEn ? (service.title_en || <span className="italic text-white">Not translated</span>) : service.title}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500 font-mono">/{service.slug}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={service.isPublished ? "success" : "secondary"}>
                                                    {service.isPublished ? (isEn ? "Published" : "Công khai") : (isEn ? "Draft" : "Bản nháp")}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={isEn ? `/en/services/${service.slug}` : `/dich-vu/${service.slug}`} target="_blank">
                                                        <button className="p-2 hover:bg-blue-50 text-white hover:text-blue-600 rounded-lg transition-colors" title={isEn ? "View" : "Xem"}>
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <Link href={`/admin/${locale}/services/${service.id}`}>
                                                        <button className="p-2 hover:bg-amber-50 text-white hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </Link>
                                                    <button onClick={() => handleDelete(service.id, service.title)} className="p-2 hover:bg-red-50 text-white hover:text-red-600 rounded-lg transition-colors" title="Xóa">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <Briefcase className="w-6 h-6 text-white" />
                                                </div>
                                                <p>{isEn ? "No services found." : "Không tìm thấy dịch vụ nào."}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div >
    );
}
