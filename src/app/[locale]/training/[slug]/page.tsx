"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, Clock, Users, Award, Phone, Star, Flame, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

// EN Sample course data with dynamic sections
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
    const [activeSection, setActiveSection] = useState(course.sections[0].id);
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    // Handle scroll spy
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150;

            for (const section of course.sections) {
                const element = sectionRefs.current[section.id];
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [course.sections]);

    const scrollToSection = (sectionId: string) => {
        const element = sectionRefs.current[sectionId];
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 120,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero with Featured Image */}
                <section className="relative py-16 border-b border-slate-200">
                    <div className="container mx-auto px-4 relative z-10">
                        <Link
                            href="/en/training"
                            className="inline-flex items-center gap-2 text-slate-800 hover:text-slate-800 mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            All Courses
                        </Link>

                        {/* Badges */}
                        <div className="flex gap-2 mb-4">
                            {course.isHot && (
                                <span className="px-3 py-1 rounded-full bg-orange-500 text-slate-800 text-sm font-medium flex items-center gap-1">
                                    <Flame className="w-4 h-4" />
                                    Hot
                                </span>
                            )}
                            {course.isFeatured && (
                                <span className="px-3 py-1 rounded-full bg-white  text-slate-800 text-sm font-medium flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    Featured
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-slate-800 mb-4 max-w-4xl drop-shadow-sm">
                            {course.title}
                        </h1>
                        <p className="text-xl text-slate-800 max-w-3xl mb-8 leading-relaxed">
                            {course.excerpt}
                        </p>

                        {/* Quick info */}
                        <div className="flex flex-wrap gap-6 text-slate-800">
                            <span className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                24 hours
                            </span>
                            <span className="flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Groups of 20-30
                            </span>
                            <span className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Certificate included
                            </span>
                        </div>
                    </div>
                </section>

                {/* Content with TOC Sidebar */}
                <section className="py-12 relative">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid lg:grid-cols-4 gap-8">
                            {/* TOC Sidebar - Fixed Left */}
                            <div className="lg:col-span-1">
                                <div className="glass-panel rounded-2xl p-6 sticky top-32">
                                    <h3 className="font-heading font-bold text-slate-800 mb-4">
                                        {t("tableOfContents")}
                                    </h3>
                                    <nav className="space-y-1">
                                        {course.sections.map((section) => (
                                            <button
                                                key={section.id}
                                                onClick={() => scrollToSection(section.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === section.id
                                                    ? "bg-blue-50 text-blue-700 font-medium border border-blue-500/30"
                                                    : "text-white hover:bg-white hover:text-white"
                                                    }`}
                                            >
                                                {section.title}
                                            </button>
                                        ))}
                                    </nav>

                                    {/* CTA in sidebar */}
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <Link href="/en/training/register">
                                            <Button fullWidth className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border-none">
                                                {t("registerNow")}
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                        <p className="text-center text-slate-800 text-xs mt-3">
                                            Or call 1900 1234
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content Sections */}
                            <div className="lg:col-span-3">
                                <div className="space-y-8">
                                    {course.sections.map((section) => (
                                        <div
                                            key={section.id}
                                            id={section.id}
                                            ref={(el) => { sectionRefs.current[section.id] = el; }}
                                            className="bg-white shadow-sm rounded-2xl p-8"
                                        >
                                            <h2 className="text-2xl font-heading font-bold text-slate-800 mb-6">
                                                {section.title}
                                            </h2>
                                            <article
                                                className="prose prose-lg max-w-none prose-invert prose-headings:font-heading prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-table:text-sm prose-table:border-collapse prose-th:bg-blue-900/30 prose-th:text-white prose-th:p-3 prose-td:p-3 prose-td:border-slate-200 prose-th:border-slate-200 prose-strong:text-slate-800 prose-a:text-blue-400"
                                                dangerouslySetInnerHTML={{ __html: section.content }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Registration CTA */}
                                <div className="mt-8 glass-panel relative overflow-hidden rounded-2xl p-8 text-center border border-blue-500/20">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-500/20 -z-10" />
                                    <h3 className="text-2xl font-heading font-bold text-slate-800 mb-4">
                                        Ready to join?
                                    </h3>
                                    <p className="text-slate-800 mb-6">
                                        Register now to receive special offers for this course
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <Link href="/en/training/register">
                                            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border-none">
                                                {t("register")} Course
                                                <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                        <a href="tel:19001234">
                                            <Button variant="outline" size="lg" className="border-slate-200 text-slate-800 hover:bg-white glass-button">
                                                <Phone className="w-4 h-4 mr-2" />
                                                Call for Advice
                                            </Button>
                                        </a>
                                    </div>
                                </div>

                                {/* Related Courses */}
                                <div className="mt-8">
                                    <h3 className="text-xl font-heading font-bold text-slate-800 mb-4">
                                        {t("relatedCourses")}
                                    </h3>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        {relatedCourses.map((related) => (
                                            <Link
                                                key={related.slug}
                                                href={`/en/training/${related.slug}`}
                                                className="group bg-white shadow-sm rounded-xl p-4 transition-all cursor-pointer block hover:border-blue-500/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                                            >
                                                <div className="aspect-video bg-blue-900/30 border border-white/5 rounded-lg mb-3 flex items-center justify-center group-hover:bg-blue-800/40 transition-colors">
                                                    <GraduationCap className="w-8 h-8 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <h4 className="font-medium text-slate-200 text-sm group-hover:text-blue-400 transition-colors">
                                                    {related.title}
                                                </h4>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
