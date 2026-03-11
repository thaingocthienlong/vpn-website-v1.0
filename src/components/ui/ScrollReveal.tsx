"use client";

import { useEffect, useRef, type ReactNode, createElement } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    threshold?: number;
    className?: string;
    as?: string;
}

export function ScrollReveal({
    children,
    delay,
    threshold = 0.12,
    className = "",
    as = "div",
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

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

    return createElement(
        as,
        {
            ref,
            className: `reveal ${className}`,
            ...(delay ? { "data-delay": delay } : {}),
        },
        children
    );
}

