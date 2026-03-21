"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
    threshold?: number;
    className?: string;
    as?: string;
    repeat?: boolean;
}

export function ScrollReveal({
    children,
    delay,
    threshold = 0.12,
    className = "",
    as = "div",
    repeat = true,
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
                        if (!repeat) {
                            observer.unobserve(entry.target);
                        }
                    } else if (repeat) {
                        entry.target.classList.remove("visible");
                    }
                });
            },
            { threshold, rootMargin: "0px 0px -40px 0px" }
        );

        observer.observe(el);

        return () => {
            observer.unobserve(el);
        };
    }, [threshold, repeat]);

    const Component = as as React.ElementType;

    return (
        <Component
            ref={ref}
            className={`reveal ${className}`}
            {...(delay ? { "data-delay": delay } : {})}
        >
            {children}
        </Component>
    );
}

