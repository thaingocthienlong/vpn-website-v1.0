import { NewsArticlePageClient } from "@/components/news/NewsArticlePageClient";

export default async function NewsDetailPage({
    params,
}: {
    params: Promise<{ category: string; slug: string }>;
}) {
    const { category, slug } = await params;

    return (
        <NewsArticlePageClient
            locale="vi"
            basePath="/tin-tuc"
            homeHref="/"
            homeLabel="Trang chủ"
            newsLabel="Tin tức"
            categorySlug={category}
            postSlug={slug}
            notFoundTitle="Không tìm thấy bài viết"
            backToNewsLabel="← Quay lại Tin tức"
            errorTitle="Đã xảy ra lỗi"
        />
    );
}
