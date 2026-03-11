import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Locale } from "@/i18n/config";
import "../globals.css";

// Momo Trust Sans — body text (variable font)
const momoTrustSans = localFont({
    src: "../../../public/fonts/Momo_Trust_Sans/MomoTrustSans-VariableFont_wght.ttf",
    variable: "--font-momo-sans",
    display: "swap",
});

// Momo Trust Display — headings
const momoTrustDisplay = localFont({
    src: "../../../public/fonts/Momo_Trust_Display/MomoTrustDisplay-Regular.ttf",
    variable: "--font-momo-display",
    display: "swap",
});

// Momo Signature — accent / special elements
const momoSignature = localFont({
    src: "../../../public/fonts/Momo_Signature/MomoSignature-Regular.ttf",
    variable: "--font-momo-signature",
    display: "swap",
});

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

    const baseUrl = "https://vienphuongnam.edu.vn";

    return {
        title:
            locale === "en"
                ? "SISRD - Southern Institute for Social Resources Development"
                : "SISRD - Viện Nghiên Cứu và Phát Triển Nguồn Nhân Lực Phương Nam",
        description:
            locale === "en"
                ? "Quality human resources training and development in Vietnam"
                : "Đào tạo và phát triển nguồn nhân lực chất lượng cao tại Việt Nam",
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
        <ClerkProvider>
            <html lang={locale}>
                <body
                    className={`${momoTrustSans.variable} ${momoTrustDisplay.variable} ${momoSignature.variable} antialiased`}
                >
                    <NextIntlClientProvider messages={messages}>
                        {children}
                    </NextIntlClientProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
