"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ContactPage() {
    const t = useTranslations("contact");

    const subjectOptions = [
        { value: "service-inquiry", label: t("subjects.service") },
        { value: "course-registration", label: t("subjects.course") },
        { value: "business-cooperation", label: t("subjects.cooperation") },
        { value: "other", label: t("subjects.other") },
    ];

    const contactInfo = [
        { icon: MapPin, title: t("info.address"), content: "123 Nguyen Van Linh, District 7, Ho Chi Minh City" },
        { icon: Phone, title: t("info.phone"), content: "1900 1234", href: "tel:19001234" },
        { icon: Mail, title: t("info.email"), content: "info@sisrd.org.vn", href: "mailto:info@sisrd.org.vn" },
        { icon: Clock, title: t("info.workingHours"), content: t("info.workingHoursValue") },
    ];

    interface FormData {
        fullName: string;
        email: string;
        phone: string;
        subject: string;
        message: string;
    }

    const [formData, setFormData] = useState<FormData>({
        fullName: "", email: "", phone: "", subject: "", message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setIsSuccess(true);
                setFormData({ fullName: "", email: "", phone: "", subject: "", message: "" });
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="py-16 relative">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-4">
                            {t("title")}
                        </h1>
                        <p className="text-slate-800 max-w-2xl mx-auto">
                            {t("description")}
                        </p>
                    </div>
                </section>

                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-3 gap-12">
                            {/* Contact Info */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-heading font-bold text-slate-800">
                                    {t("info.title")}
                                </h2>
                                {contactInfo.map((info, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-white shadow-sm hover:bg-white transition-colors border border-white/5">
                                        <info.icon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <div className="font-medium text-slate-800">{info.title}</div>
                                            {info.href ? (
                                                <a href={info.href} className="text-blue-400 hover:text-blue-700 hover:underline">{info.content}</a>
                                            ) : (
                                                <div className="text-slate-800">{info.content}</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Form */}
                            <div className="lg:col-span-2">
                                {isSuccess ? (
                                    <div className="text-center py-16 bg-white shadow-sm border-green-500/30 rounded-xl">
                                        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                                        <h3 className="text-xl font-semibold text-slate-800">
                                            {t("form.success")}
                                        </h3>
                                        <p className="text-slate-800 mt-2">
                                            {t("form.successDesc")}
                                        </p>
                                        <Button variant="outline" className="mt-6 border-slate-200 text-slate-800 hover:bg-white" onClick={() => setIsSuccess(false)}>
                                            {t("form.sendAnother")}
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6 glass-panel p-8 rounded-2xl border border-slate-200 relative overflow-hidden">
                                        {/* Subtle background glow for the form */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-200 mb-2">{t("form.name")} *</label>
                                                <input type="text" required value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    placeholder={t("form.namePlaceholder")} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-200 mb-2">{t("form.email")} *</label>
                                                <input type="email" required value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    placeholder={t("form.emailPlaceholder")} />
                                            </div>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-200 mb-2">{t("form.phone")}</label>
                                                <input type="tel" value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                    placeholder={t("form.phonePlaceholder")} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-200 mb-2">{t("form.subject")} *</label>
                                                <select required value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-800 focus:bg-[#153580] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none">
                                                    <option value="" className="text-slate-800">{t("form.subjectPlaceholder")}</option>
                                                    {subjectOptions.map((opt) => (
                                                        <option key={opt.value} value={opt.value} className="text-slate-800">{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-200 mb-2">{t("form.message")} *</label>
                                            <textarea required rows={5} value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 text-slate-800 placeholder:text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                                placeholder={t("form.messagePlaceholder")} />
                                        </div>
                                        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}
                                            className="!bg-blue-600 hover:!bg-blue-500 text-white w-full sm:w-auto shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                                            {isSubmitting ? t("form.submitting") : t("form.submit")}
                                            <Send className="ml-2 w-4 h-4" />
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
