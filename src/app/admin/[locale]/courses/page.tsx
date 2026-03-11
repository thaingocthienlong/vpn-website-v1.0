"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    GraduationCap,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/skeletons";

interface Course {
    id: string;
    title: string;
    title_en: string | null;
    slug: string;
    type: string;
    isPublished: boolean;
    isFeatured: boolean;
    isRegistrationOpen: boolean;
    viewCount: number;
    createdAt: string;
    category: { id: string; name: string } | null;
}

export default function CoursesPage() {
    const { locale } = useParams<{ locale: string }>();
    const isEn = locale === "en";
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.set("search", searchTerm);
            if (statusFilter !== "all") params.set("status", statusFilter);

            const res = await fetch(`/api/admin/courses?${params}`);
            const data = await res.json();
            if (data.success) setCourses(data.data.courses);
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => fetchCourses(), 300);
        return () => clearTimeout(timer);
    }, [fetchCourses]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa khóa học "${title}"?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
            if (res.ok) fetchCourses();
            else alert("Không thể xóa khóa học.");
        } catch { alert("Lỗi kết nối."); }
        finally { setDeleting(null); }
    };

    const courseTypes: Record<string, string> = isEn ? {
        ADMISSION: "Admission",
        SHORT_COURSE: "Short Course",
        STUDY_ABROAD: "Study Abroad",
    } : {
        ADMISSION: "Tuyển sinh",
        SHORT_COURSE: "Bồi dưỡng",
        STUDY_ABROAD: "Du học",
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{isEn ? "Courses Management (EN)" : "Quản lý Khóa học"}</h1>
                    <p className="text-slate-500">{isEn ? "Manage English translations for courses." : "Quản lý các chương trình đào tạo và huấn luyện."}</p>
                </div>
                {!isEn && (
                    <Link href={`/admin/${locale}/courses/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Plus className="w-4 h-4" />
                            Thêm khóa học
                        </Button>
                    </Link>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                    <Input placeholder="Tìm kiếm khóa học..." className="pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select className="h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        <option value="published">Đã xuất bản</option>
                        <option value="draft">Nháp</option>
                    </select>
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
                                    <th className="px-4 py-3">{isEn ? "Course Name" : "Tên khóa học"}</th>
                                    <th className="px-4 py-3">{isEn ? "Type" : "Loại"}</th>
                                    <th className="px-4 py-3">{isEn ? "Category" : "Danh mục"}</th>
                                    <th className="px-4 py-3">{isEn ? "Status" : "Trạng thái"}</th>
                                    <th className="px-4 py-3 text-right">{isEn ? "Actions" : "Thao tác"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {courses.length > 0 ? courses.map((course, index) => (
                                    <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800 line-clamp-1 max-w-md">{isEn ? (course.title_en || <span className="italic text-white">Not translated</span>) : course.title}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">/{course.slug}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                {courseTypes[course.type] || course.type}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{course.category?.name || "—"}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={course.isPublished ? "success" : "warning"}>
                                                {course.isPublished ? (isEn ? "Published" : "Đã xuất bản") : (isEn ? "Draft" : "Bản nháp")}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/${locale}/courses/${course.id}`}>
                                                    <button className="p-2 hover:bg-amber-50 text-white hover:text-amber-600 rounded-lg transition-colors" title={isEn ? "Edit" : "Sửa"}>
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button onClick={() => handleDelete(course.id, course.title)} disabled={deleting === course.id} className="p-2 hover:bg-red-50 text-white hover:text-red-600 rounded-lg transition-colors disabled:opacity-50" title="Xóa">
                                                    {deleting === course.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <GraduationCap className="w-6 h-6 text-white" />
                                                </div>
                                                <p>{isEn ? "No courses found." : "Không tìm thấy khóa học nào."}</p>
                                                {!isEn && (
                                                    <Link href={`/admin/${locale}/courses/create`}>
                                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">Tạo khóa học đầu tiên</Button>
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
