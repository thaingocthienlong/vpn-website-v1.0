import nextDynamic from "next/dynamic";
import {
  HeroSection,
  PartnersSection,
  ServicesSection,
  TrainingSection,
  NewsSection,
  ReviewsSection,
} from "@/components/sections";
import { Header, Footer } from "@/components/layout";
import {
  getFeaturedPosts,
  getFeaturedCourses,
  getActivePartners,
  getHomepageSections,
  fetchDataForSections,
  getActiveServices,
  getActiveReviews,
  getActiveVideos,
} from "@/lib/services/api-services";
import type { BackdropBlur } from "@/lib/tailwind-colors";

export const dynamic = "force-dynamic";

// Below-fold sections — lazy loaded for smaller initial bundle
const VideosSection = nextDynamic(
  () => import("@/components/sections/VideosSection").then((m) => ({ default: m.VideosSection })),
);
const GallerySection = nextDynamic(
  () => import("@/components/sections/GallerySection").then((m) => ({ default: m.GallerySection })),
);
const CTASection = nextDynamic(
  () => import("@/components/sections/CTASection").then((m) => ({ default: m.CTASection })),
);
const ContactSection = nextDynamic(
  () => import("@/components/sections/ContactSection").then((m) => ({ default: m.ContactSection })),
);

// Fetch data server-side
async function getHomepageData() {
  try {
    // Fetch data via Prisma services directly to avoid middleware/HTTP overhead
    const [defaultPosts, defaultCourses, partners, sections, defaultServices, defaultReviews, defaultVideos] = await Promise.all([
      getFeaturedPosts('vi', 4),
      getFeaturedCourses('vi', 9),
      getActivePartners('vi'),
      getHomepageSections('vi'),
      getActiveServices('vi', 6),
      getActiveReviews('vi', 15),
      getActiveVideos(),
    ]);

    const sectionData = await fetchDataForSections(sections, 'vi');

    return {
      defaultPosts,
      defaultCourses,
      defaultServices,
      defaultReviews,
      defaultVideos,
      partners,
      sections,
      sectionData,
    };
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    return {
      defaultPosts: [],
      defaultCourses: [],
      defaultServices: [],
      defaultReviews: [],
      partners: [],
      sections: [],
      sectionData: {},
    };
  }
}

type SectionData = {
    id: string;
    sectionKey: string;
    title: string | null;
    subtitle: string | null;
    videoUrl?: string;
    featuredCourseIds?: string[];
    [key: string]: unknown;
};

export default async function HomePage() {
  const { defaultPosts, defaultCourses, defaultServices, defaultReviews, defaultVideos, partners, sections, sectionData } = await getHomepageData();

  // Helper to render section based on key
  const renderSection = (sec: SectionData) => {
      const bgProp = sec.background ? { background: sec.background } : {};
      const colorProps = {
          ...bgProp,
          ...(sec.textColor ? { textColor: sec.textColor } : {}),
          ...(sec.backdropBlur ? { backdropBlur: sec.backdropBlur as BackdropBlur } : {}),
      };

      // Retrieve specific data fetched for this section id, if any
      const fetchedData = sectionData[sec.id];

      switch (sec.sectionKey) {
          case 'hero':
              let heroCourses = defaultCourses;
              if (sec.featuredCourseIds && Array.isArray(sec.featuredCourseIds) && sec.featuredCourseIds.length > 0) {
                  heroCourses = defaultCourses.filter(c => sec.featuredCourseIds?.includes(c.id));
              }
              return <HeroSection key={sec.id} featuredPrograms={heroCourses} videoUrl={sec.videoUrl} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...colorProps} />;
          case 'reviews':
              // If we didn't explicitly select reviews in admin, use the default fetched reviews
              const reviewsToUse = fetchedData && fetchedData.length > 0 ? fetchedData : defaultReviews;
              return <ReviewsSection key={sec.id} reviews={reviewsToUse} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...colorProps} />;
          case 'partners':
              return <PartnersSection key={sec.id} partners={partners} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...colorProps} />;
          case 'services':
              const servicesToUse = fetchedData && fetchedData.length > 0 ? fetchedData : defaultServices;
              return <ServicesSection key={sec.id} services={servicesToUse} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...colorProps} />;
          case 'videos':
              const videosToUse = fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0 ? fetchedData : undefined;
              return <VideosSection key={sec.id} videos={videosToUse} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...colorProps} />;
          case 'training':
              const coursesToUse = fetchedData && fetchedData.length > 0 ? fetchedData : defaultCourses;
              return <TrainingSection key={sec.id} courses={coursesToUse} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...colorProps} />;
          case 'news':
              const postsToUse = fetchedData && fetchedData.length > 0 ? fetchedData : defaultPosts;
              return <NewsSection key={sec.id} posts={postsToUse} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...colorProps} />;
          case 'gallery':
              let imagesToUse = undefined;
              if (sec.images && Array.isArray(sec.images) && sec.images.length > 0) {
                  imagesToUse = sec.images;
              }
              return <GallerySection key={sec.id} images={imagesToUse} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...colorProps} />;
          case 'cta':
              const ctaProps: Record<string, unknown> = {};
              if (sec.buttonText) ctaProps.buttonText = sec.buttonText;
              if (sec.buttonUrl) ctaProps.buttonUrl = sec.buttonUrl;
              return <CTASection key={sec.id} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...ctaProps} {...colorProps} />;
          case 'contact':
              const contactProps: Record<string, unknown> = {};
              if (sec.formTitle) contactProps.formTitle = sec.formTitle;
              if (sec.formSubtitle) contactProps.formSubtitle = sec.formSubtitle;
              if (sec.address) contactProps.address = sec.address;
              if (sec.phone) contactProps.phone = sec.phone;
              if (sec.email) contactProps.email = sec.email;
              if (sec.workingHours) contactProps.workingHours = sec.workingHours;
              if (sec.mapEmbedUrl) contactProps.mapEmbedUrl = sec.mapEmbedUrl;
              return <ContactSection key={sec.id} title={sec.title || undefined} subtitle={sec.subtitle || undefined} {...contactProps} {...colorProps} />;
          default:
              return null;
      }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {sections.length > 0 ? (
            sections.map(renderSection)
        ) : (
            // Fallback if DB layout is not seeded yet
            <>
                <HeroSection />
                <ReviewsSection />
                <PartnersSection partners={partners} />
                <ServicesSection />
                <VideosSection videos={defaultVideos} />
                <TrainingSection courses={defaultCourses} />
                <NewsSection posts={defaultPosts} />
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
