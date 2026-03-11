"use client";

import { useState, useEffect } from "react";
import {
    Users,
    GraduationCap,
    MessageSquare,
    FileText,
    TrendingUp,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons";
import Link from "next/link";

interface DashboardData {
    stats: {
        totalPosts: number;
        totalCourses: number;
        totalRegistrations: number;
        pendingContacts: number;
        totalStaff: number;
        totalPartners: number;
    };
    recentRegistrations: {
        id: string;
        fullName: string;
        status: string;
        createdAt: string;
        course: { title: string; slug: string };
    }[];
    recentContacts: {
        id: string;
        fullName: string;
        email: string;
        subject: string | null;
        status: string;
        createdAt: string;
    }[];
}

const quickActions = [
    { label: "Thêm bài viết", href: "/admin/vi/posts/create", icon: FileText },
    { label: "Thêm khóa học", href: "/admin/vi/courses/create", icon: GraduationCap },
    { label: "Xem liên hệ", href: "/admin/contacts", icon: MessageSquare },
];

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then((res) => res.json())
            .then((result) => {
                if (result.success) setData(result.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    const stats = data
        ? [
            { label: "Tổng đăng ký", value: data.stats.totalRegistrations.toLocaleString(), icon: Users, color: "blue" },
            { label: "Khóa học", value: data.stats.totalCourses.toString(), icon: GraduationCap, color: "cyan" },
            { label: "Liên hệ chờ xử lý", value: data.stats.pendingContacts.toString(), icon: MessageSquare, color: "amber" },
            { label: "Bài viết", value: data.stats.totalPosts.toString(), icon: FileText, color: "green" },
        ]
        : [];

    const colorClasses: Record<string, string> = {
        blue: "from-blue-500 to-blue-600",
        cyan: "from-cyan-500 to-cyan-600",
        amber: "from-amber-500 to-amber-600",
        green: "from-green-500 to-green-600",
    };

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại! 👋</h2>
                <p className="text-white">Đây là tổng quan hoạt động của website.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Registrations */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-800">Đăng ký gần đây</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
                                    <th className="pb-3 font-medium">Họ tên</th>
                                    <th className="pb-3 font-medium">Khóa học</th>
                                    <th className="pb-3 font-medium">Ngày</th>
                                    <th className="pb-3 font-medium">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentRegistrations && data.recentRegistrations.length > 0 ? (
                                    data.recentRegistrations.map((reg) => (
                                        <tr key={reg.id} className="border-b border-slate-50 last:border-0">
                                            <td className="py-3 text-sm text-slate-800">{reg.fullName}</td>
                                            <td className="py-3 text-sm text-slate-600">{reg.course?.title || "N/A"}</td>
                                            <td className="py-3 text-sm text-slate-500">
                                                {new Date(reg.createdAt).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="py-3">
                                                <span className={`text-xs px-2 py-1 rounded-full ${reg.status === "ENROLLED" ? "bg-green-100 text-green-700" :
                                                    reg.status === "NEW" ? "bg-amber-100 text-amber-700" :
                                                        reg.status === "CONTACTED" ? "bg-blue-100 text-blue-700" :
                                                            "bg-red-100 text-red-700"
                                                    }`}>
                                                    {reg.status === "ENROLLED" ? "Đã ghi danh" :
                                                        reg.status === "NEW" ? "Mới" :
                                                            reg.status === "CONTACTED" ? "Đã liên hệ" : "Đã hủy"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-white">
                                            Chưa có đăng ký nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Thao tác nhanh</h3>
                        <div className="space-y-2">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link
                                        key={action.href}
                                        href={action.href}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100">
                                            <Icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{action.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Tổng quan</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-white" />
                                    <span className="text-sm text-slate-600">Nhân sự</span>
                                </div>
                                <span className="font-bold text-slate-800">{data?.stats.totalStaff || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                    <span className="text-sm text-slate-600">Đối tác</span>
                                </div>
                                <span className="font-bold text-slate-800">{data?.stats.totalPartners || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
