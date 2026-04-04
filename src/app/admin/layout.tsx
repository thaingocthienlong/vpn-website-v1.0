"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    Home,
    Menu,
    X,
    ChevronDown,
    Globe,
    ClipboardList,
    Image,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SidebarChild = {
    label: string;
    labelEn?: string;
    href: string;
    localeAware?: boolean;
};

type SidebarItemType = {
    label: string;
    labelEn?: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    localeAware?: boolean;
    children?: SidebarChild[];
};

const sidebarItems: SidebarItemType[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Site",
        labelEn: "Site",
        icon: Settings,
        children: [
            { label: "Workspace", labelEn: "Workspace", href: "/admin/site" },
            { label: "Homepage", labelEn: "Homepage", href: "/admin/site/homepage" },
            { label: "Navigation", labelEn: "Navigation", href: "/admin/site/navigation" },
            { label: "Settings", labelEn: "Settings", href: "/admin/site/settings" },
        ],
    },
    {
        label: "Nội dung",
        labelEn: "Content",
        icon: FileText,
        children: [
            { label: "Bài viết", labelEn: "Posts", href: "/admin/{locale}/posts", localeAware: true },
            { label: "Danh mục", labelEn: "Categories", href: "/admin/categories" },
            { label: "Thẻ", labelEn: "Tags", href: "/admin/tags" },
            { label: "Khóa học", labelEn: "Courses", href: "/admin/{locale}/courses", localeAware: true },
            { label: "Dịch vụ", labelEn: "Services", href: "/admin/{locale}/services", localeAware: true },
            { label: "Đánh giá", labelEn: "Reviews", href: "/admin/reviews" },
        ],
    },
    {
        label: "Con người",
        labelEn: "People",
        icon: Users,
        children: [
            { label: "Cán bộ Nhân sự", labelEn: "Staff", href: "/admin/{locale}/staff", localeAware: true },
            { label: "Hội đồng Cố vấn", labelEn: "Advisory Board", href: "/admin/{locale}/advisory", localeAware: true },
            { label: "Phòng ban", labelEn: "Departments", href: "/admin/{locale}/departments", localeAware: true },
            { label: "Loại nhân sự", labelEn: "Staff Types", href: "/admin/{locale}/staff-types", localeAware: true },
            { label: "Đối tác", labelEn: "Partners", href: "/admin/{locale}/partners", localeAware: true },
        ],
    },
    {
        label: "Vận hành",
        labelEn: "Operations",
        icon: ClipboardList,
        children: [
            { label: "Liên hệ", labelEn: "Contacts", href: "/admin/contacts" },
            { label: "Đăng ký", labelEn: "Registrations", href: "/admin/registrations" },
        ],
    },
    {
        label: "Media",
        labelEn: "Media",
        href: "/admin/media",
        icon: Image,
    },
];

function resolveHref(href: string, locale: string): string {
    return href.replace("{locale}", locale);
}

function SidebarItem({
    item,
    locale,
    pathname,
}: {
    item: SidebarItemType;
    locale: string;
    pathname: string;
}) {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const isEn = locale === "en";
    const childActive = item.children?.some((child) => resolveHref(child.href, locale) === pathname) || false;
    const itemActive = item.href ? resolveHref(item.href, locale) === pathname : childActive;
    const [isOpen, setIsOpen] = useState(childActive);

    useEffect(() => {
        if (childActive) setIsOpen(true);
    }, [childActive]);

    if (hasChildren) {
        return (
            <div>
                <button
                    onClick={() => setIsOpen((current) => !current)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        itemActive ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                    }`}
                >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 font-medium">{isEn && item.labelEn ? item.labelEn : item.label}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                        {item.children!.map((child) => {
                            const childHref = resolveHref(child.href, locale);
                            const isChildActive = childHref === pathname;

                            return (
                                <Link
                                    key={child.href}
                                    href={childHref}
                                    className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                                        isChildActive
                                            ? "bg-[rgba(23,88,216,0.1)] text-blue-700"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                                    }`}
                                >
                                    {isEn && child.labelEn ? child.labelEn : child.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={resolveHref(item.href!, locale)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                itemActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 hover:bg-slate-50"
            }`}
        >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{isEn && item.labelEn ? item.labelEn : item.label}</span>
        </Link>
    );
}

function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
    const pathname = usePathname();
    const router = useRouter();

    const switchLocale = (nextLocale: string) => {
        if (nextLocale === currentLocale) return;
        const nextPath = pathname.replace(`/admin/${currentLocale}/`, `/admin/${nextLocale}/`);
        router.push(nextPath);
    };

    return (
        <div className="flex items-center gap-2 px-4 py-3">
            <Globe className="w-4 h-4 text-slate-500" />
            <div className="flex flex-1 overflow-hidden rounded-lg border border-slate-200">
                <button
                    onClick={() => switchLocale("vi")}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                        currentLocale === "vi" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                    VI
                </button>
                <button
                    onClick={() => switchLocale("en")}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                        currentLocale === "en" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                    EN
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

    const currentLocale = useMemo(() => {
        const match = pathname.match(/^\/admin\/(vi|en)\//);
        return match ? match[1] : "vi";
    }, [pathname]);

    const isLocalePage = /^\/admin\/(vi|en)\//.test(pathname);
    const isEn = currentLocale === "en";

    const getHeaderTitle = () => {
        if (pathname === "/admin") return "Dashboard";
        if (pathname === "/admin/site") return "Site Admin";
        if (pathname.includes("/site/homepage")) return "Homepage Manager";
        if (pathname.includes("/site/navigation")) return "Navigation Manager";
        if (pathname.includes("/site/settings")) return "Global Site Settings";
        if (pathname.includes("/posts")) return isEn ? "Posts" : "Quản lý Bài viết";
        if (pathname.includes("/courses")) return isEn ? "Courses" : "Quản lý Đào tạo";
        if (pathname.includes("/services")) return isEn ? "Services" : "Quản lý Dịch vụ";
        if (pathname.includes("/reviews")) return isEn ? "Reviews" : "Quản lý Đánh giá";
        if (pathname.includes("/tags")) return isEn ? "Tags" : "Quản lý Thẻ";
        if (pathname.includes("/staff-types")) return isEn ? "Staff Types" : "Loại nhân sự";
        if (pathname.includes("/staff")) return isEn ? "Staff" : "Quản lý Cán bộ";
        if (pathname.includes("/departments")) return isEn ? "Departments" : "Phòng ban";
        if (pathname.includes("/advisory")) return isEn ? "Advisory Board" : "Hội đồng Cố vấn";
        if (pathname.includes("/partners")) return isEn ? "Partners" : "Quản lý Đối tác";
        if (pathname.includes("/contacts")) return isEn ? "Contacts" : "Liên hệ";
        if (pathname.includes("/registrations")) return isEn ? "Registrations" : "Đăng ký";
        if (pathname.includes("/media")) return "Media Library";
        if (pathname.includes("/categories")) return isEn ? "Categories" : "Danh mục";
        return "Admin";
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-4">
                <button onClick={() => setSidebarOpen((current) => !current)} className="p-2 rounded-lg hover:bg-slate-100">
                    {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <span className="ml-4 font-heading font-bold text-slate-800">SISRD Admin</span>
                <div className="ml-auto">
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            )}

            <aside
                className={`fixed top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
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

                {isLocalePage && (
                    <div className="border-b border-slate-100">
                        <LocaleSwitcher currentLocale={currentLocale} />
                    </div>
                )}

                <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
                    {sidebarItems.map((item) => (
                        <SidebarItem key={item.label} item={item} locale={currentLocale} pathname={pathname} />
                    ))}
                </nav>

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

            <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
                <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center px-6 justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="font-heading font-bold text-slate-800">{getHeaderTitle()}</h1>
                        {isLocalePage && (
                            <span
                                className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                    isEn ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                                }`}
                            >
                                {isEn ? "EN" : "VI"}
                            </span>
                        )}
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </header>

                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
