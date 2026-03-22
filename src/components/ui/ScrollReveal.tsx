"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    threshold?: number;
    className?: string;
    as?: "div" | "section" | "article" | "aside" | "main";
}

export function ScrollReveal({
    children,
    delay,
    threshold = 0.12,
    className = "",
    as = "div",
}: ScrollRevealProps) {
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (!("IntersectionObserver" in window)) {
            el.classList.add("visible");
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold, rootMargin: "0px 0px -40px 0px" }
        );

        observer.observe(el);

        return () => {
            observer.unobserve(el);
        };
    }, [threshold]);

    const sharedProps = {
        className: `reveal ${className}`.trim(),
        ...(delay ? { "data-delay": delay } : {}),
    };

    if (as === "section") {
        return <section ref={ref as React.Ref<HTMLElement>} {...sharedProps}>{children}</section>;
    }

    if (as === "article") {
        return <article ref={ref as React.Ref<HTMLElement>} {...sharedProps}>{children}</article>;
    }

    if (as === "aside") {
        return <aside ref={ref as React.Ref<HTMLElement>} {...sharedProps}>{children}</aside>;
    }

    if (as === "main") {
        return <main ref={ref as React.Ref<HTMLElement>} {...sharedProps}>{children}</main>;
    }

    return <div ref={ref as React.Ref<HTMLDivElement>} {...sharedProps}>{children}</div>;
}

