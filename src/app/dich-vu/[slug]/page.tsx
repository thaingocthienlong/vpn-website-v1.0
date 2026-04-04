import { ServiceDetailPageTemplate } from "@/components/services/ServiceDetailPageTemplate";
import { getServicePagePayload, getSiteLayout } from "@/lib/services/site-content";

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const [payload, layout] = await Promise.all([
        getServicePagePayload(slug, "vi"),
        getSiteLayout("vi"),
    ]);

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
