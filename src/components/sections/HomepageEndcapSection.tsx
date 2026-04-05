"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ArrowRight,
    Clock,
    EnvelopeSimple,
    MapPin,
    PaperPlaneTilt,
    Phone,
    WarningCircle,
} from "@phosphor-icons/react";
import { Container } from "@/components/layout";
import { Button, Input, Textarea } from "@/components/ui";
import { detectLocaleFromPath } from "@/lib/routes";
import {
    MotionGroup,
    MotionItem,
    MotionSection,
    publicMotionTokens,
} from "@/components/motion/PublicMotion";
import {
    getAppearanceTargetProps,
    getAppearanceTextStyle,
} from "@/lib/appearance/runtime";

interface HomepageEndcapSectionProps {
    title?: string;
    subtitle?: string;
    primaryCTA?: {
        text: string;
        href: string;
    };
    secondaryCTA?: {
        text: string;
        href: string;
    };
    address?: string;
    phone?: string;
    email?: string;
    hours?: string;
}

type SubmissionPhase = "idle" | "submitting" | "success" | "error";

type FormValues = {
    name: string;
    phone: string;
    email: string;
    message: string;
};

const EMPTY_FORM: FormValues = {
    name: "",
    phone: "",
    email: "",
    message: "",
};

export function HomepageEndcapSection({
    title,
    subtitle,
    primaryCTA,
    secondaryCTA,
    address = "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP.HCM",
    phone = "0912 114 511",
    email = "vanphong@vienphuongnam.com.vn",
    hours,
}: HomepageEndcapSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();
    const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM);
    const [submissionPhase, setSubmissionPhase] = useState<SubmissionPhase>("idle");
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resolvedTitle = title || (isEn
        ? "Connect with Vien Phuong Nam"
        : "Kết nối cùng Viện Phương Nam");
    const resolvedSubtitle = subtitle || (isEn
        ? "Contact the institute about training, partnerships, or applied services through one concise consultation desk."
        : "Trao đổi với viện về chương trình đào tạo, hợp tác hoặc dịch vụ ứng dụng thông qua một đầu mối tư vấn ngắn gọn.");
    const resolvedPrimaryCTA = primaryCTA || (isEn
        ? { text: "Request consultation", href: "/en/contact" }
        : { text: "Yêu cầu tư vấn", href: "/lien-he" });
    const resolvedSecondaryCTA = secondaryCTA || (isEn
        ? { text: "Explore services", href: "/en/services" }
        : { text: "Khám phá dịch vụ", href: "/dich-vu" });
    const resolvedHours = hours || (isEn
        ? "Mon - Fri: 8:00 AM - 5:00 PM"
        : "Thứ 2 - Thứ 6: 08:00 - 17:00");
    const bubbleButtonClass = "rounded-[1.02rem] !border-white/28 !bg-[linear-gradient(180deg,rgba(252,254,255,0.22),rgba(241,247,251,0.12))] !text-white shadow-[0_14px_30px_-28px_rgba(8,20,33,0.42)] hover:!bg-[linear-gradient(180deg,rgba(252,254,255,0.3),rgba(241,247,251,0.18))] hover:!text-white";
    const darkBubbleButtonClass = "w-full rounded-[1.02rem] !border-[rgba(176,207,255,0.18)] !bg-[linear-gradient(180deg,rgba(19,44,71,0.92),rgba(16,34,54,0.82))] !text-white shadow-[0_18px_34px_-28px_rgba(8,20,33,0.5)] hover:!bg-[linear-gradient(180deg,rgba(24,52,82,0.96),rgba(17,38,60,0.88))] hover:!text-white";
    const bubbleFieldClass = "!border-white/30 !bg-[linear-gradient(180deg,rgba(252,254,255,0.26),rgba(241,247,251,0.16))] shadow-[0_12px_28px_-28px_rgba(8,20,33,0.38)] placeholder:text-[var(--ink-muted)] focus:!border-white/40 focus:!bg-[linear-gradient(180deg,rgba(252,254,255,0.34),rgba(241,247,251,0.22))] focus:!ring-[rgba(94,130,166,0.14)]";

    const contactCards = [
        {
            icon: Phone,
            label: isEn ? "Phone" : "Điện thoại",
            value: phone,
            href: `tel:${phone.replace(/\s/g, "")}`,
        },
        {
            icon: EnvelopeSimple,
            label: "Email",
            value: email,
            href: `mailto:${email}`,
        },
        {
            icon: MapPin,
            label: isEn ? "Address" : "Địa chỉ",
            value: address,
        },
        {
            icon: Clock,
            label: isEn ? "Hours" : "Giờ làm việc",
            value: resolvedHours,
        },
    ];

    useEffect(() => {
        return () => {
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
            }
        };
    }, []);

    const queueReset = (callback: () => void) => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = setTimeout(callback, 5000);
    };

    const setField = (field: keyof FormValues) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;
        setFormValues((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (submissionPhase === "submitting") {
            return;
        }

        setSubmissionPhase("submitting");

        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setSubmissionPhase("success");

            queueReset(() => {
                setFormValues(EMPTY_FORM);
                setSubmissionPhase("idle");
            });
        } catch {
            setSubmissionPhase("error");

            queueReset(() => {
                setSubmissionPhase("idle");
            });
        }
    };

    const statusPanelTone = submissionPhase === "error"
        ? {
              shell: "border-[rgba(138,79,93,0.22)] bg-[rgba(248,236,240,0.94)]",
              icon: "border-[rgba(138,79,93,0.24)] bg-[rgba(138,79,93,0.14)] text-[var(--error)]",
              eyebrow: "text-[var(--error)]",
              body: "text-[var(--ink-soft)]",
          }
        : submissionPhase === "success"
          ? {
                shell: "border-[rgba(47,97,80,0.22)] bg-[rgba(236,245,241,0.96)]",
                icon: "border-[rgba(47,97,80,0.24)] bg-[rgba(47,97,80,0.14)] text-[var(--success)]",
                eyebrow: "text-[var(--success)]",
                body: "text-[var(--ink-soft)]",
            }
          : {
                shell: "border-[rgba(94,130,166,0.18)] bg-[rgba(237,243,249,0.96)]",
                icon: "border-[rgba(94,130,166,0.24)] bg-[rgba(94,130,166,0.14)] text-[var(--info)]",
                eyebrow: "text-[var(--info)]",
                body: "text-[var(--ink-soft)]",
            };

    return (
        <section
            className="public-band relative overflow-hidden bg-[linear-gradient(180deg,#163049_0%,#0f2135_100%)] py-[4.5rem] text-[var(--on-dark-heading)] md:py-24"
            {...getAppearanceTargetProps("homepage.endcap.surface")}
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.08),transparent_20%),radial-gradient(circle_at_86%_74%,rgba(77,111,147,0.26),transparent_22%)]" />
            <Container className="relative">
                <MotionSection>
                    <MotionGroup className="grid gap-8 xl:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.9fr)] xl:items-start" stagger={0.1}>
                        <MotionItem>
                            <div className="border-t border-white/10 pt-6" {...getAppearanceTargetProps("homepage.endcap.header")}>
                                <div className="space-y-5">
                                    <div className="inline-flex items-center gap-3">
                                        <span className="h-px w-10 bg-white/14" />
                                        <span
                                            className="editorial-caption text-[var(--on-dark-body)]"
                                            style={getAppearanceTextStyle({
                                                colorRole: "badge",
                                                colorFallback: "var(--on-dark-body)",
                                            })}
                                        >
                                            {isEn ? "Consultation desk" : "Bàn tư vấn"}
                                        </span>
                                    </div>
                                    <h2
                                        className="max-w-[10.5ch] font-heading text-[2.65rem] !text-[var(--on-dark-heading)] md:text-[3.5rem]"
                                        style={getAppearanceTextStyle({
                                            colorRole: "title",
                                            colorFallback: "var(--on-dark-heading)",
                                            sizeRole: "title",
                                            sizeFallback: "clamp(2.65rem,6vw,3.5rem)",
                                        })}
                                    >
                                        {resolvedTitle}
                                    </h2>
                                    <p
                                        className="max-w-[38rem] text-sm leading-[1.9rem] text-[color:rgba(244,248,252,0.86)] md:text-base"
                                        style={getAppearanceTextStyle({
                                            colorRole: "body",
                                            colorFallback: "rgba(244,248,252,0.86)",
                                            sizeRole: "body",
                                            sizeFallback: "1rem",
                                        })}
                                    >
                                        {resolvedSubtitle}
                                    </p>
                                </div>

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="lg"
                                        motion="magnetic"
                                        className={bubbleButtonClass}
                                    >
                                        <Link href={resolvedPrimaryCTA.href} className="inline-flex items-center gap-3">
                                            <span>{resolvedPrimaryCTA.text}</span>
                                            <ArrowRight className="h-4 w-4" weight="bold" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" motion="lift" className="rounded-[1.02rem] border-white/14 bg-transparent text-[var(--on-dark-heading)] hover:bg-white/8 hover:text-white">
                                        <Link href={resolvedSecondaryCTA.href} className="inline-flex items-center gap-3">
                                            <span>{resolvedSecondaryCTA.text}</span>
                                            <ArrowRight className="h-4 w-4" weight="bold" />
                                        </Link>
                                    </Button>
                                </div>

                                <MotionGroup className="mt-8 grid gap-x-5 gap-y-5 md:grid-cols-2" stagger={0.06}>
                                    {contactCards.map((item) => (
                                        <MotionItem key={item.label}>
                                            <motion.div
                                                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                                                transition={publicMotionTokens.hoverSpring}
                                                className="border-t border-white/10 pt-4"
                                            >
                                                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/14 bg-white/10 text-[color:rgba(244,248,252,0.9)]">
                                                    <item.icon className="h-4.5 w-4.5" weight="bold" />
                                                </div>
                                                <p className="mb-1 text-sm text-[var(--on-dark-body)]">{item.label}</p>
                                                {item.href ? (
                                                    <a href={item.href} className="font-medium text-[var(--on-dark-heading)] transition-colors hover:text-white">
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="font-medium text-[var(--on-dark-heading)]">{item.value}</p>
                                                )}
                                            </motion.div>
                                        </MotionItem>
                                    ))}
                                </MotionGroup>
                            </div>
                        </MotionItem>

                        <MotionItem>
                            <div className="border-t border-white/10 pt-6">
                                <AnimatePresence mode="wait" initial={false}>
                                    {submissionPhase === "idle" ? (
                                        <motion.form
                                            key="form"
                                            onSubmit={handleSubmit}
                                            className="content-area space-y-5 rounded-[1.35rem] border border-[rgba(77,111,147,0.14)] bg-[rgba(252,254,255,0.94)] p-5 text-[var(--ink)] shadow-[0_24px_60px_-44px_rgba(4,10,18,0.52)] md:p-6"
                                            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                                            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                                            transition={publicMotionTokens.sectionSpring}
                                        >
                                            <div className="space-y-3">
                                                <p className="editorial-caption text-[var(--ink-muted)]">
                                                    {isEn ? "Compact brief" : "Gửi nhu cầu nhanh"}
                                                </p>
                                                <p className="text-sm leading-7 text-[var(--ink-soft)]">
                                                    {isEn
                                                        ? "Leave a short brief and the institute will route it to the right programme, service, or partnership lead."
                                                        : "Để lại mô tả ngắn và viện sẽ chuyển yêu cầu đến đúng đầu mối chương trình, dịch vụ hoặc hợp tác."}
                                                </p>
                                            </div>

                                            <MotionGroup className="grid gap-4 sm:grid-cols-2" stagger={0.06}>
                                                <MotionItem>
                                                    <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={publicMotionTokens.hoverSpring}>
                                                        <Input
                                                            label={isEn ? "Full Name" : "Họ và tên"}
                                                            labelClassName="text-[var(--ink)]"
                                                            helperTextClassName="text-[var(--ink-muted)]"
                                                            className={bubbleFieldClass}
                                                            placeholder={isEn ? "John Doe" : "Nguyễn Văn A"}
                                                            value={formValues.name}
                                                            onChange={setField("name")}
                                                            required
                                                        />
                                                    </motion.div>
                                                </MotionItem>
                                                <MotionItem>
                                                    <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={publicMotionTokens.hoverSpring}>
                                                        <Input
                                                            label={isEn ? "Phone Number" : "Số điện thoại"}
                                                            labelClassName="text-[var(--ink)]"
                                                            helperTextClassName="text-[var(--ink-muted)]"
                                                            className={bubbleFieldClass}
                                                            type="tel"
                                                            placeholder="0901 234 567"
                                                            value={formValues.phone}
                                                            onChange={setField("phone")}
                                                            required
                                                        />
                                                    </motion.div>
                                                </MotionItem>
                                            </MotionGroup>

                                            <MotionItem>
                                                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={publicMotionTokens.hoverSpring}>
                                                    <Input
                                                        label="Email"
                                                        labelClassName="text-[var(--ink)]"
                                                        helperTextClassName="text-[var(--ink-muted)]"
                                                        className={bubbleFieldClass}
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        value={formValues.email}
                                                        onChange={setField("email")}
                                                        required
                                                    />
                                                </motion.div>
                                            </MotionItem>

                                            <MotionItem>
                                                <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={publicMotionTokens.hoverSpring}>
                                                    <Textarea
                                                        label={isEn ? "Message" : "Nội dung"}
                                                        labelClassName="text-[var(--ink)]"
                                                        helperTextClassName="text-[var(--ink-muted)]"
                                                        className={bubbleFieldClass}
                                                        placeholder={isEn ? "Tell us what you need support with..." : "Cho chúng tôi biết nhu cầu bạn cần hỗ trợ..."}
                                                        rows={5}
                                                        value={formValues.message}
                                                        onChange={setField("message")}
                                                        required
                                                    />
                                                </motion.div>
                                            </MotionItem>

                                            <MotionItem>
                                                <Button
                                                    type="submit"
                                                    variant="outline"
                                                    motion="magnetic"
                                                    className={darkBubbleButtonClass}
                                                >
                                                    {isEn ? "Send request" : "Gửi yêu cầu"}
                                                </Button>
                                            </MotionItem>
                                        </motion.form>
                                    ) : (
                                        <motion.div
                                            key={submissionPhase}
                                            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                                            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                                            transition={publicMotionTokens.sectionSpring}
                                            className={`flex min-h-[430px] flex-col justify-center rounded-[1.35rem] border p-6 text-left md:p-7 ${statusPanelTone.shell}`}
                                        >
                                            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[1rem] border ${statusPanelTone.icon}`}>
                                                {submissionPhase === "error" ? (
                                                    <WarningCircle className="h-7 w-7" weight="fill" />
                                                ) : (
                                                    <PaperPlaneTilt className="h-7 w-7" weight="fill" />
                                                )}
                                            </div>
                                            <p className={`editorial-caption ${statusPanelTone.eyebrow}`}>
                                                {submissionPhase === "submitting"
                                                    ? (isEn ? "Sending" : "Đang gửi")
                                                    : submissionPhase === "success"
                                                      ? (isEn ? "Message received" : "Đã nhận thông tin")
                                                      : (isEn ? "Delivery issue" : "Gửi chưa thành công")}
                                            </p>
                                            <h3 className="mt-3 font-heading text-[2rem] !text-[var(--ink)]">
                                                {submissionPhase === "submitting"
                                                    ? (isEn ? "Preparing the consultation handoff." : "Đang chuẩn bị chuyển yêu cầu tư vấn.")
                                                    : submissionPhase === "success"
                                                      ? (isEn ? "Your brief is now in the queue." : "Yêu cầu của bạn đã vào hàng chờ xử lý.")
                                                      : (isEn ? "Please try again in a moment." : "Vui lòng thử lại sau ít phút.")}
                                            </h3>
                                            <p className={`mt-3 max-w-[30rem] text-sm leading-7 ${statusPanelTone.body}`}>
                                                {submissionPhase === "submitting"
                                                    ? (isEn
                                                        ? "We are packaging the enquiry so it reaches the right programme, service, or partnership contact."
                                                        : "Chúng tôi đang chuẩn bị yêu cầu để chuyển đến đúng đầu mối chương trình, dịch vụ hoặc hợp tác.")
                                                    : submissionPhase === "success"
                                                      ? (isEn
                                                          ? "Our team will review the brief and reply through the most suitable channel. This panel will reset automatically."
                                                          : "Đội ngũ của chúng tôi sẽ rà soát yêu cầu và phản hồi qua kênh phù hợp nhất. Bảng này sẽ tự đặt lại sau ít giây.")
                                                      : (isEn
                                                          ? "The form will return with your previous details preserved so you can retry without retyping."
                                                          : "Biểu mẫu sẽ quay lại với đầy đủ thông tin trước đó để bạn có thể gửi lại mà không cần nhập lại.")}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </MotionItem>
                    </MotionGroup>
                </MotionSection>
            </Container>
        </section>
    );
}

export default HomepageEndcapSection;
