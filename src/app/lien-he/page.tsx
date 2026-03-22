"use client";

import ContactPageClient from "@/components/contact/ContactPageClient";

const subjectOptions = [
    { value: "tu-van-dich-vu", label: "Tư vấn dịch vụ" },
    { value: "dang-ky-khoa-hoc", label: "Đăng ký khóa học" },
    { value: "hop-tac-kinh-doanh", label: "Hợp tác kinh doanh" },
    { value: "khac", label: "Khác" },
];

const infoItems = [
    {
        icon: "map" as const,
        title: "Địa chỉ",
        content: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
    },
    {
        icon: "phone" as const,
        title: "Điện thoại",
        content: "1900 1234",
        href: "tel:19001234",
    },
    {
        icon: "email" as const,
        title: "Email",
        content: "info@sisrd.org.vn",
        href: "mailto:info@sisrd.org.vn",
    },
    {
        icon: "clock" as const,
        title: "Giờ làm việc",
        content: "Thứ 2 - Thứ 6: 8:00 - 17:30",
    },
];

export default function ContactPage() {
    return (
        <ContactPageClient
            texts={{
                badge: "Liên hệ",
                title: "Kết nối với chúng tôi",
                description:
                    "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua thông tin bên dưới hoặc gửi tin nhắn trực tiếp.",
                infoTitle: "Thông tin liên hệ",
                formTitle: "Gửi tin nhắn",
                successTitle: "Gửi thành công!",
                successDescription:
                    "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.",
                sendAnotherLabel: "Gửi tin nhắn khác",
                submitLabel: "Gửi tin nhắn",
                submittingLabel: "Đang gửi...",
                fields: {
                    fullNameLabel: "Họ và tên *",
                    fullNamePlaceholder: "Nguyễn Văn A",
                    emailLabel: "Email *",
                    emailPlaceholder: "email@example.com",
                    phoneLabel: "Số điện thoại",
                    phonePlaceholder: "0901 234 567",
                    subjectLabel: "Chủ đề *",
                    subjectPlaceholder: "-- Chọn chủ đề --",
                    messageLabel: "Nội dung *",
                    messagePlaceholder: "Nội dung tin nhắn...",
                },
                errors: {
                    fullName: "Vui lòng nhập họ tên (tối thiểu 2 ký tự)",
                    email: "Vui lòng nhập email hợp lệ",
                    phone: "Số điện thoại không hợp lệ",
                    subject: "Vui lòng chọn chủ đề",
                    message: "Vui lòng nhập nội dung (tối thiểu 10 ký tự)",
                },
            }}
            infoItems={infoItems}
            subjectOptions={subjectOptions}
            mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.024!2d106.7!3d10.7328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQzJzU4LjEiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2svn!4v1700000000000"
        />
    );
}
