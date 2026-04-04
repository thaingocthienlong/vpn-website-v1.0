import { Suspense } from "react";
import { NewsListingPageClient } from "@/components/news/NewsListingPageClient";

export default function NewsListingPage() {
    return (
        <Suspense fallback={null}>
            <NewsListingPageClient
                locale="vi"
                basePath="/tin-tuc"
                title="Tin tức & Sự kiện"
                description="Cập nhật những hoạt động và tin tức mới nhất từ Viện Phương Nam"
                allLabel="Tất cả"
                categoriesLabel="Danh mục"
                latestLabel="Bài viết mới nhất"
                emptyTitle="Chưa có bài viết nào"
                emptyDescription="Hiện tại chưa có bài viết trong danh mục này."
                errorTitle="Đã xảy ra lỗi"
                filterMode="links"
                postsPerPage={10}
                showFeatured={false}
                gridColumns={2}
                listLayout="rows"
            />
        </Suspense>
    );
}
