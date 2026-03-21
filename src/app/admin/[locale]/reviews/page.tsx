"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    MessageSquare,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/skeletons";

interface Review {
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    content: string;
    content_en: string | null;
    rating: number;
    isActive: boolean;
    sortOrder: number;
    avatar?: { url: string } | null;
}

export default function ReviewsPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/reviews");
            const data = await res.json();
            if (data.success) {
                let filtered = data.data as Review[];
                if (searchTerm) {
                    filtered = filtered.filter((r: Review) =>
                        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.content.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                }
                setReviews(filtered);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => fetchReviews(), 300);
        return () => clearTimeout(timer);
    }, [fetchReviews]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa đánh giá của "${name}"?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
            const data = await res.json().catch(() => ({}));
            if (res.ok) fetchReviews();
            else alert(data.error || "Không thể xóa đánh giá.");
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
                    <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Reviews Management (EN)" : "Quản lý Đánh giá"}</h1>
                    <p className="text-slate-500">{isEn ? "Manage customer reviews and ratings." : "Quản lý danh sách đánh giá của khách hàng/học viên."}</p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/reviews/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            {isEn ? "Add Review" : "Thêm đánh giá"}
                        </Button>
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                        placeholder={isEn ? "Search reviews..." : "Tìm kiếm đánh giá..."} 
                        className="pl-9" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
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
                                    <th className="px-4 py-3">{isEn ? "Reviewer" : "Người đánh giá"}</th>
                                    <th className="px-4 py-3">{isEn ? "Role/Company" : "Chức vụ/Công ty"}</th>
                                    <th className="px-4 py-3 text-center">{isEn ? "Rating" : "Đánh giá"}</th>
                                    <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                                    <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {reviews.length > 0 ? reviews.map((review, index) => (
                                    <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {review.avatar?.url ? (
                                                    <img src={review.avatar.url} alt={review.name} className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-medium">
                                                        {review.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="font-medium text-slate-800">{review.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {review.role || review.company ? (
                                                <span>{review.role}{review.role && review.company && " - "}{review.company}</span>
                                            ) : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-center text-amber-500">
                                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={review.isActive ? "success" : "secondary"}>
                                                {review.isActive ? (isEn ? "Visible" : "Hiển thị") : (isEn ? "Hidden" : "Ẩn")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/${locale}/reviews/${review.id}`}>
                                                    <button className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button onClick={() => handleDelete(review.id, review.name)} disabled={deleting === review.id} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50" title={isEn ? "Delete" : "Xóa"}>
                                                    {deleting === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <MessageSquare className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <p>{isEn ? "No reviews yet." : "Chưa có đánh giá nào."}</p>
                                                {!isEn && (
                                                    <Link href={`/admin/${locale}/reviews/create`}>
                                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Thêm đánh giá đầu tiên</Button>
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
