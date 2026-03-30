import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Locale } from "@/i18n/config";
import "../globals.css";

// Generate static params for all locales
export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
    const { locale } = await params;

    const baseUrl = "https://vienphuongnam.com";

    return {
        title:
            locale === "en"
                ? "Vien Phuong Nam Institute | Southern Social Resource Development Institute"
                : "Viện Phương Nam | Viện Phát triển nguồn lực xã hội Phương Nam",
        description:
            locale === "en"
                ? "Training, research, services, and social resource development for the community."
                : "Đào tạo, nghiên cứu, dịch vụ và phát triển nguồn lực xã hội vì cộng đồng.",
        alternates: {
            canonical: locale === "en" ? `${baseUrl}/en` : baseUrl,
            languages: {
                "vi": baseUrl,
                "en": `${baseUrl}/en`,
            },
        },
    };
}

export default async function LocaleLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    // Validate locale
    if (!routing.locales.includes(locale as Locale)) {
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Load messages for the current locale
    const messages = await getMessages();

    return (
        <NextIntlClientProvider messages={messages}>
            <div className="public-shell">
                {children}
            </div>
        </NextIntlClientProvider>
    );
}
