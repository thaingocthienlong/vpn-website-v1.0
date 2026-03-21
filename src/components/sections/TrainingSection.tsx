"use client";

import { SectionWrapper, type SectionWrapperProps } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { CourseCard } from "@/components/cards";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Button } from "@/components/ui";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

interface Course {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    type: "ADMISSION" | "SHORT_COURSE" | "STUDY_ABROAD";
    duration?: string | null;
    price?: number | null;
    isRegistrationOpen?: boolean;
    isFeatured?: boolean;
    category?: {
        name: string;
        slug: string;
    } | null;
}

interface TrainingSectionProps {
    courses?: Course[];
    title?: string;
    subtitle?: string;
    background?: SectionWrapperProps["background"];
    textColor?: SectionWrapperProps["textColor"];
    backdropBlur?: SectionWrapperProps["backdropBlur"];
}

export function TrainingSection({
    courses = [],
    title,
    background,
    textColor,
    backdropBlur,
}: TrainingSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedTitle = title || (isEn ? "Featured Courses" : "Khóa Học Nổi Bật");

    // Show max 6 courses
    const displayCourses = courses.slice(0, 9);

    return (
        <SectionWrapper background={background || "transparent"} textColor={textColor} backdropBlur={backdropBlur}>
            <ScrollReveal>
                <SectionHeader
                    title={resolvedTitle}
                    centered
                />
            </ScrollReveal>

            {displayCourses.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                        {displayCourses.map((course, index) => (
                            <ScrollReveal
                                key={course.id}
                                delay={index + 1}
                            >
                                <CourseCard
                                    id={course.id}
                                    title={course.title}
                                    slug={course.slug}
                                    excerpt={course.excerpt}
                                    featuredImage={course.featuredImage}
                                    type={course.type}
                                    duration={course.duration}
                                    price={course.price}
                                    isRegistrationOpen={course.isRegistrationOpen}
                                    isFeatured={course.isFeatured}
                                    category={course.category}
                                    locale={locale}
                                />
                            </ScrollReveal>
                        ))}
                    </div>

                    <div className="text-center">
                        <Button asChild variant="outline" size="lg">
                            <Link href={isEn ? "/en/training" : "/dao-tao"} className="inline-flex items-center">
                                <span>{isEn ? "View all courses" : "Xem tất cả khóa học"}</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                        <GraduationCap className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-slate-700 mb-2">
                        {isEn ? "New courses coming soon" : "Sắp có khóa học mới"}
                    </h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-6">
                        {isEn
                            ? "We're preparing high-quality courses. Sign up for notifications so you don't miss out!"
                            : "Chúng tôi đang chuẩn bị các khóa học chất lượng cao. Hãy đăng ký nhận thông báo để không bỏ lỡ!"}
                    </p>
                    <Button asChild variant="outline" size="md">
                        <Link href={isEn ? "/en/contact" : "/lien-he"}>
                            {isEn ? "Get notified" : "Đăng ký nhận thông báo"}
                        </Link>
                    </Button>
                </div>
            )}
        </SectionWrapper>
    );
}

export default TrainingSection;
