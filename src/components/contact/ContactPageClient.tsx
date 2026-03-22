"use client";

import * as React from "react";
import {
    CheckCircle,
    Clock,
    EnvelopeSimple,
    MapPin,
    PaperPlaneRight,
    Phone,
} from "@phosphor-icons/react";
import { PublicPageShell, PublicStatePanel } from "@/components/route-shell";
import { Button, Input, Select, Textarea } from "@/components/ui";

type ContactIconKey = "map" | "phone" | "email" | "clock";

export interface ContactInfoItem {
    icon: ContactIconKey;
    title: string;
    content: string;
    href?: string;
}

export interface ContactSubjectOption {
    value: string;
    label: string;
}

interface ContactTexts {
    badge?: string;
    title: string;
    description: string;
    infoTitle: string;
    formTitle: string;
    successTitle: string;
    successDescription: string;
    sendAnotherLabel: string;
    submitLabel: string;
    submittingLabel: string;
    fields: {
        fullNameLabel: string;
        fullNamePlaceholder: string;
        emailLabel: string;
        emailPlaceholder: string;
        phoneLabel: string;
        phonePlaceholder: string;
        subjectLabel: string;
        subjectPlaceholder: string;
        messageLabel: string;
        messagePlaceholder: string;
    };
    errors: {
        fullName: string;
        email: string;
        phone: string;
        subject: string;
        message: string;
    };
}

export interface ContactPageClientProps {
    texts: ContactTexts;
    infoItems: ContactInfoItem[];
    subjectOptions: ContactSubjectOption[];
    mapEmbedUrl: string;
}

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

const initialFormData: FormData = {
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};

const iconMap = {
    map: MapPin,
    phone: Phone,
    email: EnvelopeSimple,
    clock: Clock,
} satisfies Record<ContactIconKey, React.ElementType>;

export function ContactPageClient({
    texts,
    infoItems,
    subjectOptions,
    mapEmbedUrl,
}: ContactPageClientProps) {
    const [formData, setFormData] = React.useState<FormData>(initialFormData);
    const [errors, setErrors] = React.useState<Partial<Record<keyof FormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const validate = React.useCallback(() => {
        const nextErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.fullName || formData.fullName.trim().length < 2) {
            nextErrors.fullName = texts.errors.fullName;
        }

        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            nextErrors.email = texts.errors.email;
        }

        if (formData.phone) {
            const normalizedPhone = formData.phone.replace(/\s/g, "");
            if (!/^(0|84|\+84)?[0-9]{9,10}$/.test(normalizedPhone)) {
                nextErrors.phone = texts.errors.phone;
            }
        }

        if (!formData.subject) {
            nextErrors.subject = texts.errors.subject;
        }

        if (!formData.message || formData.message.trim().length < 10) {
            nextErrors.message = texts.errors.message;
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }, [formData, texts.errors]);

    const updateField = React.useCallback(
        (field: keyof FormData, value: string) => {
            setFormData((previous) => ({ ...previous, [field]: value }));
            if (errors[field]) {
                setErrors((previous) => ({ ...previous, [field]: undefined }));
            }
        },
        [errors]
    );

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setIsSuccess(true);
                setFormData(initialFormData);
                setErrors({});
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const secondaryPanel = (
        <div className="grid gap-3">
            {infoItems.slice(0, 2).map((item) => {
                const Icon = iconMap[item.icon];

                return (
                    <div
                        key={`${item.title}-${item.content}`}
                        className="public-panel-muted flex items-start gap-3 rounded-[1.6rem] p-4"
                    >
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.1)] text-[var(--accent-strong)]">
                            <Icon className="h-5 w-5" weight="duotone" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                {item.title}
                            </p>
                            {item.href ? (
                                <a href={item.href} className="text-sm leading-7 text-[var(--ink)] transition-colors hover:text-[var(--accent-strong)]">
                                    {item.content}
                                </a>
                            ) : (
                                <p className="text-sm leading-7 text-[var(--ink)]">{item.content}</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const aside = (
        <div className="space-y-5">
            <section className="public-panel rounded-[2rem] p-6 md:p-7">
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-[rgba(26,72,164,0.1)] pb-4">
                    <h2 className="text-2xl leading-tight text-[var(--ink)]">{texts.infoTitle}</h2>
                </div>
                <div className="space-y-3">
                    {infoItems.map((item) => {
                        const Icon = iconMap[item.icon];

                        return (
                            <div
                                key={`${item.title}-${item.content}`}
                                className="rounded-[1.4rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.68)] p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[rgba(23,88,216,0.1)] text-[var(--accent-strong)]">
                                        <Icon className="h-5 w-5" weight="duotone" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                            {item.title}
                                        </p>
                                        {item.href ? (
                                            <a href={item.href} className="text-sm leading-7 text-[var(--ink)] transition-colors hover:text-[var(--accent-strong)]">
                                                {item.content}
                                            </a>
                                        ) : (
                                            <p className="text-sm leading-7 text-[var(--ink)]">{item.content}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="public-panel overflow-hidden rounded-[2rem] p-2">
                <div className="aspect-[1.15] overflow-hidden rounded-[1.5rem] border border-[rgba(26,72,164,0.1)]">
                    <iframe
                        src={mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={texts.title}
                    />
                </div>
            </div>
        </div>
    );

    const main = isSuccess ? (
        <PublicStatePanel
            icon={CheckCircle}
            title={texts.successTitle}
            description={texts.successDescription}
            action={
                <Button variant="outline" onClick={() => setIsSuccess(false)}>
                    {texts.sendAnotherLabel}
                </Button>
            }
        />
    ) : (
        <section className="public-panel rounded-[2.15rem] p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-[rgba(26,72,164,0.1)] pb-4">
                <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.15rem]">
                    {texts.formTitle}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <Input
                        label={texts.fields.fullNameLabel}
                        value={formData.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                        placeholder={texts.fields.fullNamePlaceholder}
                        error={errors.fullName}
                    />
                    <Input
                        label={texts.fields.emailLabel}
                        type="email"
                        value={formData.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        placeholder={texts.fields.emailPlaceholder}
                        error={errors.email}
                    />
                    <Input
                        label={texts.fields.phoneLabel}
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => updateField("phone", event.target.value)}
                        placeholder={texts.fields.phonePlaceholder}
                        error={errors.phone}
                    />
                    <Select
                        label={texts.fields.subjectLabel}
                        value={formData.subject}
                        onChange={(event) => updateField("subject", event.target.value)}
                        placeholder={texts.fields.subjectPlaceholder}
                        error={errors.subject}
                        options={subjectOptions}
                    />
                </div>

                <Textarea
                    label={texts.fields.messageLabel}
                    value={formData.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    placeholder={texts.fields.messagePlaceholder}
                    error={errors.message}
                    rows={6}
                />

                <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    rightIcon={<PaperPlaneRight className="h-4 w-4" weight="bold" />}
                >
                    {isSubmitting ? texts.submittingLabel : texts.submitLabel}
                </Button>
            </form>
        </section>
    );

    return (
        <PublicPageShell
            badge={texts.badge}
            title={texts.title}
            description={texts.description}
            secondaryPanel={secondaryPanel}
            main={main}
            aside={aside}
            asideSticky={false}
            mainClassName="min-w-0"
        />
    );
}

export default ContactPageClient;
