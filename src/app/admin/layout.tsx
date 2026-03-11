"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
    LayoutDashboard,
    FileText,
    GraduationCap,
    Wrench,
    Users,
    Handshake,
    Settings,
    Home,
    Menu,
    X,
    ChevronDown,
    Globe,
    MessageSquare,
    ClipboardList,
    Image
} from "lucide-react";
import { useState, useMemo } from "react";

type SidebarItemType = {
    label: string;
    labelEn?: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    localeAware?: boolean;
    children?: { label: string; labelEn?: string; href: string; localeAware?: boolean }[];
};

const sidebarItems: SidebarItemType[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        label: "Nội dung",
        labelEn: "Content",
        icon: FileText,
        children: [
            { label: "Bài viết", labelEn: "Posts", href: "/admin/{locale}/posts", localeAware: true },
            { label: "Danh mục", labelEn: "Categories", href: "/admin/categories" },
            { label: "Thư viện ảnh", labelEn: "Media", href: "/admin/media" },
        ]
    },
    {
        label: "Đào tạo",
        labelEn: "Courses",
        href: "/admin/{locale}/courses",
        icon: GraduationCap,
        localeAware: true
    },
    {
        label: "Dịch vụ",
        labelEn: "Services",
        href: "/admin/{locale}/services",
        icon: Wrench,
        localeAware: true
    },
    {
        label: "Nhân sự & Hội đồng",
        labelEn: "Staff & Advisory",
        icon: Users,
        children: [
            { label: "Cán bộ Nhân sự", labelEn: "Staff", href: "/admin/{locale}/staff", localeAware: true },
            { label: "Hội đồng Cố vấn", labelEn: "Advisory Board", href: "/admin/{locale}/advisory", localeAware: true },
            { label: "Phòng ban", labelEn: "Departments", href: "/admin/{locale}/departments", localeAware: true },
            { label: "Loại nhân sự", labelEn: "Staff Types", href: "/admin/{locale}/staff-types", localeAware: true },
        ]
    },
    {
        label: "Đối tác",
        labelEn: "Partners",
        href: "/admin/{locale}/partners",
        icon: Handshake,
        localeAware: true
    },
    {
        label: "Quản lý",
        labelEn: "Management",
        icon: ClipboardList,
        children: [
            { label: "Liên hệ", labelEn: "Contacts", href: "/admin/contacts" },
            { label: "Đăng ký", labelEn: "Registrations", href: "/admin/registrations" },
        ]
    },
    {
        label: "Cấu hình",
        labelEn: "Settings",
        icon: Settings,
        children: [
            { label: "Layout", href: "/admin/layout-config" },
            { label: "Trang chủ", labelEn: "Homepage", href: "/admin/homepage" },
            { label: "Cài đặt", labelEn: "Settings", href: "/admin/settings" },
        ]
    },
];

function resolveHref(href: string, locale: string): string {
    return href.replace("{locale}", locale);
}

function SidebarItem({ item, isActive, locale }: { item: SidebarItemType; isActive: boolean; locale: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isEn = locale === "en";

    if (hasChildren) {
        return (
            <div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all
            ${isOpen ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}
          `}
                >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 font-medium">{isEn && item.labelEn ? item.labelEn : item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                        {item.children!.map((child) => (
                            <Link
                                key={child.href}
                                href={resolveHref(child.href, locale)}
                                className="block px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                            >
                                {isEn && child.labelEn ? child.labelEn : child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={resolveHref(item.href!, locale)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 hover:bg-slate-50"
                }
      `}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{isEn && item.labelEn ? item.labelEn : item.label}</span>
        </Link>
    );
}

function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
    const pathname = usePathname();
    const router = useRouter();

    const switchLocale = (newLocale: string) => {
        if (newLocale === currentLocale) return;
        // Replace locale segment in URL: /admin/vi/posts -> /admin/en/posts
        const newPath = pathname.replace(`/admin/${currentLocale}/`, `/admin/${newLocale}/`);
        router.push(newPath);
    };

    return (
        <div className="flex items-center gap-2 px-4 py-3">
            <Globe className="w-4 h-4 text-slate-500" />
            <div className="flex rounded-lg border border-slate-200 overflow-hidden flex-1">
                <button
                    onClick={() => switchLocale("vi")}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${currentLocale === "vi"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                >
                    🇻🇳 VI
                </button>
                <button
                    onClick={() => switchLocale("en")}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${currentLocale === "en"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                >
                    🇬🇧 EN
                </button>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Extract current locale from URL pattern /admin/vi/... or /admin/en/...
    const currentLocale = useMemo(() => {
        const match = pathname.match(/^\/admin\/(vi|en)\//);
        return match ? match[1] : "vi";
    }, [pathname]);

    const isEn = currentLocale === "en";

    // Check if we're on a per-locale page
    const isLocalePage = pathname.match(/^\/admin\/(vi|en)\//);

    const getHeaderTitle = () => {
        if (pathname === "/admin") return "Dashboard";
        if (pathname.includes("/posts")) return isEn ? "Posts Management (EN)" : "Quản lý Bài viết";
        if (pathname.includes("/courses")) return isEn ? "Courses Management (EN)" : "Quản lý Đào tạo";
        if (pathname.includes("/services")) return isEn ? "Services Management (EN)" : "Quản lý Dịch vụ";
        if (pathname.includes("/staff-types")) return isEn ? "Staff Types (EN)" : "Loại nhân sự";
        if (pathname.includes("/staff")) return isEn ? "Staff Management (EN)" : "Quản lý Cán bộ";
        if (pathname.includes("/departments")) return isEn ? "Departments (EN)" : "Phòng ban";
        if (pathname.includes("/advisory")) return isEn ? "Advisory Board (EN)" : "Hội đồng Cố vấn";
        if (pathname.includes("/partners")) return isEn ? "Partners Management (EN)" : "Quản lý Đối tác";
        if (pathname.includes("/layout")) return "Layout Manager";
        if (pathname.includes("/homepage")) return "Homepage Manager";
        return "Admin";
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100"
                >
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <span className="ml-4 font-heading font-bold text-slate-800">SISRD Admin</span>
                <div className="ml-auto">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50
        transform transition-transform lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <div>
                            <div className="font-heading font-bold text-slate-800">SISRD</div>
                            <div className="text-xs text-slate-500">Admin Panel</div>
                        </div>
                    </Link>
                </div>

                {/* Locale Switcher */}
                <div className="border-b border-slate-100">
                    <LocaleSwitcher currentLocale={currentLocale} />
                </div>

                {/* Nav */}
                <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    {sidebarItems.map((item) => (
                        <SidebarItem
                            key={item.label}
                            item={item}
                            isActive={item.href ? resolveHref(item.href, currentLocale) === pathname : false}
                            locale={currentLocale}
                        />
                    ))}
                </nav>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        <span className="font-medium">{isEn ? "Back to site" : "Về trang chủ"}</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
                {/* Desktop Header */}
                <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center px-6 justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="font-heading font-bold text-slate-800">
                            {getHeaderTitle()}
                        </h1>
                        {isLocalePage && (
                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${isEn ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                                }`}>
                                {isEn ? "🇬🇧 EN" : "🇻🇳 VI"}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
