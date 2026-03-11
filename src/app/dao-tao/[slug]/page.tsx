import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, Phone, Star, GraduationCap, BookOpen, FileText, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseBySlug, getRelatedCourses } from "@/lib/services/api-services";
import CourseContent from "@/components/course/CourseContent";

// Course type labels
const typeConfig: Record<string, { label: string; color: string; iconName: string }> = {
    ADMISSION: {
        label: "Tuyển sinh",
        color: "bg-emerald-600",
        iconName: "FileText",
    },
    SHORT_COURSE: {
        label: "Bồi dưỡng",
        color: "bg-blue-600",
        iconName: "BookOpen",
    },
    STUDY_ABROAD: {
        label: "Du học",
        color: "bg-purple-600",
        iconName: "GraduationCap",
    },
};

function TypeIcon({ name }: { name: string }) {
    switch (name) {
        case "FileText": return <FileText className="w-4 h-4" />;
        case "BookOpen": return <BookOpen className="w-4 h-4" />;
        case "GraduationCap": return <GraduationCap className="w-4 h-4" />;
        default: return <BookOpen className="w-4 h-4" />;
    }
}

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
    const { slug } = await params;

    // Fetch course data directly from database (no API round-trip)
    const course = await getCourseBySlug(slug);

    // 404 if course not found
    if (!course) {
        notFound();
    }

    // Fetch related courses (needs course.type from above)
    const relatedCourses = await getRelatedCourses(course.type, slug);

    const type = typeConfig[course.type] || typeConfig.SHORT_COURSE;

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero with Featured Image */}
                <section className="relative py-16 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <Link
                            href="/dao-tao"
                            className="inline-flex items-center gap-2 text-slate-800 hover:text-slate-800 mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Tất cả khóa học
                        </Link>

                        {/* Badges */}
                        <div className="flex gap-2 mb-4">
                            <span className={`px-3 py-1 rounded-full ${type.color} text-slate-800 text-sm font-medium flex items-center gap-1`}>
                                <TypeIcon name={type.iconName} />
                                {type.label}
                            </span>
                            {course.isFeatured && (
                                <span className="px-3 py-1 rounded-full bg-white  text-slate-800 text-sm font-medium flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    Nổi bật
                                </span>
                            )}
                            {course.isRegistrationOpen && (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/80  text-slate-800 text-sm font-medium">
                                    Đang tuyển sinh
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-slate-800 mb-4 max-w-4xl">
                            {course.title}
                        </h1>
                        {course.excerpt && (
                            <p className="text-xl text-slate-800 max-w-3xl mb-8">
                                {course.excerpt}
                            </p>
                        )}

                        {/* Category */}
                        {course.category && (
                            <div className="flex flex-wrap gap-6 text-slate-800">
                                <span className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5" />
                                    {course.category.name}
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Content with TOC Sidebar */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-4 gap-8">
                            {/* Interactive TOC + Content (client component) */}
                            <CourseContent sections={course.sections} toc={course.toc} />
                        </div>

                        {/* Registration CTA */}
                        <div className="mt-8 glass-panel rounded-2xl p-8 text-center border border-slate-200">
                            <h3 className="text-2xl font-heading font-bold text-slate-800 mb-4">
                                Sẵn sàng tham gia?
                            </h3>
                            <p className="text-slate-800 mb-6">
                                Đăng ký ngay để nhận ưu đãi đặc biệt cho khóa học này
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/dao-tao/dang-ky">
                                    <Button variant="secondary" size="lg">
                                        Đăng ký khóa học
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <a href="tel:19001234">
                                    <Button variant="ghost" size="lg" className="border-2 border-white !text-slate-800 !bg-transparent hover:!bg-white">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Gọi tư vấn
                                    </Button>
                                </a>
                            </div>
                        </div>

                        {/* Related Courses */}
                        {relatedCourses.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl font-heading font-bold text-slate-800 mb-4">
                                    Khóa học liên quan
                                </h3>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {relatedCourses.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/dao-tao/${related.slug}`}
                                            className="group bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200 hover:border-slate-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all cursor-pointer block"
                                        >
                                            <div className="relative aspect-video bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center overflow-hidden">
                                                {related.featuredImage ? (
                                                    <Image
                                                        src={related.featuredImage}
                                                        alt={related.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        sizes="(max-width: 640px) 100vw, 33vw"
                                                    />
                                                ) : (
                                                    <GraduationCap className="w-8 h-8 text-blue-400/30" />
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h4 className="font-medium text-slate-800 text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                                                    {related.title}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
