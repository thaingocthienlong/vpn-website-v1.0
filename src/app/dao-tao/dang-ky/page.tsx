"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    ClipboardText,
    User,
    BookOpen,
    Phone,
    EnvelopeSimple,
    Buildings,
} from "@phosphor-icons/react";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { PublicPageShell, PublicStatePanel } from "@/components/route-shell";

const courses = [
    {
        id: "1",
        title: "An toàn Lao động Nhóm 3",
        schedules: [
            { id: "s1", date: "15/02/2024", type: "Tại Viện" },
            { id: "s2", date: "01/03/2024", type: "Online" },
        ],
    },
    {
        id: "2",
        title: "ISO 9001:2015",
        schedules: [{ id: "s3", date: "20/02/2024", type: "Tại Viện" }],
    },
    {
        id: "3",
        title: "Kỹ năng Lãnh đạo",
        schedules: [
            { id: "s4", date: "25/02/2024", type: "Online" },
            { id: "s5", date: "10/03/2024", type: "Tại Viện" },
        ],
    },
];

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    courseId: string;
    scheduleId: string;
    notes: string;
    agreeTerms: boolean;
}

const initialFormData: FormData = {
    fullName: "",
    email: "",
    phone: "",
    company: "",
    courseId: "",
    scheduleId: "",
    notes: "",
    agreeTerms: false,
};

export default function RegistrationPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const selectedCourse = courses.find((course) => course.id === formData.courseId);

    const updateField = (field: keyof FormData, value: string | boolean) => {
        setFormData((previous) => ({ ...previous, [field]: value }));
        if (errors[field]) {
            setErrors((previous) => ({ ...previous, [field]: undefined }));
        }
    };

    const validateStep = (currentStep: number) => {
        const nextErrors: Partial<Record<keyof FormData, string>> = {};

        if (currentStep === 1) {
            if (!formData.fullName || formData.fullName.length < 2) {
                nextErrors.fullName = "Vui lòng nhập họ tên (tối thiểu 2 ký tự)";
            }
            if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                nextErrors.email = "Vui lòng nhập email hợp lệ";
            }
            if (!formData.phone || !/^(0|84|\+84)?[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ""))) {
                nextErrors.phone = "Vui lòng nhập số điện thoại hợp lệ";
            }
        }

        if (currentStep === 2) {
            if (!formData.courseId) {
                nextErrors.courseId = "Vui lòng chọn khóa học";
            }
            if (!formData.scheduleId) {
                nextErrors.scheduleId = "Vui lòng chọn lịch học";
            }
        }

        if (currentStep === 3 && !formData.agreeTerms) {
            nextErrors.agreeTerms = "Vui lòng đồng ý với điều khoản để tiếp tục";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleBack = () => {
        setStep((previous) => previous - 1);
        setErrors({});
    };

    const handleNext = async () => {
        if (!validateStep(step)) {
            return;
        }

        if (step < 3) {
            setStep((previous) => previous + 1);
            setErrors({});
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/registrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsSuccess(true);
            }
        } catch (error) {
            console.error("Error submitting registration:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { num: 1, label: "Thông tin cá nhân", icon: User },
        { num: 2, label: "Chọn khóa học", icon: BookOpen },
        { num: 3, label: "Xác nhận", icon: ClipboardText },
    ];

    const heroPanel = (
        <div className="space-y-3">
            {steps.map((item) => {
                const Icon = item.icon;
                const isActive = item.num === step;
                const isCompleted = item.num < step;

                return (
                    <div
                        key={item.num}
                        className={`rounded-[1.6rem] border p-4 ${
                            isActive
                                ? "border-[rgba(23,88,216,0.2)] bg-[rgba(255,255,255,0.78)]"
                                : "border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.62)]"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`inline-flex h-11 w-11 items-center justify-center rounded-[1rem] ${
                                    isCompleted || isActive
                                        ? "bg-[rgba(23,88,216,0.1)] text-[var(--accent-strong)]"
                                        : "bg-[rgba(26,72,164,0.06)] text-[var(--ink-soft)]"
                                }`}
                            >
                                {isCompleted ? <CheckCircle className="h-5 w-5" weight="fill" /> : <Icon className="h-5 w-5" weight="duotone" />}
                            </div>
                            <p className="text-sm leading-7 text-[var(--ink)]">{item.label}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    if (isSuccess) {
        return (
            <PublicPageShell
                title="Đăng ký khóa học"
                description="Hoàn thành 3 bước đơn giản để đăng ký tham gia khóa đào tạo"
                secondaryPanel={heroPanel}
                main={
                    <PublicStatePanel
                        icon={CheckCircle}
                        title="Đăng ký thành công!"
                        description="Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ."
                        action={
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button asChild variant="outline">
                                    <Link href="/dao-tao">Xem khóa học khác</Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/">Về trang chủ</Link>
                                </Button>
                            </div>
                        }
                    />
                }
                asideSticky={false}
            />
        );
    }

    const main = (
        <section className="public-panel rounded-[2.2rem] p-6 md:p-8">
            {step === 1 && (
                <div className="space-y-6">
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">Thông tin cá nhân</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Input
                                label="Họ và tên *"
                                value={formData.fullName}
                                onChange={(event) => updateField("fullName", event.target.value)}
                                placeholder="Nguyễn Văn A"
                                error={errors.fullName}
                                leftAddon={<User className="h-4 w-4" weight="bold" />}
                            />
                        </div>
                        <Input
                            label="Email *"
                            type="email"
                            value={formData.email}
                            onChange={(event) => updateField("email", event.target.value)}
                            placeholder="email@example.com"
                            error={errors.email}
                            leftAddon={<EnvelopeSimple className="h-4 w-4" weight="bold" />}
                        />
                        <Input
                            label="Số điện thoại *"
                            type="tel"
                            value={formData.phone}
                            onChange={(event) => updateField("phone", event.target.value)}
                            placeholder="0901 234 567"
                            error={errors.phone}
                            leftAddon={<Phone className="h-4 w-4" weight="bold" />}
                        />
                        <div className="sm:col-span-2">
                            <Input
                                label="Công ty/Tổ chức"
                                value={formData.company}
                                onChange={(event) => updateField("company", event.target.value)}
                                placeholder="Tên công ty (không bắt buộc)"
                                leftAddon={<Buildings className="h-4 w-4" weight="bold" />}
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">Chọn khóa học</h2>
                    <Select
                        label="Khóa học *"
                        value={formData.courseId}
                        onChange={(event) => {
                            updateField("courseId", event.target.value);
                            updateField("scheduleId", "");
                        }}
                        placeholder="-- Chọn khóa học --"
                        error={errors.courseId}
                        options={courses.map((course) => ({ value: course.id, label: course.title }))}
                    />

                    {selectedCourse && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-[var(--ink)]">Lịch học *</label>
                            <div className="space-y-3">
                                {selectedCourse.schedules.map((schedule) => (
                                    <label
                                        key={schedule.id}
                                        className={`flex items-center gap-3 rounded-[1.35rem] border p-4 transition-colors ${
                                            formData.scheduleId === schedule.id
                                                ? "border-[rgba(23,88,216,0.22)] bg-[rgba(23,88,216,0.08)]"
                                                : "border-[rgba(26,72,164,0.12)] bg-[rgba(255,255,255,0.68)]"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="scheduleId"
                                            value={schedule.id}
                                            checked={formData.scheduleId === schedule.id}
                                            onChange={(event) => updateField("scheduleId", event.target.value)}
                                            className="h-4 w-4"
                                        />
                                        <div>
                                            <div className="font-medium text-[var(--ink)]">{schedule.date}</div>
                                            <div className="text-sm leading-7 text-[var(--ink-soft)]">{schedule.type}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.scheduleId && <p className="text-sm text-[var(--error)]">{errors.scheduleId}</p>}
                        </div>
                    )}

                    <Textarea
                        label="Ghi chú"
                        value={formData.notes}
                        onChange={(event) => updateField("notes", event.target.value)}
                        placeholder="Yêu cầu đặc biệt, câu hỏi..."
                        rows={4}
                    />
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">Xác nhận thông tin</h2>
                    <div className="rounded-[1.8rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.68)] p-6">
                        <div className="grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <span className="text-[var(--ink-soft)]">Họ tên:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">{formData.fullName}</p>
                            </div>
                            <div>
                                <span className="text-[var(--ink-soft)]">Email:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">{formData.email}</p>
                            </div>
                            <div>
                                <span className="text-[var(--ink-soft)]">Số điện thoại:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">{formData.phone}</p>
                            </div>
                            {formData.company && (
                                <div>
                                    <span className="text-[var(--ink-soft)]">Công ty:</span>
                                    <p className="mt-1 font-medium text-[var(--ink)]">{formData.company}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-[var(--ink-soft)]">Khóa học:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">{selectedCourse?.title}</p>
                            </div>
                            <div>
                                <span className="text-[var(--ink-soft)]">Lịch học:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">
                                    {selectedCourse?.schedules.find((item) => item.id === formData.scheduleId)?.date} (
                                    {selectedCourse?.schedules.find((item) => item.id === formData.scheduleId)?.type})
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[1.8rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.62)] p-5">
                        <label className="flex items-start gap-3 text-sm leading-7 text-[var(--ink-soft)]">
                            <input
                                type="checkbox"
                                checked={formData.agreeTerms}
                                onChange={(event) => updateField("agreeTerms", event.target.checked)}
                                className="mt-1 h-4 w-4 rounded"
                            />
                            <span>
                                Tôi đồng ý với <a href="#" className="text-[var(--accent-strong)] hover:underline">điều khoản dịch vụ</a> và{" "}
                                <a href="#" className="text-[var(--accent-strong)] hover:underline">chính sách bảo mật</a> của Viện.
                            </span>
                        </label>
                        {errors.agreeTerms && <p className="mt-3 text-sm text-[var(--error)]">{errors.agreeTerms}</p>}
                    </div>
                </div>
            )}

            <div className="mt-8 flex justify-between border-t border-[rgba(26,72,164,0.1)] pt-6">
                {step > 1 ? (
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4" weight="bold" />
                        Quay lại
                    </Button>
                ) : (
                    <Button asChild variant="outline">
                        <Link href="/dao-tao">
                            <ArrowLeft className="h-4 w-4" weight="bold" />
                            Hủy
                        </Link>
                    </Button>
                )}

                <Button onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting ? (
                        "Đang xử lý..."
                    ) : step === 3 ? (
                        <>
                            Hoàn tất đăng ký
                            <CheckCircle className="h-4 w-4" weight="fill" />
                        </>
                    ) : (
                        <>
                            Tiếp tục
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </>
                    )}
                </Button>
            </div>
        </section>
    );

    return (
        <PublicPageShell
            title="Đăng ký khóa học"
            description="Hoàn thành 3 bước đơn giản để đăng ký tham gia khóa đào tạo"
            secondaryPanel={heroPanel}
            main={main}
            asideSticky={false}
        />
    );
}
