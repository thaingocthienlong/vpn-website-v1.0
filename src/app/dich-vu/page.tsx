import { ServicesListPage } from "@/components/services/ServicesListPage";
import { getServiceIconKeyBySlug } from "@/lib/content/service-pages";
import { getServiceSummaries } from "@/lib/services/site-content";

export default async function ServicesListingPage() {
    const serviceSummaries = await getServiceSummaries("vi");
    const services = serviceSummaries.map((service, index) => ({
        id: `SV-${String(index + 1).padStart(2, "0")}`,
        slug: service.slug,
        title: service.title,
        excerpt: service.excerpt,
        iconKey: getServiceIconKeyBySlug(service.slug),
        features: [],
    }));

    return (
        <ServicesListPage
            locale="vi"
            basePath="/dich-vu"
            heroBadge="Dịch vụ của chúng tôi"
            heroTitle="Giải pháp toàn diện"
            heroDescription="Chúng tôi cung cấp đa dạng các dịch vụ nghiên cứu, tư vấn và đào tạo đáp ứng nhu cầu phát triển của doanh nghiệp và tổ chức."
            heroCards={services.slice(0, 2).map((service) => ({
                title: service.title,
                description: service.excerpt,
            }))}
            services={services}
            detailLabel="Xem chi tiết"
            emptyTitle="Không tìm thấy kết quả"
            errorTitle="Đã xảy ra lỗi"
            cta={{
                title: "Cần tư vấn dịch vụ?",
                description: "Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn tìm giải pháp phù hợp nhất",
                actions: [
                    { href: "/lien-he", label: "Liên hệ tư vấn", variant: "primary" },
                    { href: "/dao-tao", label: "Xem khóa đào tạo", variant: "secondary" },
                ],
            }}
        />
    );
}
