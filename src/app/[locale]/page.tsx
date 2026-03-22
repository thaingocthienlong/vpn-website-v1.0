import { setRequestLocale } from "next-intl/server";
import {
    HeroSection,
    PartnersSection,
    ServicesSection,
    TrainingSection,
    NewsSection,
    ReviewsSection,
    VideosSection,
    GallerySection,
    CTASection,
    ContactSection,
} from "@/components/sections";
import { Header, Footer } from "@/components/layout";
import { Locale } from "@/i18n/config";
import {
    getFeaturedPosts,
    getFeaturedCourses,
    getActivePartners,
} from "@/lib/services/api-services";

// Fetch data server-side
async function getHomepageData(locale: Locale) {
    try {
        // Fetch data via Prisma services directly to avoid middleware/HTTP overhead
        const [posts, courses, partners] = await Promise.all([
            getFeaturedPosts(locale, 4),
            getFeaturedCourses(locale, 9),
            getActivePartners(locale),
        ]);

        return {
            posts,
            courses,
            partners,
        };
    } catch (error) {
        console.error("Error fetching homepage data:", error);
        return {
            posts: [],
            courses: [],
            partners: [],
        };
    }
}

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const { posts, courses, partners } = await getHomepageData(locale as Locale);

    return (
        <div className="public-shell min-h-screen flex flex-col">
            <Header />
            <main id="main-content" className="flex-1 pt-24 md:pt-28">
                {/* 1. Hero */}
                <HeroSection featuredPrograms={courses.slice(0, 3)} />

                {/* 2. Reviews */}
                <ReviewsSection />

                {/* 3. Partners */}
                <PartnersSection partners={partners} />

                {/* 4. Services */}
                <ServicesSection />

                {/* 5. Videos */}
                <VideosSection />

                {/* 6. Training - Featured Courses */}
                <TrainingSection courses={courses} />

                {/* 7. News */}
                <NewsSection posts={posts} />

                {/* 8. Gallery */}
                <GallerySection />

                {/* 9. CTA */}
                <CTASection />

                {/* 10. Contact */}
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
}
