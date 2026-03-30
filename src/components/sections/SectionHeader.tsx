"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { publicMotionTokens } from "@/components/motion/PublicMotion";

export interface SectionHeaderProps {
    badge?: string;
    title: string;
    subtitle?: string;
    alignment?: "left" | "center" | "right";
    centered?: boolean;
    variant?: "light" | "dark";
    motionPreset?: "none" | "section" | "contrast";
    className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    badge,
    title,
    subtitle,
    alignment,
    centered,
    variant = "light",
    motionPreset = "section",
    className,
}) => {
    const actualAlignment = centered ? "center" : (alignment || "left");
    const isDark = variant === "dark";
    const shouldReduceMotion = useReducedMotion();

    const alignmentMap = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
    } as const;

    return (
        <motion.div
            className={cn("mb-8 md:mb-10", alignmentMap[actualAlignment], className)}
            initial={
                shouldReduceMotion || motionPreset === "none"
                    ? false
                    : motionPreset === "contrast"
                      ? "hiddenContrast"
                      : "hidden"
            }
            whileInView={shouldReduceMotion || motionPreset === "none" ? undefined : "visible"}
            viewport={shouldReduceMotion || motionPreset === "none" ? undefined : { once: true, amount: 0.2, margin: "0px 0px -8% 0px" }}
            variants={{
                hidden: {
                    opacity: 0,
                    y: 22,
                    transition: { staggerChildren: 0.1 },
                },
                hiddenContrast: {
                    opacity: 0,
                    y: 28,
                    scale: 0.985,
                    transition: { staggerChildren: 0.1 },
                },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        ...publicMotionTokens.sectionSpring,
                        staggerChildren: 0.1,
                    },
                },
            }}
        >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.68fr)] lg:items-end">
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        hiddenContrast: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 },
                    }}
                    className={cn("space-y-3", actualAlignment === "right" && "lg:order-2")}
                >
                    {badge ? (
                        <div className={cn("inline-flex items-center gap-3", actualAlignment === "right" && "ml-auto", actualAlignment === "center" && "mx-auto")}>
                            <span className={cn("h-px w-10", isDark ? "bg-white/14" : "bg-[rgba(16,40,70,0.18)]")} />
                            <span className={cn("editorial-caption", isDark ? "text-[var(--on-dark-meta)]" : "text-[var(--ink-muted)]")}>
                                {badge}
                            </span>
                        </div>
                    ) : null}
                    <h2
                        className={cn(
                            "max-w-[13ch] font-heading text-[2rem] leading-[0.94] tracking-[-0.055em] md:text-[2.55rem] lg:text-[3.05rem]",
                            isDark ? "!text-[var(--on-dark-heading)]" : "text-[var(--ink)]",
                            actualAlignment === "center" && "mx-auto",
                            actualAlignment === "right" && "ml-auto"
                        )}
                    >
                        {title}
                    </h2>
                </motion.div>

                {subtitle ? (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 16 },
                            hiddenContrast: { opacity: 0, y: 16 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        className={cn("flex items-start gap-3.5", actualAlignment === "right" && "lg:justify-end")}
                    >
                        <div className={cn("mt-2 h-11 w-px shrink-0", isDark ? "bg-white/14" : "bg-[rgba(16,40,70,0.16)]")} />
                        <p
                            className={cn(
                                "max-w-[30rem] text-[0.96rem] leading-[1.84rem] md:text-[1rem] md:leading-[1.92rem]",
                                isDark ? "text-[var(--on-dark-body)]" : "text-[var(--ink-soft)]",
                                actualAlignment === "right" && "text-left"
                            )}
                        >
                            {subtitle}
                        </p>
                    </motion.div>
                ) : (
                    <div />
                )}
            </div>
        </motion.div>
    );
};

SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
