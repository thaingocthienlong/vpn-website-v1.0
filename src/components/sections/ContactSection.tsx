"use client";

import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { Button, Input, Textarea } from "@/components/ui";
import { EnvelopeSimple, Clock, MapPin, PaperPlaneTilt, Phone } from "@phosphor-icons/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

interface ContactSectionProps {
    title?: string;
    subtitle?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
}

export function ContactSection({
    title,
    subtitle,
    address = "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM",
    phone = "0912 114 511",
    email = "vanphong@vienphuongnam.com.vn",
    hours,
}: ContactSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    const resolvedTitle = title || (isEn ? "Contact Vien Phuong Nam" : "Liên hệ Viện Phương Nam");
    const resolvedSubtitle = subtitle || (isEn
        ? "Share your information and our team will reach out with the right training or service direction."
        : "Để lại thông tin và đội ngũ của chúng tôi sẽ liên hệ để tư vấn đúng nhu cầu đào tạo hoặc dịch vụ.");
    const resolvedHours = hours || (isEn
        ? "Mon - Fri: 8:00 AM - 5:00 PM"
        : "Thứ 2 - Thứ 6: 08:00 - 17:00");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setIsSubmitting(false);
        setSubmitted(true);
    };

    const contactInfo = [
        { icon: MapPin, label: isEn ? "Address" : "Địa chỉ", value: address },
        { icon: Phone, label: isEn ? "Phone" : "Điện thoại", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
        { icon: EnvelopeSimple, label: "Email", value: email, href: `mailto:${email}` },
        { icon: Clock, label: isEn ? "Working Hours" : "Giờ làm việc", value: resolvedHours },
    ];

    return (
        <SectionWrapper background="gradient-blue">
            <MotionSection>
                <SectionHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
            </MotionSection>

            <MotionGroup className="grid grid-cols-1 gap-6 xl:grid-cols-[0.88fr_1.12fr]" stagger={0.1}>
                <MotionItem>
                    <div className="public-panel-muted public-frame relative rounded-[2.5rem] p-6 md:p-8">
                        <FloatingAccent className="right-[8%] top-[8%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.14),transparent_70%)]" variant="halo" />
                        <div className="relative mb-6 space-y-3">
                            <p className="editorial-caption text-[var(--ink-muted)]">
                                {isEn ? "Visit or write to us" : "Ghé thăm hoặc gửi thông tin"}
                            </p>
                            <p className="max-w-[32rem] text-sm leading-7 text-[var(--ink-soft)]">
                                {isEn
                                    ? "Choose the direct contact method that fits your need, or send a brief through the form and our team will connect the right person."
                                    : "Chọn kênh liên hệ phù hợp hoặc để lại thông tin trong biểu mẫu, đội ngũ của chúng tôi sẽ kết nối đúng bộ phận phụ trách."}
                            </p>
                        </div>
                        <MotionGroup className="relative grid gap-4 sm:grid-cols-2" stagger={0.08}>
                            {contactInfo.map((item, index) => (
                                <MotionItem key={index} className={index === 0 ? "sm:col-span-2" : undefined}>
                                    <motion.div
                                        whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.01 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        className={`rounded-[1.7rem] border border-[rgba(26,72,164,0.12)] p-4 ${
                                            index === 0
                                                ? "bg-[linear-gradient(150deg,rgba(255,255,255,0.92),rgba(228,237,250,0.84))] md:p-5"
                                                : "bg-white/78"
                                        }`}
                                    >
                                        <motion.div
                                            className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[rgba(23,88,216,0.14)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]"
                                            animate={shouldReduceMotion ? undefined : { y: [0, -3, 0] }}
                                            transition={shouldReduceMotion ? undefined : { duration: 4.6, ease: "easeInOut", repeat: Infinity, delay: index * 0.14 }}
                                        >
                                            <item.icon className="h-5 w-5" weight="bold" />
                                        </motion.div>
                                        <p className="mb-1 text-sm text-[var(--ink-muted)]">{item.label}</p>
                                        {item.href ? (
                                            <a href={item.href} className="font-medium text-[var(--ink)] transition-colors hover:text-[var(--accent-strong)]">
                                                {item.value}
                                            </a>
                                        ) : (
                                            <p className="font-medium text-[var(--ink)]">{item.value}</p>
                                        )}
                                    </motion.div>
                                </MotionItem>
                            ))}

                            <MotionItem className="sm:col-span-2">
                                <motion.div
                                    whileHover={shouldReduceMotion ? undefined : { y: -5, scale: 1.005 }}
                                    transition={publicMotionTokens.hoverSpring}
                                    className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[2rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(227,239,255,0.72))]"
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(23,88,216,0.12),transparent_32%),radial-gradient(circle_at_76%_68%,rgba(23,88,216,0.08),transparent_36%),linear-gradient(rgba(23,88,216,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(23,88,216,0.06)_1px,transparent_1px)] bg-[length:auto,auto,28px_28px,28px_28px]" />
                                    <motion.div
                                        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(23,88,216,0.14)] bg-white/84 text-[var(--accent-strong)] shadow-[var(--shadow-xs)]"
                                        animate={shouldReduceMotion ? undefined : { y: [0, -5, 0], scale: [1, 1.04, 1] }}
                                        transition={shouldReduceMotion ? undefined : { duration: 4.8, ease: "easeInOut", repeat: Infinity }}
                                    >
                                        <MapPin className="h-5 w-5" weight="fill" />
                                    </motion.div>
                                    <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-[var(--ink-muted)]">Google Maps</span>
                                </motion.div>
                            </MotionItem>
                        </MotionGroup>
                    </div>
                </MotionItem>

                <MotionItem>
                    <div className="public-panel public-frame rounded-[2.5rem] p-6 md:p-8">
                        <AnimatePresence mode="wait" initial={false}>
                            {submitted ? (
                                <motion.div
                                    key="submitted"
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                                    transition={publicMotionTokens.sectionSpring}
                                    className="py-10 text-center"
                                >
                                    <motion.div
                                        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[rgba(47,122,95,0.12)]"
                                        animate={shouldReduceMotion ? undefined : { y: [0, -4, 0], scale: [1, 1.03, 1] }}
                                        transition={shouldReduceMotion ? undefined : { duration: 4.2, ease: "easeInOut", repeat: Infinity }}
                                    >
                                        <PaperPlaneTilt className="h-8 w-8 text-green-600" weight="fill" />
                                    </motion.div>
                                    <h3 className="mb-2 font-heading text-xl font-semibold text-[var(--ink)]">
                                        {isEn ? "Thank you!" : "Cảm ơn bạn!"}
                                    </h3>
                                    <p className="text-[var(--ink-soft)]">
                                        {isEn
                                            ? "We've received your message and will get back to you soon."
                                            : "Chúng tôi đã nhận được tin nhắn và sẽ liên hệ lại sớm nhất."}
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                                    transition={publicMotionTokens.sectionSpring}
                                >
                                    <div className="space-y-3">
                                        <p className="editorial-caption text-[var(--ink-muted)]">
                                            {isEn ? "Message form" : "Biểu mẫu liên hệ"}
                                        </p>
                                        <p className="max-w-[36rem] text-sm leading-7 text-[var(--ink-soft)]">
                                            {isEn
                                                ? "Share your contact details and a short request summary. We will route the message to the right academic, service, or partnership lead."
                                                : "Để lại thông tin liên hệ và tóm tắt nhu cầu. Chúng tôi sẽ chuyển tiếp yêu cầu đến đúng bộ phận đào tạo, dịch vụ hoặc hợp tác."}
                                        </p>
                                    </div>
                                    <MotionGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2" stagger={0.06}>
                                        <MotionItem>
                                            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -3 }} transition={publicMotionTokens.hoverSpring}>
                                                <Input
                                                    label={isEn ? "Full Name" : "Họ và tên"}
                                                    placeholder={isEn ? "John Doe" : "Nguyễn Văn A"}
                                                    required
                                                />
                                            </motion.div>
                                        </MotionItem>
                                        <MotionItem>
                                            <motion.div whileHover={shouldReduceMotion ? undefined : { y: -3 }} transition={publicMotionTokens.hoverSpring}>
                                                <Input
                                                    label={isEn ? "Phone Number" : "Số điện thoại"}
                                                    type="tel"
                                                    placeholder="0901 234 567"
                                                    required
                                                />
                                            </motion.div>
                                        </MotionItem>
                                    </MotionGroup>
                                    <MotionItem>
                                        <motion.div whileHover={shouldReduceMotion ? undefined : { y: -3 }} transition={publicMotionTokens.hoverSpring}>
                                            <Input
                                                label="Email"
                                                type="email"
                                                placeholder="email@example.com"
                                                required
                                            />
                                        </motion.div>
                                    </MotionItem>
                                    <MotionItem>
                                        <motion.div whileHover={shouldReduceMotion ? undefined : { y: -3 }} transition={publicMotionTokens.hoverSpring}>
                                            <Input
                                                label={isEn ? "Subject" : "Chủ đề"}
                                                placeholder={isEn ? "Course consultation..." : "Tư vấn khóa học..."}
                                                required
                                            />
                                        </motion.div>
                                    </MotionItem>
                                    <MotionItem>
                                        <motion.div whileHover={shouldReduceMotion ? undefined : { y: -3 }} transition={publicMotionTokens.hoverSpring}>
                                            <Textarea
                                                label={isEn ? "Message" : "Nội dung"}
                                                placeholder={isEn ? "Your message..." : "Nội dung tin nhắn..."}
                                                rows={4}
                                                required
                                            />
                                        </motion.div>
                                    </MotionItem>
                                    <MotionItem>
                                        <Button type="submit" className="w-full" motion="magnetic" disabled={isSubmitting}>
                                            {isSubmitting
                                                ? (isEn ? "Sending..." : "Đang gửi...")
                                                : (isEn ? "Send Message" : "Gửi tin nhắn")}
                                        </Button>
                                    </MotionItem>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </MotionItem>
            </MotionGroup>
        </SectionWrapper>
    );
}

export default ContactSection;
