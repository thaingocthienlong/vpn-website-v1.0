"use client";

import { useState, useEffect, useRef } from "react";

interface CourseSection {
    id: string;
    key: string;
    title: string;
    content: string;
}

interface TocItem {
    key: string;
    title: string;
}

interface CourseContentProps {
    sections: CourseSection[];
    toc: TocItem[];
}

export default function CourseContent({ sections, toc }: CourseContentProps) {
    const [activeSection, setActiveSection] = useState<string>(
        sections.length > 0 ? sections[0].key : ""
    );
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    // Scroll spy for TOC
    useEffect(() => {
        if (!sections.length) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150;

            for (const section of sections) {
                const element = sectionRefs.current[section.key];
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.key);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    const scrollToSection = (sectionKey: string) => {
        const element = sectionRefs.current[sectionKey];
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 120,
                behavior: "smooth",
            });
        }
    };

    return (
        <>
            {/* TOC Sidebar - Fixed Left */}
            <div className="lg:col-span-1">
                <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200 sticky top-32">
                    <h3 className="font-heading font-bold text-slate-800 mb-4">
                        Nội dung
                    </h3>
                    <nav className="space-y-1">
                        {toc.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => scrollToSection(item.key)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${activeSection === item.key
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                {item.title}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content Sections */}
            <div className="lg:col-span-3">
                <div className="space-y-8">
                    {sections.map((section) => (
                        <div
                            key={section.key}
                            id={section.key}
                            ref={(el) => { sectionRefs.current[section.key] = el; }}
                            className="bg-white shadow-sm rounded-2xl p-8 border border-slate-200"
                        >
                            <h2 className="text-2xl font-heading font-bold text-slate-800 mb-6">
                                {section.title}
                            </h2>
                            <article
                                className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-slate-800 prose-p:text-slate-600 prose-li:text-slate-600 prose-table:text-sm prose-table:border-collapse prose-th:bg-white prose-th:p-2 prose-td:p-2 prose-td:border-slate-200 prose-th:border-slate-200 prose-td:border prose-th:border prose-img:rounded-xl prose-img:shadow-md prose-strong:text-slate-800 prose-a:text-blue-400"
                                dangerouslySetInnerHTML={{ __html: section.content }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
