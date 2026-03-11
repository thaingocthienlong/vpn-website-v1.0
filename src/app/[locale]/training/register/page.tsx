"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, CheckCircle2, User, BookOpen, FileCheck, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

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

    const updateField = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateStep = (currentStep: number): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (currentStep === 1) {
            if (!formData.fullName || formData.fullName.length < 2) {
                newErrors.fullName = t("errors.fullName");
            }
            if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = t("errors.email");
            }
            if (!formData.phone || !/^[0-9]{9,11}$/.test(formData.phone.replace(/\s/g, ""))) {
                newErrors.phone = t("errors.phone");
            }
        }

        if (currentStep === 2) {
            if (!formData.courseType) {
                newErrors.courseType = t("errors.courseType");
            }
            if (!formData.courseName) {
                newErrors.courseName = t("errors.courseName");
            }
        }

        if (currentStep === 3) {
            if (!formData.agreeTerms) {
                newErrors.agreeTerms = t("errors.agreeTerms");
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validateStep(step)) return;

        if (step === 3) {
            setIsSubmitting(true);
            // Simulate submission
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubmitting(false);
            setIsSuccess(true);
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const steps = [
        { num: 1, label: t("steps.personal"), icon: User },
        { num: 2, label: t("steps.course"), icon: BookOpen },
        { num: 3, label: t("steps.confirm"), icon: FileCheck },
    ];

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-24 flex items-center justify-center">
                    <div className="max-w-lg mx-auto text-center px-4">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-heading font-bold text-slate-800 mb-4">
                            {t("success.title")}
                        </h1>
                        <p className="text-slate-600 mb-8">
                            {t("success.message")}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/en/training">
                                <Button variant="outline">
                                    {t("success.viewCourses")}
                                </Button>
                            </Link>
                            <Link href="/en">
                                <Button>
                                    {t("success.backHome")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="relative py-16">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="container mx-auto px-4 relative z-10 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white  flex items-center justify-center">
                            <GraduationCap className="w-8 h-8 text-slate-800" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-800 mb-4">
                            {t("title")} <span className="text-cyan-200">{t("titleHighlight")}</span>
                        </h1>
                        <p className="text-slate-800 max-w-2xl mx-auto">
                            {t("subtitle")}
                        </p>
                    </div>
                </section>

                {/* Form */}
                <section className="py-12 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto">
                            {/* Steps Indicator */}
                            <div className="flex items-center justify-center gap-4 mb-10">
                                {steps.map((s, idx) => {
                                    const StepIcon = s.icon;
                                    const isActive = s.num === step;
                                    const isCompleted = s.num < step;
                                    return (
                                        <div key={s.num} className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isActive
                                                    ? "bg-blue-600 text-white shadow-md"
                                                    : isCompleted
                                                        ? "bg-green-500 text-white"
                                                        : "bg-slate-200 text-slate-500"
                                                    }`}>
                                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                                                </div>
                                                <span className={`text-sm font-medium hidden sm:block ${isActive ? "text-blue-600" : "text-slate-500"}`}>
                                                    {s.label}
                                                </span>
                                            </div>
                                            {idx < steps.length - 1 && (
                                                <div className={`w-12 h-0.5 ${isCompleted ? "bg-green-500" : "bg-slate-200"}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Form Card */}
                            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                                {/* Step 1: Personal Info */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-heading font-bold text-slate-800 mb-6">
                                            {t("steps.personal")}
                                        </h2>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    {t("fields.fullName")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={(e) => updateField("fullName", e.target.value)}
                                                    placeholder={t("placeholders.fullName")}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? "border-red-300" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                                />
                                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => updateField("email", e.target.value)}
                                                    placeholder={t("placeholders.email")}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.email ? "border-red-300" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                                />
                                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    {t("fields.phone")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => updateField("phone", e.target.value)}
                                                    placeholder={t("placeholders.phone")}
                                                    className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? "border-red-300" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                                />
                                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    {t("fields.company")}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.company}
                                                    onChange={(e) => updateField("company", e.target.value)}
                                                    placeholder={t("placeholders.company")}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                                    {t("fields.position")}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.position}
                                                    onChange={(e) => updateField("position", e.target.value)}
                                                    placeholder={t("placeholders.position")}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Course Selection */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-heading font-bold text-slate-800 mb-6">
                                            {t("steps.course")}
                                        </h2>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                {t("fields.courseType")} <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={formData.courseType}
                                                onChange={(e) => updateField("courseType", e.target.value)}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.courseType ? "border-red-300" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                            >
                                                <option value="">{t("select.courseType")}</option>
                                                <option value="occupational-safety">Occupational Safety</option>
                                                <option value="quality-management">Quality Management</option>
                                                <option value="soft-skills">Soft Skills</option>
                                                <option value="digital-transformation">Digital Transformation</option>
                                            </select>
                                            {errors.courseType && <p className="text-red-500 text-xs mt-1">{errors.courseType}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                {t("fields.courseName")} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.courseName}
                                                onChange={(e) => updateField("courseName", e.target.value)}
                                                placeholder={t("placeholders.courseName")}
                                                className={`w-full px-4 py-3 rounded-xl border ${errors.courseName ? "border-red-300" : "border-slate-200"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
                                            />
                                            {errors.courseName && <p className="text-red-500 text-xs mt-1">{errors.courseName}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                {t("fields.studyFormat")}
                                            </label>
                                            <select
                                                value={formData.studyFormat}
                                                onChange={(e) => updateField("studyFormat", e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            >
                                                <option value="">{t("select.studyFormat")}</option>
                                                <option value="at-institute">At the Institute</option>
                                                <option value="in-house">In-house (at company)</option>
                                                <option value="online">Online</option>
                                                <option value="blended">Blended (Online + Offline)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                {t("fields.note")}
                                            </label>
                                            <textarea
                                                value={formData.note}
                                                onChange={(e) => updateField("note", e.target.value)}
                                                placeholder={t("placeholders.note")}
                                                rows={4}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Confirmation */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-heading font-bold text-slate-800 mb-6">
                                            {t("steps.confirm")}
                                        </h2>

                                        {/* Summary Card */}
                                        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-500">{t("fields.fullName")}:</span>
                                                    <p className="font-medium text-slate-800">{formData.fullName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">Email:</span>
                                                    <p className="font-medium text-slate-800">{formData.email}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">{t("fields.phone")}:</span>
                                                    <p className="font-medium text-slate-800">{formData.phone}</p>
                                                </div>
                                                {formData.company && (
                                                    <div>
                                                        <span className="text-slate-500">{t("fields.company")}:</span>
                                                        <p className="font-medium text-slate-800">{formData.company}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-slate-500">{t("fields.courseName")}:</span>
                                                    <p className="font-medium text-slate-800">{formData.courseName}</p>
                                                </div>
                                                {formData.studyFormat && (
                                                    <div>
                                                        <span className="text-slate-500">{t("fields.studyFormat")}:</span>
                                                        <p className="font-medium text-slate-800">{formData.studyFormat}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Terms */}
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={formData.agreeTerms}
                                                onChange={(e) => updateField("agreeTerms", e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded border-slate-300"
                                            />
                                            <span className="text-sm text-slate-600">
                                                {t("terms.agree")}{" "}
                                                <a href="#" className="text-blue-600 hover:underline">{t("terms.service")}</a>
                                                {" "}{t("terms.and")}{" "}
                                                <a href="#" className="text-blue-600 hover:underline">{t("terms.privacy")}</a>
                                                {" "}{t("terms.ofInstitute")}
                                            </span>
                                        </div>
                                        {errors.agreeTerms && <p className="text-red-500 text-xs">{errors.agreeTerms}</p>}
                                    </div>
                                )}

                                {/* Navigation */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
                                    <div>
                                        {step > 1 && (
                                            <Button variant="outline" onClick={handleBack}>
                                                <ArrowLeft className="w-4 h-4 mr-2" />
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
                                                <CheckCircle2 className="w-4 h-4 ml-2" />
                                            </>
                                        ) : (
                                            <>
                                                {t("nav.continue")}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
