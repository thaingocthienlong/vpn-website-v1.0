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
import type { BackdropBlur } from "@/lib/tailwind-colors";
import {
    getFeaturedPosts,
    getFeaturedCourses,
    getActivePartners,
    getHomepageSections,
    getCoursesByIds,
    getActiveVideos
} from "@/lib/services/api-services";

// Fetch data server-side
async function getHomepageData(locale: Locale) {
    try {
        // Fetch data via Prisma services directly to avoid middleware/HTTP overhead
        const [posts, defaultCourses, partners, sections, videos] = await Promise.all([
            getFeaturedPosts(locale, 4),
            getFeaturedCourses(locale, 9),
            getActivePartners(locale),
            getHomepageSections(locale),
            getActiveVideos(),
        ]);

        // Gather all featuredCourseIds from sections to fetch specifically if they aren't in defaultCourses
        const heroFeaturedIds = new Set<string>();
        const otherFeaturedIds = new Set<string>();
        sections.forEach((sec: any) => {
            if (sec.featuredCourseIds && Array.isArray(sec.featuredCourseIds)) {
                sec.featuredCourseIds.forEach((id: string) => {
                    if (typeof id === 'string') {
                        if (sec.sectionKey === 'hero') {
                            heroFeaturedIds.add(id);
                        } else {
                            otherFeaturedIds.add(id);
                        }
                    }
                });
            }
        });

        let heroExtraCourses: typeof defaultCourses = [];
        let otherExtraCourses: typeof defaultCourses = [];

        if (heroFeaturedIds.size > 0) {
            heroExtraCourses = await getCoursesByIds(Array.from(heroFeaturedIds), locale, true);
        }
        if (otherFeaturedIds.size > 0) {
            otherExtraCourses = await getCoursesByIds(Array.from(otherFeaturedIds), locale, false);
        }
        
        // combine safely
        const courses = [...defaultCourses];
        [...otherExtraCourses, ...heroExtraCourses].forEach(ec => {
            if (!courses.find(c => c.id === ec.id)) {
                courses.push(ec);
            }
        });

        return {
            posts,
            courses,
            partners,
            sections,
            videos,
        };
    } catch (error) {
        console.error("Error fetching homepage data:", error);
        return {
            posts: [],
            courses: [],
            partners: [],
            sections: [],
            videos: [],
        };
    }
}

type SectionData = {
    id: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    config?: string | null;
    videoUrl?: string;
    featuredCourseIds?: string[];
    background?: string; // Parsed from config
    textColor?: string;
    backdropBlur?: string;
    [key: string]: unknown;
};

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    const { posts, courses, partners, sections } = await getHomepageData(locale as Locale);

    // Helper to render section based on key
    const renderSection = (sec: SectionData) => {
        const titleText = sec.title !== null ? (sec.title as string) : undefined;
        const subText = sec.subtitle !== null ? (sec.subtitle as string) : undefined;
        
        const bgProp = sec.background ? { background: sec.background } : {};
        const colorProps = {
            ...bgProp,
            ...(sec.textColor ? { textColor: sec.textColor } : {}),
            ...(sec.backdropBlur ? { backdropBlur: sec.backdropBlur as BackdropBlur } : {}),
        };

        switch (sec.sectionKey) {
            case 'hero':
                let heroCourses = courses;
                if (sec.featuredCourseIds && Array.isArray(sec.featuredCourseIds) && sec.featuredCourseIds.length > 0) {
                    const heroFeaturedIds = sec.featuredCourseIds as string[];
                    heroCourses = heroFeaturedIds
                        .map(id => courses.find(c => c.id === id))
                        .filter((c): c is typeof courses[0] => c !== undefined);
                }
                
                return (
                    <HeroSection
                        key={sec.id}
                        title={titleText}
                        subtitle={subText}
                        videoUrl={sec.videoUrl}
                        featuredPrograms={heroCourses}
                        {...colorProps}
                    />
                );

            case 'reviews':
                return <ReviewsSection key={sec.id} title={titleText} subtitle={subText} {...colorProps} />;
            case 'partners':
                return <PartnersSection key={sec.id} partners={partners} title={titleText} subtitle={subText} {...colorProps} />;
            case 'services':
                return <ServicesSection key={sec.id} title={titleText} subtitle={subText} {...colorProps} />;
            case 'videos':
                return <VideosSection key={sec.id} videos={videos} title={titleText} subtitle={subText} {...colorProps} />;
            case 'training':
                let trainingCourses = courses;
                if (sec.featuredCourseIds && Array.isArray(sec.featuredCourseIds) && sec.featuredCourseIds.length > 0) {
                    const trainingFeaturedIds = sec.featuredCourseIds as string[];
                    trainingCourses = trainingFeaturedIds
                        .map(id => courses.find(c => c.id === id))
                        .filter((c): c is typeof courses[0] => c !== undefined);
                } else {
                    trainingCourses = courses.slice(0, 6);
                }

                return <TrainingSection key={sec.id} courses={trainingCourses} title={titleText} subtitle={subText} {...colorProps} />;
            case 'news':
                return <NewsSection key={sec.id} posts={posts} title={titleText} subtitle={subText} {...colorProps} />;
            case 'gallery':
                return <GallerySection key={sec.id} title={titleText} subtitle={subText} {...colorProps} />;
            case 'cta':
                return <CTASection key={sec.id} title={titleText} subtitle={subText} {...colorProps} />;
            case 'contact':
                return <ContactSection key={sec.id} title={titleText} subtitle={subText} {...colorProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {sections.length > 0 ? (
                    sections.map(renderSection)
                ) : (
                    // Fallback if DB layout is not seeded yet
                    <>
                        <HeroSection />
                        <ReviewsSection />
                        <PartnersSection partners={partners} />
                        <ServicesSection />
                        <VideosSection />
                        <TrainingSection courses={courses} />
                        <NewsSection posts={posts} />
                        <GallerySection />
                        <CTASection />
                        <ContactSection />
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
