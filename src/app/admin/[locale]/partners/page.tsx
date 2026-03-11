"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Handshake,
    ExternalLink,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/skeletons";

interface Partner {
    id: string;
    name: string;
    name_en: string | null;
    website: string | null;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
}

export default function PartnersPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchPartners = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/partners");
            const data = await res.json();
            if (data.success) {
                let filtered = data.data as Partner[];
                if (searchTerm) {
                    filtered = filtered.filter((p: Partner) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setPartners(filtered);
            }
        } catch (error) {
            console.error("Error fetching partners:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => fetchPartners(), 300);
        return () => clearTimeout(timer);
    }, [fetchPartners]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa đối tác "${name}"?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (res.ok) fetchPartners();
            else alert(data.error || "Không thể xóa đối tác.");
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
                    <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Partners Management (EN)" : "Quản lý Đối tác"}</h1>
                    <p className="text-slate-500">{isEn ? "Manage English translations for partners." : "Quản lý danh sách đối tác và khách hàng tiêu biểu."}</p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/partners/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm đối tác
                        </Button>
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <Input placeholder="Tìm kiếm đối tác..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                                    <th className="px-4 py-3">{isEn ? "Partner Name" : "Tên đối tác"}</th>
                                    <th className="px-4 py-3">Website</th>
                                    <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                                    <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {partners.length > 0 ? partners.map((partner, index) => (
                                    <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">{isEn ? (partner.name_en || partner.name) : partner.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {partner.website ? (
                                                <a href={partner.website} target="_blank" rel="noreferrer" className="flex items-center hover:text-blue-600">
                                                    {partner.website} <ExternalLink className="w-3 h-3 ml-1" />
                                                </a>
                                            ) : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={partner.isActive ? "success" : "secondary"}>
                                                {partner.isActive ? (isEn ? "Visible" : "Hiển thị") : (isEn ? "Hidden" : "Ẩn")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/${locale}/partners/${partner.id}`}>
                                                    <button className="p-2 hover:bg-amber-50 text-white hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button onClick={() => handleDelete(partner.id, partner.name)} disabled={deleting === partner.id} className="p-2 hover:bg-red-50 text-white hover:text-red-600 rounded-lg transition-colors disabled:opacity-50" title="Xóa">
                                                    {deleting === partner.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <Handshake className="w-6 h-6 text-white" />
                                                </div>
                                                <p>{isEn ? "No partners yet." : "Chưa có đối tác nào."}</p>
                                                {!isEn && (
                                                    <Link href={`/admin/${locale}/partners/create`}>
                                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Thêm đối tác đầu tiên</Button>
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
