import { ServicesListPage } from "@/components/services/ServicesListPage";
import { viServiceListSummaries } from "@/lib/content/service-pages";

export default function ServicesListingPage() {
    return (
        <ServicesListPage
            locale="vi"
            basePath="/dich-vu"
            heroBadge="Dịch vụ của chúng tôi"
            heroTitle="Giải pháp toàn diện"
            heroDescription="Chúng tôi cung cấp đa dạng các dịch vụ nghiên cứu, tư vấn và đào tạo đáp ứng nhu cầu phát triển của doanh nghiệp và tổ chức."
            heroCards={viServiceListSummaries.slice(0, 2).map((service) => ({
                title: service.title,
                description: service.excerpt,
            }))}
            services={viServiceListSummaries}
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
