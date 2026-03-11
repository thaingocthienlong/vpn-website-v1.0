"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus,
    Search,
    Filter,
    Eye,
    Edit,
    Trash2,
    FileText,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/skeletons";
import { formatDate } from "@/lib/utils";

interface Post {
    id: string;
    title: string;
    title_en: string | null;
    slug: string;
    excerpt: string | null;
    isPublished: boolean;
    isFeatured: boolean;
    viewCount: number;
    createdAt: string;
    publishedAt: string | null;
    category: { id: string; name: string; slug: string } | null;
    author: { id: string; name: string; avatar: string | null } | null;
}

interface PostsResponse {
    success: boolean;
    data: {
        posts: Post[];
        meta: { page: number; limit: number; total: number; totalPages: number };
    };
}

export default function PostsPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchPosts = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "20");
            if (searchTerm) params.set("search", searchTerm);
            if (statusFilter !== "all") params.set("status", statusFilter);

            const res = await fetch(`/api/admin/posts?${params}`);
            const data: PostsResponse = await res.json();

            if (data.success) {
                setPosts(data.data.posts);
                setMeta(data.data.meta);
            }
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchPosts(), 300);
        return () => clearTimeout(timer);
    }, [fetchPosts]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchPosts(meta.page);
            } else {
                alert("Không thể xóa bài viết. Vui lòng thử lại.");
            }
        } catch {
            alert("Lỗi kết nối. Vui lòng thử lại.");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {isEn ? "Posts Management (EN)" : "Quản lý Bài viết"}
                    </h1>
                    <p className="text-slate-500">
                        {isEn ? "Manage English translations for posts." : "Quản lý các tin tức, thông báo và hoạt động."}
                    </p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/posts/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm bài viết
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <Input
                        placeholder="Tìm kiếm bài viết..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Nháp</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <TableSkeleton rows={10} columns={7} />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 w-12 text-center">#</th>
                                        <th className="px-4 py-3">{isEn ? "Post Title" : "Tiêu đề bài viết"}</th>
                                        <th className="px-4 py-3">{isEn ? "Category" : "Danh mục"}</th>
                                        <th className="px-4 py-3 text-center">{isEn ? "Views" : "Lượt xem"}</th>
                                        <th className="px-4 py-3">{isEn ? "Created" : "Ngày tạo"}</th>
                                        <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                                        <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {posts.length > 0 ? (
                                        posts.map((post, index) => (
                                            <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 text-center text-slate-500">
                                                    {(meta.page - 1) * 20 + index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-800 line-clamp-1 max-w-md" title={isEn ? (post.title_en || post.title) : post.title}>
                                                        {isEn ? (post.title_en || <span className="italic text-white">Not translated</span>) : post.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">/{post.slug}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                        {post.category?.name || (isEn ? "Uncategorized" : "Chưa phân loại")}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center text-slate-600">
                                                    {(post.viewCount || 0).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600">
                                                    {formatDate(post.createdAt)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={post.isPublished ? "success" : "warning"}>
                                                        {post.isPublished ? (isEn ? "Published" : "Đã xuất bản") : (isEn ? "Draft" : "Bản nháp")}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {post.isPublished && (
                                                            <Link href={isEn ? `/en/news/${post.category?.slug || 'uncategorized'}/${post.slug}` : `/tin-tuc/${post.category?.slug || 'uncategorized'}/${post.slug}`} target="_blank">
                                                                <button className="p-2 hover:bg-blue-50 text-white hover:text-blue-600 rounded-lg transition-colors" title={isEn ? "View" : "Xem"}>
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                            </Link>
                                                        )}
                                                        <Link href={`/admin/${locale}/posts/${post.id}`}>
                                                            <button className="p-2 hover:bg-amber-50 text-white hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(post.id, post.title)}
                                                            disabled={deleting === post.id}
                                                            className="p-2 hover:bg-red-50 text-white hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Xóa"
                                                        >
                                                            {deleting === post.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <FileText className="w-6 h-6 text-white" />
                                                    </div>
                                                    <p>{isEn ? "No posts found." : "Không tìm thấy bài viết nào."}</p>
                                                    {!isEn && (
                                                        <Link href={`/admin/${locale}/posts/create`}>
                                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                                                Tạo bài viết đầu tiên
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                {isEn
                                    ? <>Showing <span className="font-medium">{posts.length}</span> of <span className="font-medium">{meta.total}</span> posts</>
                                    : <>Hiển thị <span className="font-medium">{posts.length}</span> trên tổng số <span className="font-medium">{meta.total}</span> bài viết</>
                                }
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={meta.page <= 1}
                                    onClick={() => fetchPosts(meta.page - 1)}
                                >
                                    {isEn ? "Previous" : "Trước"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={meta.page >= meta.totalPages}
                                    onClick={() => fetchPosts(meta.page + 1)}
                                >
                                    {isEn ? "Next" : "Sau"}
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
