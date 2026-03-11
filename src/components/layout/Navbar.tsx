"use client";

import * as React from "react";
import DynamicNavigation from "@/components/lightswind/dynamic-navigation";

export interface MenuItem {
    label: string;
    url: string;
    children?: MenuItem[];
    icon?: React.ReactNode;
    target?: "_self" | "_blank";
}

export interface NavbarProps {
    items?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
    {
        label: "Giới thiệu",
        url: "/gioi-thieu",
        children: [
            { label: "Tầm nhìn & Sứ mệnh", url: "/gioi-thieu/tam-nhin-su-menh" },
            { label: "Cơ cấu tổ chức", url: "/gioi-thieu/co-cau-to-chuc" },
            { label: "Hội đồng cố vấn", url: "/gioi-thieu/hoi-dong-co-van-khoa-hoc" },
            { label: "Đối tác", url: "/gioi-thieu/doi-tac" },
        ]
    },
    {
        label: "Đào tạo",
        url: "/dao-tao",
        children: [
            { label: "Tuyển sinh", url: "/dao-tao?type=ADMISSION" },
            { label: "Khóa ngắn hạn", url: "/dao-tao?type=SHORT_COURSE" },
            { label: "Du học", url: "/dao-tao?type=STUDY_ABROAD" },
        ]
    },
    {
        label: "Dịch vụ",
        url: "/dich-vu",
        children: [
            { label: "Đào tạo Đại học", url: "/dich-vu/dao-tao-dai-hoc" },
            { label: "Du học Quốc tế", url: "/dich-vu/du-hoc-quoc-te" },
            { label: "Chứng chỉ Nghề", url: "/dich-vu/chung-chi-nghe" },
        ]
    },
    { label: "Tin tức", url: "/tin-tuc" },
    { label: "Liên hệ", url: "/lien-he" },
];

// Helper to convert MenuItem array to DynamicNavigation links format
function mapMenuItemsToLinks(items: MenuItem[]) {
    return items.map((item, index) => ({
        id: `nav-${index}-${item.url.replace(/\W/g, '')}`,
        label: item.label,
        href: item.url,
        icon: item.icon,
        children: item.children ? item.children.map((child, cIndex) => ({
            id: `child-${index}-${cIndex}-${child.url.replace(/\W/g, '')}`,
            label: child.label,
            href: child.url,
            icon: child.icon,
        })) : undefined
    }));
}

const Navbar: React.FC<NavbarProps> = ({ items = defaultMenuItems }) => {
    const navigationLinks = React.useMemo(() => mapMenuItemsToLinks(items), [items]);

    return (
        <div className="hidden lg:block relative z-[75]">
            <DynamicNavigation
                links={navigationLinks}
                backgroundColor="transparent"
                textColor="inherit"
                highlightColor="rgba(59, 130, 246, 0.1)" /* Tailwind blue-500 at 10% opacity */
                className="border-none shadow-none"
            />
        </div>
    );
};

Navbar.displayName = "Navbar";

export { Navbar };
