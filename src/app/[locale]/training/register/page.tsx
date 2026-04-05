"use client";

import Link from "next/link";
import { useState } from "react";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CheckCircle,
    FileText,
    GraduationCap,
    User,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { PublicPageShell, PublicStatePanel } from "@/components/route-shell";
import { Button, Input, Select, Textarea } from "@/components/ui";

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    position: string;
    courseType: string;
    courseName: string;
    studyFormat: string;
    note: string;
    agreeTerms: boolean;
}

export default function RegistrationPage() {
    const t = useTranslations("registration");
    const locale = useLocale();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        position: "",
        courseType: "",
        courseName: "",
        studyFormat: "",
        note: "",
        agreeTerms: false,
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const heroTitle = `${t("title")} ${t("titleHighlight")}`.trim();
    const homeHref = `/${locale}`;
    const trainingHref = `/${locale}/training`;

    const updateField = (field: keyof FormData, value: string | boolean) => {
        setFormData((previous) => ({ ...previous, [field]: value }));
        if (errors[field]) {
            setErrors((previous) => ({ ...previous, [field]: undefined }));
        }
    };

    const validateStep = (currentStep: number): boolean => {
        const nextErrors: Partial<Record<keyof FormData, string>> = {};

        if (currentStep === 1) {
            if (!formData.fullName || formData.fullName.length < 2) {
                nextErrors.fullName = t("errors.fullName");
            }
            if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                nextErrors.email = t("errors.email");
            }
            if (!formData.phone || !/^[0-9]{9,11}$/.test(formData.phone.replace(/\s/g, ""))) {
                nextErrors.phone = t("errors.phone");
            }
        }

        if (currentStep === 2) {
            if (!formData.courseType) {
                nextErrors.courseType = t("errors.courseType");
            }
            if (!formData.courseName) {
                nextErrors.courseName = t("errors.courseName");
            }
        }

        if (currentStep === 3 && !formData.agreeTerms) {
            nextErrors.agreeTerms = t("errors.agreeTerms");
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateStep(step)) {
            return;
        }

        if (step === 3) {
            setIsSubmitting(true);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setIsSubmitting(false);
            setIsSuccess(true);
            return;
        }

        setStep((previous) => previous + 1);
    };

    const handleBack = () => setStep((previous) => previous - 1);

    const steps = [
        { num: 1, label: t("steps.personal"), icon: User },
        { num: 2, label: t("steps.course"), icon: BookOpen },
        { num: 3, label: t("steps.confirm"), icon: FileText },
    ];

    const secondaryPanel = (
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
                                ? "border-[rgba(23,88,216,0.22)] bg-[rgba(255,255,255,0.8)]"
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
                                {isCompleted ? (
                                    <CheckCircle className="h-5 w-5" weight="fill" />
                                ) : (
                                    <Icon className="h-5 w-5" weight="duotone" />
                                )}
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
                badge={t("title")}
                title={heroTitle}
                description={t("subtitle")}
                secondaryPanel={secondaryPanel}
                main={
                    <PublicStatePanel
                        icon={CheckCircle}
                        title={t("success.title")}
                        description={t("success.message")}
                        action={
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button asChild variant="outline">
                                    <Link href={trainingHref}>{t("success.viewCourses")}</Link>
                                </Button>
                                <Button asChild>
                                    <Link href={homeHref}>{t("success.backHome")}</Link>
                                </Button>
                            </div>
                        }
                    />
                }
                asideSticky={false}
                heroAppearanceTargetId="page.hero.course-registration"
            />
        );
    }

    const main = (
        <section className="public-panel rounded-[2.25rem] p-6 md:p-8">
            {step === 1 && (
                <div className="space-y-6">
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                        {t("steps.personal")}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Input
                                label={`${t("fields.fullName")} *`}
                                value={formData.fullName}
                                onChange={(event) => updateField("fullName", event.target.value)}
                                placeholder={t("placeholders.fullName")}
                                error={errors.fullName}
                                leftAddon={<User className="h-4 w-4" weight="bold" />}
                            />
                        </div>
                        <Input
                            label="Email *"
                            type="email"
                            value={formData.email}
                            onChange={(event) => updateField("email", event.target.value)}
                            placeholder={t("placeholders.email")}
                            error={errors.email}
                        />
                        <Input
                            label={`${t("fields.phone")} *`}
                            type="tel"
                            value={formData.phone}
                            onChange={(event) => updateField("phone", event.target.value)}
                            placeholder={t("placeholders.phone")}
                            error={errors.phone}
                        />
                        <Input
                            label={t("fields.company")}
                            value={formData.company}
                            onChange={(event) => updateField("company", event.target.value)}
                            placeholder={t("placeholders.company")}
                        />
                        <Input
                            label={t("fields.position")}
                            value={formData.position}
                            onChange={(event) => updateField("position", event.target.value)}
                            placeholder={t("placeholders.position")}
                        />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                        {t("steps.course")}
                    </h2>
                    <Select
                        label={`${t("fields.courseType")} *`}
                        value={formData.courseType}
                        onChange={(event) => updateField("courseType", event.target.value)}
                        placeholder={t("select.courseType")}
                        error={errors.courseType}
                        options={[
                            { value: "occupational-safety", label: "Occupational Safety" },
                            { value: "quality-management", label: "Quality Management" },
                            { value: "soft-skills", label: "Soft Skills" },
                            { value: "digital-transformation", label: "Digital Transformation" },
                        ]}
                    />
                    <Input
                        label={`${t("fields.courseName")} *`}
                        value={formData.courseName}
                        onChange={(event) => updateField("courseName", event.target.value)}
                        placeholder={t("placeholders.courseName")}
                        error={errors.courseName}
                        leftAddon={<GraduationCap className="h-4 w-4" weight="bold" />}
                    />
                    <Select
                        label={t("fields.studyFormat")}
                        value={formData.studyFormat}
                        onChange={(event) => updateField("studyFormat", event.target.value)}
                        placeholder={t("select.studyFormat")}
                        options={[
                            { value: "at-institute", label: "At the Institute" },
                            { value: "in-house", label: "In-house (at company)" },
                            { value: "online", label: "Online" },
                            { value: "blended", label: "Blended (Online + Offline)" },
                        ]}
                    />
                    <Textarea
                        label={t("fields.note")}
                        value={formData.note}
                        onChange={(event) => updateField("note", event.target.value)}
                        placeholder={t("placeholders.note")}
                        rows={4}
                    />
                </div>
            )}

            {step === 3 && (
                <div className="space-y-6">
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                        {t("steps.confirm")}
                    </h2>

                    <div className="rounded-[1.8rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.68)] p-6">
                        <div className="grid gap-4 text-sm sm:grid-cols-2">
                            <div>
                                <span className="text-[var(--ink-soft)]">{t("fields.fullName")}:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">{formData.fullName}</p>
                            </div>
                            <div>
                                <span className="text-[var(--ink-soft)]">Email:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">{formData.email}</p>
                            </div>
                            <div>
                                <span className="text-[var(--ink-soft)]">{t("fields.phone")}:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">{formData.phone}</p>
                            </div>
                            {formData.company && (
                                <div>
                                    <span className="text-[var(--ink-soft)]">{t("fields.company")}:</span>
                                    <p className="mt-1 font-medium text-[var(--ink)]">{formData.company}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-[var(--ink-soft)]">{t("fields.courseName")}:</span>
                                <p className="mt-1 font-medium text-[var(--ink)]">{formData.courseName}</p>
                            </div>
                            {formData.studyFormat && (
                                <div>
                                    <span className="text-[var(--ink-soft)]">{t("fields.studyFormat")}:</span>
                                    <p className="mt-1 font-medium text-[var(--ink)]">{formData.studyFormat}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[1.8rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.62)] p-5">
                        <label className="flex items-start gap-3 text-sm leading-7 text-[var(--ink-soft)]">
                            <input
                                type="checkbox"
                                checked={formData.agreeTerms}
                                onChange={(event) => updateField("agreeTerms", event.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-[rgba(26,72,164,0.24)]"
                            />
                            <span>
                                {t("terms.agree")}{" "}
                                <a href="#" className="text-[var(--accent-strong)] hover:underline">
                                    {t("terms.service")}
                                </a>{" "}
                                {t("terms.and")}{" "}
                                <a href="#" className="text-[var(--accent-strong)] hover:underline">
                                    {t("terms.privacy")}
                                </a>{" "}
                                {t("terms.ofInstitute")}
                            </span>
                        </label>
                        {errors.agreeTerms && (
                            <p className="mt-3 text-xs text-[var(--error)]">{errors.agreeTerms}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-8 flex justify-between border-t border-[rgba(26,72,164,0.1)] pt-6">
                <div>
                    {step > 1 && (
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" weight="bold" />
                            {t("nav.back")}
                        </Button>
                    )}
                </div>

                <Button onClick={handleNext} disabled={isSubmitting}>
                    {isSubmitting ? (
                        t("nav.processing")
                    ) : step === 3 ? (
                        <>
                            {t("nav.submit")}
                            <CheckCircle className="h-4 w-4" weight="fill" />
                        </>
                    ) : (
                        <>
                            {t("nav.continue")}
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </>
                    )}
                </Button>
            </div>
        </section>
    );

    return (
        <PublicPageShell
            badge={t("title")}
            title={heroTitle}
            description={t("subtitle")}
            secondaryPanel={secondaryPanel}
            main={main}
            asideSticky={false}
            heroAppearanceTargetId="page.hero.course-registration"
        />
    );
}
