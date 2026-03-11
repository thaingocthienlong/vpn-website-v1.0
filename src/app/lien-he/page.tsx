"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";

// Subject options per FEATURES_SPEC CT-01
const subjectOptions = [
    { value: "tu-van-dich-vu", label: "Tư vấn dịch vụ" },
    { value: "dang-ky-khoa-hoc", label: "Đăng ký khóa học" },
    { value: "hop-tac-kinh-doanh", label: "Hợp tác kinh doanh" },
    { value: "khac", label: "Khác" },
];

// Contact info
const contactInfo = [
    {
        icon: MapPin,
        title: "Địa chỉ",
        content: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
    },
    {
        icon: Phone,
        title: "Điện thoại",
        content: "1900 1234",
        href: "tel:19001234",
    },
    {
        icon: Mail,
        title: "Email",
        content: "info@sisrd.org.vn",
        href: "mailto:info@sisrd.org.vn",
    },
    {
        icon: Clock,
        title: "Giờ làm việc",
        content: "Thứ 2 - Thứ 6: 8:00 - 17:30",
    },
];

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        // fullName: min 2 chars
        if (!formData.fullName || formData.fullName.length < 2) {
            newErrors.fullName = "Vui lòng nhập họ tên (tối thiểu 2 ký tự)";
        }

        // email: valid format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email || !emailRegex.test(formData.email)) {
            newErrors.email = "Vui lòng nhập email hợp lệ";
        }

        // phone: optional, VN format if provided
        if (formData.phone) {
            const phoneRegex = /^(0|84|\+84)?[0-9]{9,10}$/;
            if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
                newErrors.phone = "Số điện thoại không hợp lệ";
            }
        }

        // subject: required
        if (!formData.subject) {
            newErrors.subject = "Vui lòng chọn chủ đề";
        }

        // message: min 10 chars
        if (!formData.message || formData.message.length < 10) {
            newErrors.message = "Vui lòng nhập nội dung (tối thiểu 10 ký tự)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsSuccess(true);
                setFormData({
                    fullName: "",
                    email: "",
                    phone: "",
                    subject: "",
                    message: "",
                });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="relative py-20 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-500/30">
                                Liên hệ
                            </span>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-6">
                                Kết nối{" "}
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    với chúng tôi
                                </span>
                            </h1>
                            <p className="text-lg text-slate-800 leading-relaxed">
                                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi
                                qua thông tin bên dưới hoặc gửi tin nhắn trực tiếp.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Info + Form */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {/* Contact Info */}
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-slate-800 mb-6">
                                    Thông tin liên hệ
                                </h2>
                                <div className="space-y-6">
                                    {contactInfo.map((info, index) => {
                                        const Icon = info.icon;
                                        const content = info.href ? (
                                            <a
                                                href={info.href}
                                                className="text-slate-800 hover:text-blue-400 transition-colors cursor-pointer"
                                            >
                                                {info.content}
                                            </a>
                                        ) : (
                                            <span className="text-slate-600">{info.content}</span>
                                        );

                                        return (
                                            <div key={index} className="flex items-start gap-4 bg-white shadow-sm rounded-xl p-4 border border-slate-200">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                                    <Icon className="w-6 h-6 text-slate-800" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800 mb-1">
                                                        {info.title}
                                                    </div>
                                                    {content}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 aspect-video rounded-2xl overflow-hidden border border-slate-200">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.024!2d106.7!3d10.7328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQzJzU4LjEiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2svn!4v1700000000000"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Bản đồ Viện Phương Nam"
                                    />
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div>
                                <h2 className="text-2xl font-heading font-bold text-slate-800 mb-6">
                                    Gửi tin nhắn
                                </h2>

                                {isSuccess ? (
                                    <div className="bg-white shadow-sm rounded-2xl p-8 text-center border border-green-500/30">
                                        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-green-300 mb-2">
                                            Gửi thành công!
                                        </h3>
                                        <p className="text-green-400/80 mb-4">
                                            Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsSuccess(false)}
                                        >
                                            Gửi tin nhắn khác
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-2xl p-8 border border-slate-200">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-800 mb-2">
                                                Họ và tên <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 ${errors.fullName
                                                    ? "border-red-300 focus:ring-red-500"
                                                    : "border-slate-300 focus:ring-blue-500"
                                                    } focus:ring-2 focus:border-transparent outline-none transition-all`}
                                                placeholder="Nguyễn Văn A"
                                            />
                                            {errors.fullName && (
                                                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-800 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 ${errors.email
                                                    ? "border-red-300 focus:ring-red-500"
                                                    : "border-slate-300 focus:ring-blue-500"
                                                    } focus:ring-2 focus:border-transparent outline-none transition-all`}
                                                placeholder="email@example.com"
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                            )}
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-800 mb-2">
                                                Số điện thoại
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 ${errors.phone
                                                    ? "border-red-300 focus:ring-red-500"
                                                    : "border-slate-300 focus:ring-blue-500"
                                                    } focus:ring-2 focus:border-transparent outline-none transition-all`}
                                                placeholder="0901 234 567"
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                            )}
                                        </div>

                                        {/* Subject */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-800 mb-2">
                                                Chủ đề <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 ${errors.subject
                                                    ? "border-red-400/50 focus:ring-red-500"
                                                    : "border-slate-200 focus:ring-blue-500"
                                                    } focus:ring-2 focus:border-transparent outline-none transition-all`}
                                            >
                                                <option value="" className="bg-slate-900">-- Chọn chủ đề --</option>
                                                {subjectOptions.map((option) => (
                                                    <option key={option.value} value={option.value} className="bg-slate-900">
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.subject && (
                                                <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                                            )}
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-800 mb-2">
                                                Nội dung <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={5}
                                                className={`w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder:text-slate-400 ${errors.message
                                                    ? "border-red-300 focus:ring-red-500"
                                                    : "border-slate-300 focus:ring-blue-500"
                                                    } focus:ring-2 focus:border-transparent outline-none transition-all resize-none`}
                                                placeholder="Nội dung tin nhắn..."
                                            />
                                            {errors.message && (
                                                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                                            )}
                                        </div>

                                        {/* Submit */}
                                        <Button
                                            type="submit"
                                            size="lg"
                                            fullWidth
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                "Đang gửi..."
                                            ) : (
                                                <>
                                                    Gửi tin nhắn
                                                    <Send className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
