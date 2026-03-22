"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Clock,
    GraduationCap,
    Phone,
    Star,
    UsersThree,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import { PublicPageShell } from "@/components/route-shell";
import CourseContent from "@/components/course/CourseContent";

const getCourseData = (slug: string) => ({
    id: "1",
    slug,
    title: "Occupational Safety Training Group 3",
    excerpt: "Occupational safety and health training course for workers as required by Decree 44/2016/ND-CP and national technical regulations on occupational safety.",
    category: "occupational-safety",
    isFeatured: true,
    isHot: true,
    sections: [
        {
            id: "introduction",
            key: "introduction",
            title: "Course Introduction",
            content: `
                <p>The Occupational Safety and Health Training Group 3 is designed for workers operating in environments with hazardous and harmful factors as required by law.</p>
                <p>The training program complies with Decree 44/2016/ND-CP of the Government and the Circulars of the Ministry of Labor, Invalids and Social Affairs.</p>
                <h3>Why is training necessary?</h3>
                <ul>
                    <li>Mandatory by law</li>
                    <li>Prevention of occupational accidents and diseases</li>
                    <li>Raising workers' safety awareness</li>
                    <li>Minimizing risks for businesses</li>
                </ul>
            `,
        },
        {
            id: "objectives",
            key: "objectives",
            title: "Training Objectives",
            content: `
                <p>After completing the course, trainees will be able to:</p>
                <ul>
                    <li>Identify hazardous and harmful factors in the workplace</li>
                    <li>Understand and properly follow occupational safety regulations</li>
                    <li>Correctly use personal protective equipment</li>
                    <li>Know how to handle occupational accidents</li>
                    <li>Basic first aid in emergency situations</li>
                </ul>
            `,
        },
        {
            id: "curriculum",
            key: "curriculum",
            title: "Course Content",
            content: `
                <h3>Part 1: General Knowledge (8 hours)</h3>
                <ul>
                    <li>Overview of occupational safety and health</li>
                    <li>Workers' rights and obligations</li>
                    <li>Occupational safety policies and regulations</li>
                    <li>National technical standards</li>
                </ul>
                <h3>Part 2: Specialized Knowledge (8 hours)</h3>
                <ul>
                    <li>Electrical safety in production</li>
                    <li>Chemical and hazardous material safety</li>
                    <li>Machine and equipment safety</li>
                    <li>Fire and explosion prevention</li>
                </ul>
                <h3>Part 3: Practice (8 hours)</h3>
                <ul>
                    <li>Using personal protective equipment</li>
                    <li>First aid skills</li>
                    <li>Emergency situation handling</li>
                    <li>Fire escape procedures</li>
                </ul>
            `,
        },
        {
            id: "target-audience",
            key: "target-audience",
            title: "Target Audience",
            content: `
                <p>This course is designed for:</p>
                <ul>
                    <li>Workers in industrial manufacturing sectors</li>
                    <li>Factory and production workshop employees</li>
                    <li>Personnel working in hazardous environments</li>
                    <li>Newly recruited workers</li>
                    <li>Workers changing job positions</li>
                </ul>
                <p><strong>Requirements:</strong> Workers currently employed or planning to work in occupations requiring Group 3 OSH training.</p>
            `,
        },
        {
            id: "certification",
            key: "certification",
            title: "Certification",
            content: `
                <p>Upon completion and passing the examination, trainees will receive:</p>
                <ul>
                    <li><strong>OSH Training Certificate</strong> under Decree 44/2016/ND-CP</li>
                    <li>Valid for <strong>2 years</strong> from the date of issue</li>
                    <li>Nationally recognized</li>
                </ul>
                <p><em>Note: Workers must be retrained before the certificate expires.</em></p>
            `,
        },
        {
            id: "schedule",
            key: "schedule",
            title: "Course Schedule",
            content: `
                <p>Courses are organized regularly with flexible schedules:</p>
                <table>
                    <tr>
                        <th>Batch</th>
                        <th>Start Date</th>
                        <th>Format</th>
                        <th>Status</th>
                    </tr>
                    <tr>
                        <td>K25</td>
                        <td>Feb 15, 2024</td>
                        <td>At Institute</td>
                        <td>Registration Open</td>
                    </tr>
                    <tr>
                        <td>K26</td>
                        <td>Mar 01, 2024</td>
                        <td>Online</td>
                        <td>Registration Open</td>
                    </tr>
                    <tr>
                        <td>K27</td>
                        <td>Mar 15, 2024</td>
                        <td>In-house</td>
                        <td>Contact us</td>
                    </tr>
                </table>
            `,
        },
    ],
});

const relatedCourses = [
    { slug: "an-toan-lao-dong-nhom-1", title: "Occupational Safety Group 1" },
    { slug: "an-toan-dien", title: "Industrial Electrical Safety" },
    { slug: "so-cap-cuu-co-ban", title: "Basic First Aid" },
];

export default function CourseDetailPage() {
    const params = useParams();
    const course = getCourseData(params.slug as string);
    const t = useTranslations("course");
    const toc = course.sections.map((section) => ({ key: section.key, title: section.title }));

    const heroActions = (
        <>
            <Button asChild variant="outline">
                <Link href="/en/training">
                    <ArrowLeft className="h-4 w-4" weight="bold" />
                    All Courses
                </Link>
            </Button>
            <Button asChild>
                <Link href="/en/training/register">
                    {t("registerNow")}
                    <ArrowRight className="h-4 w-4" weight="bold" />
                </Link>
            </Button>
        </>
    );

    const heroPanel = (
        <div className="grid gap-3">
            <div className="public-panel-muted rounded-[1.6rem] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                    {course.category}
                </p>
                <div className="mt-4 flex items-center gap-3 text-sm leading-7 text-[var(--ink)]">
                    <Clock className="h-5 w-5 text-[var(--accent-strong)]" weight="duotone" />
                    24 hours
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm leading-7 text-[var(--ink)]">
                    <UsersThree className="h-5 w-5 text-[var(--accent-strong)]" weight="duotone" />
                    Groups of 20-30
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm leading-7 text-[var(--ink)]">
                    <CheckCircle className="h-5 w-5 text-[var(--accent-strong)]" weight="duotone" />
                    Certificate included
                </div>
            </div>
            <div className="public-panel-muted rounded-[1.6rem] p-4">
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                    {course.isHot && (
                        <span className="rounded-full border border-[rgba(148,102,46,0.18)] bg-[rgba(148,102,46,0.12)] px-3 py-1 text-[var(--warning)]">
                            Hot
                        </span>
                    )}
                    {course.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(148,102,46,0.18)] bg-[rgba(148,102,46,0.12)] px-3 py-1 text-[var(--warning)]">
                            <Star className="h-3.5 w-3.5" weight="fill" />
                            Featured
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const main = (
        <div className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-4">
                <CourseContent sections={course.sections} toc={toc} tocTitle={t("tableOfContents")} />
            </div>

            <section className="public-panel public-band rounded-[2.1rem] p-6 text-center md:p-8">
                <h2 className="text-3xl leading-[0.95] text-[var(--ink)]">Ready to join?</h2>
                <p className="mx-auto mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                    Register now to receive special offers for this course
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button asChild size="lg">
                        <Link href="/en/training/register">
                            {t("register")} Course
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <a href="tel:19001234">
                            <Phone className="h-4 w-4" weight="bold" />
                            Call for Advice
                        </a>
                    </Button>
                </div>
            </section>

            <section className="space-y-5">
                <div className="space-y-3">
                    <div className="public-divider" />
                    <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                        {t("relatedCourses")}
                    </h2>
                </div>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {relatedCourses.map((related, index) => (
                        <Link
                            key={related.slug}
                            href={`/en/training/${related.slug}`}
                            className={`public-panel interactive-card group rounded-[2rem] p-5 md:p-6 ${
                                index % 3 === 1 ? "xl:translate-y-6" : ""
                            }`}
                        >
                            <div className="mb-4 flex aspect-[16/10] items-center justify-center rounded-[1.4rem] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                                <GraduationCap className="h-10 w-10" weight="duotone" />
                            </div>
                            <h3 className="text-xl leading-tight text-[var(--ink)]">{related.title}</h3>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );

    return (
        <PublicPageShell
            title={course.title}
            description={course.excerpt}
            actions={heroActions}
            secondaryPanel={heroPanel}
            main={main}
            asideSticky={false}
        />
    );
}
