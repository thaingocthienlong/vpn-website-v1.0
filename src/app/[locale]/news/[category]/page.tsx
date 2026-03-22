import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsCategoryPageClient } from "@/components/news/NewsCategoryPageClient";

export default async function NewsCategoryPage({
    params,
}: {
    params: Promise<{ locale: string; category: string }>;
}) {
    const { locale, category } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    if (resolvedLocale === "en") {
        const tNews = await getTranslations({ locale, namespace: "news" });
        const tCommon = await getTranslations({ locale, namespace: "common" });
        const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });

        return (
            <Suspense fallback={null}>
                <NewsCategoryPageClient
                    locale="en"
                    basePath="/en/news"
                    homeHref="/en"
                    homeLabel={tBreadcrumb("home")}
                    newsLabel={tNews("title")}
                    categorySlug={category}
                    categoryNotFoundTitle={tNews("categoryNotFound")}
                    backToNewsLabel={`← ${tNews("backToNews")}`}
                    categoryDescriptionPrefix={tNews("articlesIn")}
                    emptyTitle={tNews("noPosts")}
                    emptyDescription={tNews("noPostsDesc")}
                    errorTitle={tCommon("error")}
                    errorDescription={tCommon("updateSoon")}
                />
            </Suspense>
        );
    }

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
