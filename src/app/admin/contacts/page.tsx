"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye, Trash2, Search, Mail, Phone, Calendar, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";

interface Contact {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
    status: "NEW" | "READ" | "REPLIED";
    createdAt: string;
    course?: { id: string; title: string };
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [viewingContact, setViewingContact] = useState<Contact | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [updating, setUpdating] = useState(false);

    // Pagination (simplified)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20"
            });
            if (search) params.append("search", search);
            if (statusFilter) params.append("status", statusFilter);

            const res = await fetch(`/api/admin/contacts?${params}`);
            const data = await res.json();
            if (data.success) {
                setContacts(data.data);
                if (data.meta) setTotalPages(data.meta.totalPages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [page, search, statusFilter]);

    const handleView = async (contact: Contact) => {
        setViewingContact(contact);
        setAdminNotes(contact.subject || ""); // Assuming subject field is used for notes as per API

        // Auto mark as READ if NEW
        if (contact.status === "NEW") {
            try {
                await fetch(`/api/admin/contacts/${contact.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "READ" }),
                });
                fetchContacts(); // Refresh list background
            } catch (e) {
                console.error("Failed to mark read");
            }
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!viewingContact) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/contacts/${viewingContact.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    notes: adminNotes
                }),
            });
            if (res.ok) {
                setViewingContact(prev => prev ? ({ ...prev, status: newStatus as any, subject: adminNotes }) : null);
                fetchContacts();
                if (newStatus === "REPLIED") alert("Đã cập nhật trạng thái đã phản hồi");
            }
        } catch (error) {
            alert("Lỗi cập nhật");
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) return;
        try {
            const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
            if (res.ok) fetchContacts();
            else alert("Lỗi xóa liên hệ");
        } catch (error) {
            alert("Lỗi xóa liên hệ");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "NEW": return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Mới</span>;
            case "READ": return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Đã xem</span>;
            case "REPLIED": return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">Đã phản hồi</span>;
            default: return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Liên hệ từ khách hàng</h1>
                    <p className="text-slate-500">Quản lý các tin nhắn liên hệ từ website.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                        <Input
                            placeholder="Tìm kiếm theo tên, email, sđt..."
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
                        <option value="NEW">Mới</option>
                        <option value="READ">Đã xem</option>
                        <option value="REPLIED">Đã phản hồi</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 w-40">Ngày gửi</th>
                                <th className="px-4 py-3">Người gửi</th>
                                <th className="px-4 py-3">Nội dung</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Đang tải...</td></tr>
                            ) : contacts.length === 0 ? (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Chưa có liên hệ nào.</td></tr>
                            ) : (
                                contacts.map((contact) => (
                                    <tr key={contact.id} className={`hover:bg-slate-50 transition-colors ${contact.status === "NEW" ? "bg-blue-50/30" : ""}`}>
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                            {format(new Date(contact.createdAt), "dd/MM/yyyy HH:mm")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800">{contact.fullName}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {contact.email}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {contact.phone}</div>
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate text-slate-600">
                                            {contact.message}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getStatusBadge(contact.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => handleView(contact)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(contact.id)}>
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
                isOpen={!!viewingContact}
                onClose={() => setViewingContact(null)}
                title="Chi tiết liên hệ"
                size="lg"
            >
                {viewingContact && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block text-slate-500 mb-1">Người gửi</label>
                                <div className="font-medium text-slate-800 text-base">{viewingContact.fullName}</div>
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-1">Thời gian</label>
                                <div className="text-slate-800">{format(new Date(viewingContact.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}</div>
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-1">Email</label>
                                <div className="text-slate-800 flex items-center gap-2"><Mail className="w-4 h-4 text-white" /> <a href={`mailto:${viewingContact.email}`} className="text-blue-600 hover:underline">{viewingContact.email}</a></div>
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-1">Điện thoại</label>
                                <div className="text-slate-800 flex items-center gap-2"><Phone className="w-4 h-4 text-white" /> <a href={`tel:${viewingContact.phone}`} className="text-blue-600 hover:underline">{viewingContact.phone}</a></div>
                            </div>
                        </div>

                        {viewingContact.course && (
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <label className="text-xs font-medium text-purple-700 block mb-1">Quan tâm khóa học</label>
                                <div className="font-medium text-purple-900">{viewingContact.course.title}</div>
                            </div>
                        )}

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <label className="text-xs font-medium text-slate-500 uppercase block mb-2">Nội dung tin nhắn</label>
                            <p className="text-slate-800 whitespace-pre-wrap">{viewingContact.message}</p>
                        </div>

                        <div className="border-t border-slate-100 pt-4 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Ghi chú quản trị</label>
                                <Textarea
                                    placeholder="Ghi chú nội bộ về liên hệ này..."
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewingContact.status === "REPLIED" ? "primary" : "outline"}
                                        className={viewingContact.status === "REPLIED" ? "bg-green-600 hover:bg-green-700" : ""}
                                        onClick={() => handleUpdateStatus("REPLIED")}
                                        disabled={updating}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Đã phản hồi
                                    </Button>
                                    <Button
                                        variant={viewingContact.status === "READ" ? "secondary" : "outline"}
                                        className={viewingContact.status === "READ" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
                                        onClick={() => handleUpdateStatus("READ")}
                                        disabled={updating}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Đã xem
                                    </Button>
                                </div>
                                <Button variant="ghost" onClick={() => setViewingContact(null)}>Đóng</Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
