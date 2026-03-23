import dynamic from "next/dynamic";
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
} from "@/lib/services/api-services";

// Below-fold sections — lazy loaded for smaller initial bundle
const VideosSection = dynamic(
  () => import("@/components/sections/VideosSection").then((m) => ({ default: m.VideosSection })),
);
const GallerySection = dynamic(
  () => import("@/components/sections/GallerySection").then((m) => ({ default: m.GallerySection })),
);
const CTASection = dynamic(
  () => import("@/components/sections/CTASection").then((m) => ({ default: m.CTASection })),
);
const ContactSection = dynamic(
  () => import("@/components/sections/ContactSection").then((m) => ({ default: m.ContactSection })),
);

// Fetch data server-side
async function getHomepageData() {
  try {
    // Fetch data via Prisma services directly to avoid middleware/HTTP overhead
    const [posts, courses, partners] = await Promise.all([
      getFeaturedPosts('vi', 4),
      getFeaturedCourses('vi', 9),
      getActivePartners('vi'),
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

export default async function HomePage() {
  const { posts, courses, partners } = await getHomepageData();

  return (
    <div className="public-shell min-h-screen flex flex-col">
      <Header />
      <main id="main-content" className="flex-1 pt-[7.75rem] md:pt-[8.75rem]">
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
