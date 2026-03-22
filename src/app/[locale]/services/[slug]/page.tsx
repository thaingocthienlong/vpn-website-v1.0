import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServiceDetailPageTemplate } from "@/components/services/ServiceDetailPageTemplate";
import { getAllServiceContent, getServiceContent } from "@/lib/content/service-pages";

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    const service = getServiceContent(resolvedLocale, slug);
    const otherServices = getAllServiceContent(resolvedLocale).filter((item) => item.slug !== slug);

    if (resolvedLocale === "en") {
        const tServices = await getTranslations({ locale, namespace: "services" });

        return (
            <ServiceDetailPageTemplate
                basePath="/en/services"
                contactHref="/en/contact"
                service={service}
                otherServices={otherServices}
                labels={{
                    allServicesLabel: tServices("allServices"),
                    notFoundTitle: tServices("notFound"),
                    viewAllLabel: tServices("viewAll"),
                    workingProcessTitle: tServices("workingProcess"),
                    contactConsultationTitle: tServices("contactConsultation"),
                    contactConsultationDescription: tServices("ourTeam"),
                    sendInquiryLabel: tServices("sendInquiry"),
                    hotlineLabel: "Hotline: 1900 1234",
                    otherServicesTitle: tServices("otherServices"),
                }}
            />
        );
    }

    return (
        <ServiceDetailPageTemplate
            basePath="/dich-vu"
            contactHref="/lien-he"
            service={service}
            otherServices={otherServices}
            labels={{
                allServicesLabel: "Tất cả dịch vụ",
                notFoundTitle: "Không tìm thấy dịch vụ",
                viewAllLabel: "Xem tất cả dịch vụ",
                workingProcessTitle: "Quy trình làm việc",
                contactConsultationTitle: "Liên hệ tư vấn",
                contactConsultationDescription: "Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn",
                sendInquiryLabel: "Gửi yêu cầu tư vấn",
                hotlineLabel: "Hotline: 1900 1234",
                otherServicesTitle: "Dịch vụ khác",
            }}
        />
    );
}
