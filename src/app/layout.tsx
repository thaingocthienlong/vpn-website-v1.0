import type { Metadata } from "next";
import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import { ModernBackground } from "@/components/lightswind/ModernBackground";
import "./globals.css";

// Momo Trust Sans — body text (variable font)
const momoTrustSans = localFont({
  src: "../../public/fonts/Momo_Trust_Sans/MomoTrustSans-VariableFont_wght.ttf",
  variable: "--font-momo-sans",
  display: "swap",
});

// Momo Trust Display — headings
const momoTrustDisplay = localFont({
  src: "../../public/fonts/Momo_Trust_Display/MomoTrustDisplay-Regular.ttf",
  variable: "--font-momo-display",
  display: "swap",
});

// Momo Signature — accent / special elements
const momoSignature = localFont({
  src: "../../public/fonts/Momo_Signature/MomoSignature-Regular.ttf",
  variable: "--font-momo-signature",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SISRD - Viện Nghiên Cứu và Phát Triển Nguồn Nhân Lực Phương Nam",
  description: "Đào tạo và phát triển nguồn nhân lực chất lượng cao tại Việt Nam",
  alternates: {
    canonical: "https://vienphuongnam.edu.vn",
    languages: {
      "vi": "https://vienphuongnam.edu.vn",
      "en": "https://vienphuongnam.edu.vn/en",
    },
  },
};

import { NextIntlClientProvider } from "next-intl";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Viện Phát triển nguồn lực xã hội Phương Nam",
    alternateName: "SISRD",
    url: "https://vienphuongnam.com",
    logo: "https://vienphuongnam.com/images/logo.png",
    description: "Đào tạo, nghiên cứu khoa học, chuyển giao công nghệ và phát triển nguồn nhân lực chất lượng cao tại Việt Nam.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "TP. Hồ Chí Minh",
      addressCountry: "VN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84-28-7306-0996",
      contactType: "customer service",
      availableLanguage: ["Vietnamese", "English"],
    },
    sameAs: [
      "https://www.facebook.com/vienphuongnam",
      "https://www.youtube.com/@vienphuongnam",
    ],
  };

  const messages = (await import(`../../messages/vi.json`)).default;

  return (
    <ClerkProvider>
      <html lang="vi">
        <body
          className={`${momoTrustSans.variable} ${momoTrustDisplay.variable} ${momoSignature.variable} bg-background text-foreground antialiased`}
        >
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <NextIntlClientProvider locale="vi" messages={messages}>
            <ModernBackground />
            <div className="relative z-10">
              {children}
            </div>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
