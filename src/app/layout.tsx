import type { Metadata } from "next";
import localFont from "next/font/local";
import { OptionalClerkProvider } from "@/components/providers/OptionalClerkProvider";
import { SiteLayoutProvider } from "@/components/providers/SiteLayoutProvider";
import { getSiteLayout } from "@/lib/services/site-content";
import "./globals.css";
import "./site-grid.css";

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
  title: "Viện Phương Nam | Viện Phát triển nguồn lực xã hội Phương Nam",
  description: "Kết nối đào tạo, nghiên cứu, dịch vụ và phát triển nguồn lực xã hội vì cộng đồng.",
  alternates: {
    canonical: "https://vienphuongnam.com",
    languages: {
      "vi": "https://vienphuongnam.com",
      "en": "https://vienphuongnam.com/en",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [viSiteLayout, enSiteLayout] = await Promise.all([
    getSiteLayout("vi"),
    getSiteLayout("en"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Viện Phát triển nguồn lực xã hội Phương Nam",
    alternateName: "Viện Phương Nam",
    url: "https://vienphuongnam.com",
    logo: "https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png",
    description: "Đào tạo, nghiên cứu, dịch vụ và phát triển nguồn lực xã hội vì cộng đồng.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "45 Đinh Tiên Hoàng",
      addressLocality: "TP. Hồ Chí Minh",
      addressCountry: "VN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84-912-114-511",
      contactType: "customer service",
      availableLanguage: ["Vietnamese", "English"],
    },
    sameAs: [
      "https://www.facebook.com/vienphuongnam",
      "https://www.youtube.com/@vienphuongnam",
    ],
  };

  return (
    <html lang="vi">
      <body
        className={`${momoTrustSans.variable} ${momoTrustDisplay.variable} ${momoSignature.variable} bg-background text-foreground antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <OptionalClerkProvider>
          <SiteLayoutProvider value={{ vi: viSiteLayout, en: enSiteLayout }}>
            <div className="public-shell relative z-10">
              {children}
            </div>
          </SiteLayoutProvider>
        </OptionalClerkProvider>
      </body>
    </html>
  );
}
