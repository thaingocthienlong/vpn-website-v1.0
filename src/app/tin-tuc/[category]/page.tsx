import { Suspense } from "react";
import { NewsCategoryPageClient } from "@/components/news/NewsCategoryPageClient";

export default async function NewsCategoryPage({
    params,
}: {
    params: Promise<{ category: string }>;
}) {
    const { category } = await params;

    return (
        <Suspense fallback={null}>
            <NewsCategoryPageClient
                locale="vi"
                basePath="/tin-tuc"
                homeHref="/"
                homeLabel="Trang chủ"
                newsLabel="Tin tức"
                categorySlug={category}
                categoryNotFoundTitle="Không tìm thấy danh mục"
                backToNewsLabel="← Quay lại Tin tức"
                categoryDescriptionPrefix="Tổng hợp các bài viết thuộc danh mục"
                emptyTitle="Chưa có bài viết nào"
                emptyDescription="Hiện tại chưa có bài viết trong danh mục này."
                errorTitle="Đã xảy ra lỗi"
            />
        </Suspense>
    );
}
