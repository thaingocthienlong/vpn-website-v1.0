"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye, Trash2, Search, Mail, Phone, Calendar, Briefcase, FileText, CheckCircle, XCircle, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface Registration {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    organization?: string;
    position?: string;
    message?: string;
    status: "NEW" | "CONTACTED" | "ENROLLED" | "CANCELLED";
    source?: string;
    createdAt: string;
    course: { id: string; title: string };
}

export default function RegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [viewingReg, setViewingReg] = useState<Registration | null>(null);
    const [updating, setUpdating] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20"
            });
            if (search) params.append("search", search);
            if (statusFilter) params.append("status", statusFilter);

            const res = await fetch(`/api/admin/registrations?${params}`);
            const data = await res.json();
            if (data.success) {
                setRegistrations(data.data);
                if (data.meta) setTotalPages(data.meta.totalPages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegistrations();
    }, [page, search, statusFilter]);

    const handleView = (reg: Registration) => {
        setViewingReg(reg);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!viewingReg) return;
        if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái sang "${newStatus}"? Email thông báo sẽ được gửi cho khách hàng.`)) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/registrations/${viewingReg.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setViewingReg(prev => prev ? ({ ...prev, status: newStatus as any }) : null);
                fetchRegistrations();
                alert(`Đã cập nhật trạng thái: ${newStatus}`);
            } else {
                const data = await res.json();
                alert(data.error || "Lỗi cập nhật");
            }
        } catch (error) {
            alert("Lỗi cập nhật");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa đăng ký này? Hành động này không thể hoàn tác.")) return;
        try {
            const res = await fetch(`/api/admin/registrations/${id}`, { method: "DELETE" });
            if (res.ok) fetchRegistrations();
            else alert("Lỗi xóa đăng ký");
        } catch (error) {
            alert("Lỗi xóa đăng ký");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "NEW": return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Mới đăng ký</span>;
            case "CONTACTED": return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Đã liên hệ</span>;
            case "ENROLLED": return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Đã nhập học</span>;
            case "CANCELLED": return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Đã hủy</span>;
            default: return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Đăng ký khóa học</h1>
                    <p className="text-slate-500">Quản lý danh sách học viên đăng ký từ website.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                        <Input
                            placeholder="Tìm theo tên, email, khóa học..."
                            className="pl-9"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="NEW">Mới đăng ký</option>
                        <option value="CONTACTED">Đã liên hệ</option>
                        <option value="ENROLLED">Đã nhập học</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 w-32">Ngày đăng ký</th>
                                <th className="px-4 py-3">Học viên</th>
                                <th className="px-4 py-3">Khóa học đăng ký</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : registrations.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chưa có đăng ký nào.</td></tr>
                            ) : (
                                registrations.map((reg) => (
                                    <tr key={reg.id} className={`hover:bg-slate-50 transition-colors ${reg.status === "NEW" ? "bg-blue-50/30" : ""}`}>
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                            {format(new Date(reg.createdAt), "dd/MM/yyyy HH:mm")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">{reg.fullName}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {reg.email}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {reg.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 font-medium">
                                            {reg.course.title}
                                            {reg.organization && (
                                                <div className="text-xs text-slate-500 font-normal mt-1 flex items-center gap-1">
                                                    <Briefcase className="w-3 h-3" /> {reg.organization}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(reg.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => handleView(reg)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(reg.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex justify-center gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</Button>
                        <span className="text-sm flex items-center px-2 text-slate-600">Trang {page} / {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sau</Button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={!!viewingReg}
                onClose={() => setViewingReg(null)}
                title="Chi tiết đăng ký"
                size="lg"
            >
                {viewingReg && (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div>
                                <label className="text-xs font-medium text-blue-700 uppercase block mb-1">Khóa học đăng ký</label>
                                <h3 className="text-lg font-bold text-blue-900">{viewingReg.course.title}</h3>
                            </div>
                            <div className="text-right">
                                <label className="text-xs font-medium text-blue-700 uppercase block mb-1">Thời gian đăng ký</label>
                                <div className="text-sm text-blue-900">{format(new Date(viewingReg.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                            <div className="col-span-2 border-b border-slate-100 pb-2 mb-2 font-semibold text-slate-800">Thông tin cá nhân</div>

                            <div>
                                <label className="block text-slate-500 mb-1">Họ và tên</label>
                                <div className="font-medium text-slate-800 text-base">{viewingReg.fullName}</div>
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-1">Email</label>
                                <div className="text-slate-800 flex items-center gap-2"><Mail className="w-4 h-4 text-white" /> <a href={`mailto:${viewingReg.email}`} className="text-blue-600 hover:underline">{viewingReg.email}</a></div>
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-1">Điện thoại</label>
                                <div className="text-slate-800 flex items-center gap-2"><Phone className="w-4 h-4 text-white" /> <a href={`tel:${viewingReg.phone}`} className="text-blue-600 hover:underline">{viewingReg.phone}</a></div>
                            </div>

                            <div className="col-span-2 border-b border-slate-100 pb-2 mb-2 font-semibold text-slate-800 mt-2">Thông tin công việc</div>

                            <div>
                                <label className="block text-slate-500 mb-1">Đơn vị công tác</label>
                                <div className="text-slate-800">{viewingReg.organization || "---"}</div>
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-1">Chức vụ</label>
                                <div className="text-slate-800">{viewingReg.position || "---"}</div>
                            </div>

                            {viewingReg.message && (
                                <div className="col-span-2 mt-2">
                                    <label className="block text-slate-500 mb-1">Lời nhắn / Ghi chú</label>
                                    <div className="bg-slate-50 p-3 rounded text-slate-800 whitespace-pre-wrap">{viewingReg.message}</div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <label className="text-sm font-medium text-slate-700 mb-3 block">Cập nhật trạng thái xử lý</label>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <Button
                                    variant="outline"
                                    className={`justify-start ${viewingReg.status === "NEW" ? "border-blue-500 bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}
                                    onClick={() => handleUpdateStatus("NEW")}
                                    disabled={updating}
                                >
                                    <Clock className="w-4 h-4 mr-2" /> Mới
                                </Button>
                                <Button
                                    variant="outline"
                                    className={`justify-start ${viewingReg.status === "CONTACTED" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "hover:bg-slate-50"}`}
                                    onClick={() => handleUpdateStatus("CONTACTED")}
                                    disabled={updating}
                                >
                                    <Phone className="w-4 h-4 mr-2" /> Đã liên hệ
                                </Button>
                                <Button
                                    variant="outline"
                                    className={`justify-start ${viewingReg.status === "ENROLLED" ? "border-green-500 bg-green-50 text-green-700" : "hover:bg-slate-50"}`}
                                    onClick={() => handleUpdateStatus("ENROLLED")}
                                    disabled={updating}
                                >
                                    <UserCheck className="w-4 h-4 mr-2" /> Đã nhập học
                                </Button>
                                <Button
                                    variant="outline"
                                    className={`justify-start ${viewingReg.status === "CANCELLED" ? "border-slate-500 bg-slate-100 text-slate-700" : "hover:bg-slate-50"}`}
                                    onClick={() => handleUpdateStatus("CANCELLED")}
                                    disabled={updating}
                                >
                                    <XCircle className="w-4 h-4 mr-2" /> Đã hủy
                                </Button>
                            </div>
                            <p className="text-xs text-white mt-2 italic">* Lưu ý: Khi thay đổi trạng thái, hệ thống sẽ tự động gửi email thông báo cho học viên.</p>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="ghost" onClick={() => setViewingReg(null)}>Đóng</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
