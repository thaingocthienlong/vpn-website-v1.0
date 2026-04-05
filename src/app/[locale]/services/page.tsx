import { getTranslations, setRequestLocale } from "next-intl/server";
import { ServicesListPage } from "@/components/services/ServicesListPage";
import { getAllServiceContent, viServiceListSummaries } from "@/lib/content/service-pages";

export default async function ServicesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    if (resolvedLocale === "en") {
        const tServices = await getTranslations({ locale, namespace: "services" });
        const tCommon = await getTranslations({ locale, namespace: "common" });

        return (
            <ServicesListPage
                locale="en"
                basePath="/en/services"
                heroTitle={tServices("title")}
                heroDescription={tServices("description")}
                fetchUrl="/api/services?locale=en"
                fallbackServices={getAllServiceContent("en").map((service) => ({
                    id: service.id,
                    slug: service.slug,
                    title: service.title,
                    excerpt: service.description,
                    iconKey: service.iconKey,
                    features: [],
                }))}
                emptyTitle={tCommon("noResults")}
                emptyDescription={tCommon("updateSoon")}
                errorTitle={tCommon("error")}
                errorDescription={tCommon("updateSoon")}
            />
        );
    }

    return (
        <ServicesListPage
            locale="vi"
            basePath="/dich-vu"
            heroBadge="Dịch vụ của chúng tôi"
            heroTitle="Giải pháp toàn diện"
            heroDescription="Chúng tôi cung cấp đa dạng các dịch vụ nghiên cứu, tư vấn và đào tạo đáp ứng nhu cầu phát triển của doanh nghiệp và tổ chức."
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
