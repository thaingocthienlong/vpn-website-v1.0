import { getTranslations, setRequestLocale } from "next-intl/server";
import { NewsArticlePageClient } from "@/components/news/NewsArticlePageClient";

export default async function NewsArticlePage({
    params,
}: {
    params: Promise<{ locale: string; category: string; slug: string }>;
}) {
    const { locale, category, slug } = await params;
    const resolvedLocale = locale === "en" ? "en" : "vi";

    setRequestLocale(locale);

    if (resolvedLocale === "en") {
        const tNews = await getTranslations({ locale, namespace: "news" });
        const tCommon = await getTranslations({ locale, namespace: "common" });
        const tBreadcrumb = await getTranslations({ locale, namespace: "breadcrumb" });

        return (
            <NewsArticlePageClient
                locale="en"
                basePath="/en/news"
                homeHref="/en"
                homeLabel={tBreadcrumb("home")}
                newsLabel={tNews("title")}
                categorySlug={category}
                postSlug={slug}
                notFoundTitle={tNews("noArticles")}
                backToNewsLabel={`← ${tNews("backToNews")}`}
                errorTitle={tCommon("error")}
                errorDescription={tCommon("updateSoon")}
            />
        );
    }

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
