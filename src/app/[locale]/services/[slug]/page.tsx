import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServiceDetailPageTemplate } from "@/components/services/ServiceDetailPageTemplate";
import { getServicePagePayload, getSiteLayout } from "@/lib/services/site-content";

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    const [payload, layout] = await Promise.all([
        getServicePagePayload(slug, resolvedLocale),
        getSiteLayout(resolvedLocale),
    ]);

    if (resolvedLocale === "en") {
        const tServices = await getTranslations({ locale, namespace: "services" });

        return (
            <ServiceDetailPageTemplate
                basePath="/en/services"
                contactHref="/en/contact"
                service={payload.service}
                otherServices={payload.otherServices}
                footerProps={{
                    description: layout.footer.description,
                    contactInfo: layout.footer.contactInfo,
                    socialLinks: layout.footer.socialLinks,
                    quickLinks: layout.footer.quickLinks,
                    legalLinks: layout.footer.legalLinks,
                    copyright: layout.footer.copyright,
                }}
                labels={{
                    allServicesLabel: tServices("allServices"),
                    notFoundTitle: tServices("notFound"),
                    viewAllLabel: tServices("viewAll"),
                    workingProcessTitle: tServices("workingProcess"),
                    contactConsultationTitle: tServices("contactConsultation"),
                    contactConsultationDescription: tServices("ourTeam"),
                    sendInquiryLabel: tServices("sendInquiry"),
                    hotlineLabel: `Hotline: ${layout.footer.contactInfo.phone}`,
                    otherServicesTitle: tServices("otherServices"),
                }}
            />
        );
    }

    return (
        <ServiceDetailPageTemplate
            basePath="/dich-vu"
            contactHref="/lien-he"
            service={payload.service}
            otherServices={payload.otherServices}
            footerProps={{
                description: layout.footer.description,
                contactInfo: layout.footer.contactInfo,
                socialLinks: layout.footer.socialLinks,
                quickLinks: layout.footer.quickLinks,
                legalLinks: layout.footer.legalLinks,
                copyright: layout.footer.copyright,
            }}
            labels={{
                allServicesLabel: "Tất cả dịch vụ",
                notFoundTitle: "Không tìm thấy dịch vụ",
                viewAllLabel: "Xem tất cả dịch vụ",
                workingProcessTitle: "Quy trình làm việc",
                contactConsultationTitle: "Liên hệ tư vấn",
                contactConsultationDescription: "Đội ngũ của Viện Phương Nam sẵn sàng hỗ trợ bạn.",
                sendInquiryLabel: "Gửi yêu cầu tư vấn",
                hotlineLabel: `Hotline: ${layout.footer.contactInfo.phone}`,
                otherServicesTitle: "Dịch vụ khác",
            }}
        />
    );
}
