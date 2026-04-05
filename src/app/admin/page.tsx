"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    Globe2,
    GraduationCap,
    MessageSquare,
    Palette,
    Settings2,
    Sparkles,
    Tags,
    Wrench,
} from "lucide-react";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/skeletons";

interface DashboardData {
    stats: {
        totalPosts: number;
        totalCourses: number;
        totalServices: number;
        totalReviews: number;
        totalTags: number;
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
    { label: "Site homepage", href: "/admin/site/homepage", icon: Sparkles },
    { label: "Site navigation", href: "/admin/site/navigation", icon: Globe2 },
    { label: "Site appearance", href: "/admin/site/appearance", icon: Palette },
    { label: "Create post", href: "/admin/vi/posts/create", icon: FileText },
    { label: "Create service", href: "/admin/vi/services/create", icon: Wrench },
    { label: "Review inbox", href: "/admin/contacts", icon: MessageSquare },
];

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard")
            .then((response) => response.json())
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
            { label: "Pending contacts", value: data.stats.pendingContacts.toString(), icon: MessageSquare, color: "amber" },
            { label: "Registrations", value: data.stats.totalRegistrations.toLocaleString(), icon: GraduationCap, color: "blue" },
            { label: "Posts", value: data.stats.totalPosts.toString(), icon: FileText, color: "green" },
            { label: "Services", value: data.stats.totalServices.toString(), icon: Wrench, color: "cyan" },
            { label: "Reviews", value: data.stats.totalReviews.toString(), icon: Sparkles, color: "violet" },
            { label: "Tags", value: data.stats.totalTags.toString(), icon: Tags, color: "slate" },
        ]
        : [];

    const colorClasses: Record<string, string> = {
        blue: "from-blue-500 to-blue-600",
        cyan: "from-cyan-500 to-cyan-600",
        amber: "from-amber-500 to-amber-600",
        green: "from-green-500 to-green-600",
        violet: "from-violet-500 to-violet-600",
        slate: "from-slate-500 to-slate-600",
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
                <h2 className="mb-2 text-2xl font-bold">Admin domains in one place</h2>
                <p className="text-white/90">
                    Site, content, people, operations, and media are now grouped around how the live system actually runs.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="mb-1 text-sm text-slate-500">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorClasses[stat.color]}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 font-bold text-slate-800">Quick actions</h3>
                    <div className="space-y-2">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 group-hover:bg-blue-100">
                                        <Icon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{action.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Recent registrations</h3>
                        <Link href="/admin/registrations" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                            Open queue
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                                    <th className="pb-3 font-medium">Name</th>
                                    <th className="pb-3 font-medium">Course</th>
                                    <th className="pb-3 font-medium">Date</th>
                                    <th className="pb-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.recentRegistrations?.length ? (
                                    data.recentRegistrations.map((registration) => (
                                        <tr key={registration.id} className="border-b border-slate-50 last:border-0">
                                            <td className="py-3 text-sm text-slate-800">{registration.fullName}</td>
                                            <td className="py-3 text-sm text-slate-600">{registration.course?.title || "N/A"}</td>
                                            <td className="py-3 text-sm text-slate-500">
                                                {new Date(registration.createdAt).toLocaleDateString("vi-VN")}
                                            </td>
                                            <td className="py-3">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs ${
                                                        registration.status === "ENROLLED"
                                                            ? "bg-green-100 text-green-700"
                                                            : registration.status === "NEW"
                                                                ? "bg-amber-100 text-amber-700"
                                                                : registration.status === "CONTACTED"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {registration.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-500">
                                            No registrations yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Team footprint</h3>
                    <Link href="/admin/site" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                        <Settings2 className="h-4 w-4" />
                        Open site workspace
                    </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Staff</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">{data?.stats.totalStaff || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Partners</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">{data?.stats.totalPartners || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Courses</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">{data?.stats.totalCourses || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
