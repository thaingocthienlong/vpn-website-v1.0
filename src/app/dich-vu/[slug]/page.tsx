import { ServiceDetailPageTemplate } from "@/components/services/ServiceDetailPageTemplate";
import { getAllServiceContent, getServiceContent } from "@/lib/content/service-pages";

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const service = getServiceContent("vi", slug);
    const otherServices = getAllServiceContent("vi").filter((item) => item.slug !== slug);

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
