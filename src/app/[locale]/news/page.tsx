import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsListingPageClient } from "@/components/news/NewsListingPageClient";

export default async function NewsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    if (resolvedLocale === "en") {
        const tNews = await getTranslations({ locale, namespace: "news" });
        const tCommon = await getTranslations({ locale, namespace: "common" });

        return (
            <Suspense fallback={null}>
                <NewsListingPageClient
                    locale="en"
                    basePath="/en/news"
                    title={tNews("title")}
                    description={tNews("description")}
                    allLabel={tCommon("all")}
                    categoriesLabel={tNews("categories")}
                    latestLabel={tNews("latestPosts")}
                    emptyTitle={tNews("noPosts")}
                    emptyDescription={tNews("noPostsDesc")}
                    errorTitle={tCommon("error")}
                    errorDescription={tCommon("updateSoon")}
                    filterMode="state"
                    showHeroPanel={false}
                />
            </Suspense>
        );
    }

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
                showHeroPanel={false}
                gridColumns={2}
            />
        </Suspense>
    );
}
