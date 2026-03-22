"use client";

import { useEffect, useRef, useState } from "react";

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
    tocTitle?: string;
}

export default function CourseContent({ sections, toc, tocTitle = "Nội dung" }: CourseContentProps) {
    const [activeSection, setActiveSection] = useState<string>(sections.length > 0 ? sections[0].key : "");
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    useEffect(() => {
        if (!sections.length || typeof window === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

                if (visibleEntry?.target?.id) {
                    setActiveSection(visibleEntry.target.id);
                }
            },
            {
                rootMargin: "-20% 0px -55% 0px",
                threshold: [0.15, 0.35, 0.6],
            }
        );

        sections.forEach((section) => {
            const element = sectionRefs.current[section.key];
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [sections]);

    const scrollToSection = (sectionKey: string) => {
        const element = sectionRefs.current[sectionKey];
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    };

    return (
        <>
            <div className="lg:col-span-1">
                <div className="public-panel sticky top-28 rounded-[2rem] p-5 md:p-6">
                    <div className="mb-5 flex items-center justify-between gap-3 border-b border-[rgba(26,72,164,0.1)] pb-4">
                        <h3 className="font-heading text-xl font-bold text-[var(--ink)]">
                            {tocTitle}
                        </h3>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                            {toc.length}
                        </span>
                    </div>
                    <h3 className="sr-only">
                        {tocTitle}
                    </h3>
                    <nav className="space-y-1">
                        {toc.map((item) => (
                            <button
                                key={item.key}
                                onClick={() => scrollToSection(item.key)}
                                className={`w-full rounded-[1rem] px-3 py-2.5 text-left text-sm transition-colors ${
                                    activeSection === item.key
                                        ? "bg-[rgba(23,88,216,0.1)] font-medium text-[var(--accent-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
                                        : "text-[var(--ink-soft)] hover:bg-[rgba(23,88,216,0.04)] hover:text-[var(--ink)]"
                                }`}
                            >
                                {item.title}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="lg:col-span-3">
                <div className="space-y-6 md:space-y-8">
                    {sections.map((section) => (
                        <div
                            key={section.key}
                            id={section.key}
                            ref={(el) => { sectionRefs.current[section.key] = el; }}
                            className="content-area public-band rounded-[2.2rem] p-6 md:p-8"
                        >
                            <div className="mb-6 flex items-start gap-4">
                                <div className="mt-1 h-12 w-px shrink-0 bg-[rgba(23,88,216,0.22)] md:h-16" />
                                <h2 className="text-2xl font-heading font-bold text-[var(--ink)] md:text-[2.1rem]">
                                    {section.title}
                                </h2>
                            </div>
                            <article
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: section.content }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
