"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
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

    const desktopLayout =
        actualAlignment === "center"
            ? "mx-auto max-w-6xl gap-5 lg:grid lg:grid-cols-[minmax(0,0.98fr)_minmax(280px,0.82fr)] lg:items-end lg:text-left"
            : "gap-5 lg:grid lg:grid-cols-[minmax(0,0.98fr)_minmax(280px,0.82fr)] lg:items-end";

    return (
        <motion.div
            className={cn("mb-8 md:mb-10 lg:mb-12", alignmentMap[actualAlignment], className)}
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
                    y: 26,
                    transition: { staggerChildren: 0.12 },
                },
                hiddenContrast: {
                    opacity: 0,
                    y: 32,
                    scale: 0.985,
                    transition: { staggerChildren: 0.12 },
                },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                        ...publicMotionTokens.sectionSpring,
                        staggerChildren: 0.12,
                    },
                },
            }}
        >
            <div className={cn(desktopLayout)}>
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 24 },
                        hiddenContrast: { opacity: 0, y: 24 },
                        visible: { opacity: 1, y: 0 },
                    }}
                    className={cn("space-y-2.5 md:space-y-3", actualAlignment === "right" && "lg:order-2")}
                >
                    {badge && (
                        <Badge
                            variant={isDark ? "hot" : "default"}
                            size="md"
                            className={cn(
                                isDark && "border-white/12 bg-white/10 text-white",
                                actualAlignment === "center" && "lg:mx-0",
                                actualAlignment === "right" && "ml-auto"
                            )}
                        >
                            {badge}
                        </Badge>
                    )}
                    <h2
                        className={cn(
                            "max-w-[11.5ch] font-heading text-[2.15rem] leading-[0.92] tracking-[-0.05em] md:text-[2.85rem] lg:text-[3.35rem]",
                            isDark ? "text-white" : "text-[var(--ink)]",
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
                            hidden: { opacity: 0, y: 18 },
                            hiddenContrast: { opacity: 0, y: 18 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        className={cn(
                            "flex items-start gap-3.5 lg:justify-start",
                            actualAlignment === "center" && "lg:justify-start",
                            actualAlignment === "right" && "lg:justify-end"
                        )}
                    >
                        <div className={cn("mt-2 h-11 w-px shrink-0 md:h-12", isDark ? "bg-white/20" : "bg-[rgba(23,88,216,0.22)]")} />
                        <p
                            className={cn(
                                "max-w-[32rem] text-[0.95rem] leading-[1.95rem] md:text-[1rem] md:leading-8",
                                isDark ? "text-white/76" : "text-[var(--ink-soft)]",
                                actualAlignment === "center" && "lg:mx-0",
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
