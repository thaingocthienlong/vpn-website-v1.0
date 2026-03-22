"use client";

import { useTranslations } from "next-intl";
import ContactPageClient from "@/components/contact/ContactPageClient";

export default function ContactPage() {
    const t = useTranslations("contact");

    return (
        <ContactPageClient
            texts={{
                badge: t("title"),
                title: t("title"),
                description: t("description"),
                infoTitle: t("info.title"),
                formTitle: t("form.submit"),
                successTitle: t("form.success"),
                successDescription: t("form.successDesc"),
                sendAnotherLabel: t("form.sendAnother"),
                submitLabel: t("form.submit"),
                submittingLabel: t("form.submitting"),
                fields: {
                    fullNameLabel: `${t("form.name")} *`,
                    fullNamePlaceholder: t("form.namePlaceholder"),
                    emailLabel: `${t("form.email")} *`,
                    emailPlaceholder: t("form.emailPlaceholder"),
                    phoneLabel: t("form.phone"),
                    phonePlaceholder: t("form.phonePlaceholder"),
                    subjectLabel: `${t("form.subject")} *`,
                    subjectPlaceholder: t("form.subjectPlaceholder"),
                    messageLabel: `${t("form.message")} *`,
                    messagePlaceholder: t("form.messagePlaceholder"),
                },
                errors: {
                    fullName: "Please enter your full name (minimum 2 characters)",
                    email: "Please enter a valid email address",
                    phone: "Please enter a valid phone number",
                    subject: "Please select a subject",
                    message: "Please enter your message (minimum 10 characters)",
                },
            }}
            infoItems={[
                {
                    icon: "map",
                    title: t("info.address"),
                    content: "123 Nguyen Van Linh, District 7, Ho Chi Minh City",
                },
                {
                    icon: "phone",
                    title: t("info.phone"),
                    content: "1900 1234",
                    href: "tel:19001234",
                },
                {
                    icon: "email",
                    title: t("info.email"),
                    content: "info@sisrd.org.vn",
                    href: "mailto:info@sisrd.org.vn",
                },
                {
                    icon: "clock",
                    title: t("info.workingHours"),
                    content: t("info.workingHoursValue"),
                },
            ]}
            subjectOptions={[
                { value: "service-inquiry", label: t("subjects.service") },
                { value: "course-registration", label: t("subjects.course") },
                { value: "business-cooperation", label: t("subjects.cooperation") },
                { value: "other", label: t("subjects.other") },
            ]}
            mapEmbedUrl="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.024!2d106.7!3d10.7328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQzJzU4LjEiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1sen!2svn!4v1700000000000"
        />
    );
}
