"use client";

import { SectionWrapper, type SectionWrapperProps } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { Button, Input, Textarea } from "@/components/ui";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

interface ContactSectionProps {
    title?: string;
    background?: SectionWrapperProps["background"];
    textColor?: SectionWrapperProps["textColor"];
    backdropBlur?: SectionWrapperProps["backdropBlur"];
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
}

export function ContactSection({
    title,
    background,
    textColor,
    backdropBlur,
    address = "123 Đường ABC, Quận 1, TP.HCM",
    phone = "028 1234 5678",
    email = "info@sisrd.edu.vn",
    hours,
}: ContactSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const resolvedTitle = title || (isEn ? "Contact Us" : "Liên Hệ Với Chúng Tôi");
    const resolvedHours = hours || (isEn
        ? "Mon - Fri: 8:00 AM - 5:00 PM"
        : "Thứ 2 - Thứ 6: 8:00 - 17:00");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        setSubmitted(true);
    };

    const contactInfo = [
        { icon: MapPin, label: isEn ? "Address" : "Địa chỉ", value: address },
        { icon: Phone, label: isEn ? "Phone" : "Điện thoại", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
        { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
        { icon: Clock, label: isEn ? "Working Hours" : "Giờ làm việc", value: resolvedHours },
    ];

    return (
        <SectionWrapper background={background || "transparent"} textColor={textColor} backdropBlur={backdropBlur}>
            <ScrollReveal>
                <SectionHeader
                    title={resolvedTitle}
                    centered
                />
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact form */}
                <ScrollReveal delay={1}>
                    <div className="clay-card p-8">
                        {submitted ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Send className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="font-heading text-xl font-semibold mb-2">
                                    {isEn ? "Thank you!" : "Cảm ơn bạn!"}
                                </h3>
                                <p className="opacity-80">
                                    {isEn
                                        ? "We've received your message and will get back to you soon."
                                        : "Chúng tôi đã nhận được tin nhắn và sẽ liên hệ lại sớm nhất."}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label={isEn ? "Full Name" : "Họ và tên"}
                                        placeholder={isEn ? "John Doe" : "Nguyễn Văn A"}
                                        required
                                    />
                                    <Input
                                        label={isEn ? "Phone Number" : "Số điện thoại"}
                                        type="tel"
                                        placeholder="0901 234 567"
                                        required
                                    />
                                </div>
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="email@example.com"
                                    required
                                />
                                <Input
                                    label={isEn ? "Subject" : "Chủ đề"}
                                    placeholder={isEn ? "Course consultation..." : "Tư vấn khóa học..."}
                                    required
                                />
                                <Textarea
                                    label={isEn ? "Message" : "Nội dung"}
                                    placeholder={isEn ? "Your message..." : "Nội dung tin nhắn..."}
                                    rows={4}
                                    required
                                />
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting
                                        ? (isEn ? "Sending..." : "Đang gửi...")
                                        : (isEn ? "Send Message" : "Gửi tin nhắn")}
                                </Button>
                            </form>
                        )}
                    </div>
                </ScrollReveal>

                {/* Contact info */}
                <ScrollReveal delay={2}>
                    <div className="space-y-6">
                        {contactInfo.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white0 border border-slate-200">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <item.icon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm opacity-70 mb-1">{item.label}</p>
                                    {item.href ? (
                                        <a href={item.href} className="font-medium hover:text-primary transition-colors">
                                            {item.value}
                                        </a>
                                    ) : (
                                        <p className="font-medium">{item.value}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Map placeholder */}
                        <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <span className="opacity-70">Google Maps</span>
                        </div>
                    </div>
                </ScrollReveal>
            </div>
        </SectionWrapper>
    );
}

export default ContactSection;
