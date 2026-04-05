import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Clock,
    GraduationCap,
    Phone,
    Star,
    UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui";
import { PublicPageShell } from "@/components/route-shell";
import CourseContent from "@/components/course/CourseContent";
import { getCourseBySlug, getRelatedCourses } from "@/lib/services/api-services";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);

    if (!course) {
        notFound();
    }

    const relatedCourses = await getRelatedCourses(course.type, slug);
    const toc = course.toc.map((item) => ({ key: item.key, title: item.title }));
    const typeLabel =
        course.type === "ADMISSION" ? "Tuyển sinh" : course.type === "STUDY_ABROAD" ? "Du học" : "Bồi dưỡng";

    const heroActions = (
        <>
            <Button asChild variant="outline">
                <Link href="/dao-tao">
                    <ArrowLeft className="h-4 w-4" weight="bold" />
                    Tất cả khóa học
                </Link>
            </Button>
            <Button asChild>
                <Link href="/dao-tao/dang-ky">
                    Đăng ký khóa học
                    <ArrowRight className="h-4 w-4" weight="bold" />
                </Link>
            </Button>
        </>
    );

    const heroPanel = (
        <div className="grid gap-3">
            <div className="public-panel-muted rounded-[1.6rem] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    {course.category?.name || "Đào tạo"}
                </p>
                <div className="mt-4 flex items-center gap-3 text-sm leading-7 text-[var(--ink)]">
                    <Clock className="h-5 w-5 text-[var(--accent-strong)]" weight="duotone" />
                    24 giờ
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm leading-7 text-[var(--ink)]">
                    <UsersThree className="h-5 w-5 text-[var(--accent-strong)]" weight="duotone" />
                    Nhóm 20-30 người
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm leading-7 text-[var(--ink)]">
                    <CheckCircle className="h-5 w-5 text-[var(--accent-strong)]" weight="duotone" />
                    Chứng nhận đi kèm
                </div>
            </div>
            <div className="public-panel-muted rounded-[1.6rem] p-4">
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="rounded-full border border-[rgba(23,88,216,0.18)] bg-[rgba(23,88,216,0.08)] px-3 py-1 text-[var(--accent-strong)]">
                        {typeLabel}
                    </span>
                    {course.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(148,102,46,0.18)] bg-[rgba(148,102,46,0.12)] px-3 py-1 text-[var(--warning)]">
                            <Star className="h-3.5 w-3.5" weight="fill" />
                            Nổi bật
                        </span>
                    )}
                    {course.isRegistrationOpen && (
                        <span className="rounded-full border border-[rgba(47,122,95,0.18)] bg-[rgba(47,122,95,0.12)] px-3 py-1 text-[var(--success)]">
                            Đang tuyển sinh
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const main = (
        <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-4">
                <CourseContent sections={course.sections} toc={toc} />
            </div>

            <section className="public-panel public-band rounded-[2.1rem] p-6 text-center md:p-8">
                <h2 className="text-3xl leading-[0.95] text-[var(--ink)]">Sẵn sàng tham gia?</h2>
                <p className="mx-auto mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                    Đăng ký ngay để nhận ưu đãi đặc biệt cho khóa học này
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button asChild size="lg">
                        <Link href="/dao-tao/dang-ky">
                            Đăng ký khóa học
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <a href="tel:19001234">
                            <Phone className="h-4 w-4" weight="bold" />
                            Gọi tư vấn
                        </a>
                    </Button>
                </div>
            </section>

            {relatedCourses.length > 0 && (
                <section className="space-y-5">
                    <div className="space-y-3">
                        <div className="public-divider" />
                        <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                            Khóa học liên quan
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {relatedCourses.map((related) => (
                            <Link
                                key={related.id}
                                href={`/dao-tao/${related.slug}`}
                                className="public-panel interactive-card group overflow-hidden rounded-[2rem]"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-[rgba(23,88,216,0.08)]">
                                    {related.featuredImage ? (
                                        <Image
                                            src={related.featuredImage}
                                            alt={related.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-[var(--accent-strong)]">
                                            <GraduationCap className="h-10 w-10" weight="duotone" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3 p-5 md:p-6">
                                    <h3 className="text-xl leading-tight text-[var(--ink)]">{related.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );

    return (
        <PublicPageShell
            title={course.title}
            description={course.excerpt || undefined}
            actions={heroActions}
            secondaryPanel={heroPanel}
            main={main}
            asideSticky={false}
            heroAppearanceTargetId="page.hero.course-detail"
        />
    );
}
