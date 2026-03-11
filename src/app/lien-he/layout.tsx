import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Liên hệ - Viện Phát triển Nguồn lực Xã hội Phương Nam (SISRD)",
    description:
        "Liên hệ với Viện Phương Nam qua điện thoại, email hoặc gửi tin nhắn trực tiếp. Địa chỉ: TP. Hồ Chí Minh. Hotline: 1900 1234.",
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
