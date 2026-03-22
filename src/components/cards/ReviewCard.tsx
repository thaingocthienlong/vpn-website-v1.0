"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Quotes, Star } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { publicMotionTokens } from "@/components/motion/PublicMotion";

interface ReviewCardProps {
    name: string;
    role?: string;
    company?: string;
    content: string;
    avatar?: string | null;
    rating?: number;
    variant?: "feature" | "default";
    className?: string;
}

export function ReviewCard({
    name,
    role,
    company,
    content,
    avatar,
    rating = 5,
    variant = "default",
    className,
}: ReviewCardProps) {
    const isFeature = variant === "feature";
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.article
            className={cn(
                "interactive-card flex h-full flex-col rounded-[2rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(234,243,255,0.86))] shadow-[var(--shadow-xs)]",
                isFeature ? "p-6 md:p-7" : "p-5 md:p-6",
                className
            )}
            whileHover={shouldReduceMotion ? undefined : { y: -8, rotateX: 2.5, rotateY: -2 }}
            transition={publicMotionTokens.hoverSpring}
            style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
        >
            <div className="mb-5 flex items-center justify-between">
                <motion.div
                    animate={shouldReduceMotion ? undefined : { y: [0, -4, 0], rotate: [0, 2, 0] }}
                    transition={shouldReduceMotion ? undefined : { duration: 6.5, ease: "easeInOut", repeat: Infinity }}
                >
                    <Quotes className="h-9 w-9 text-[rgba(23,88,216,0.28)]" weight="duotone" />
                </motion.div>
                {rating > 0 && (
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "h-4 w-4",
                                    i < rating
                                        ? "fill-[rgba(23,88,216,0.7)] text-[rgba(23,88,216,0.7)]"
                                        : "fill-[rgba(23,88,216,0.12)] text-[rgba(23,88,216,0.12)]"
                                )}
                                weight="fill"
                            />
                        ))}
                    </div>
                )}
            </div>

            <p className={cn("mb-6 flex-1 text-[var(--ink-soft)]", isFeature ? "text-base leading-8" : "text-[15px] leading-[1.95rem]")}>
                &ldquo;{content}&rdquo;
            </p>

            <div className="flex items-center gap-4 border-t border-[rgba(26,72,164,0.1)] pt-4">
                {avatar ? (
                    <Image
                        src={avatar}
                        alt={name}
                        width={52}
                        height={52}
                        className="h-13 w-13 rounded-[1.15rem] object-cover"
                    />
                ) : (
                    <div className="flex h-13 w-13 items-center justify-center rounded-[1.15rem] bg-[rgba(23,88,216,0.12)] font-semibold text-[var(--accent-strong)]">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <p className="font-semibold text-[var(--ink)]">{name}</p>
                    {(role || company) && (
                        <p className="text-sm text-[var(--ink-soft)]">
                            {role}
                            {role && company && " - "}
                            {company}
                        </p>
                    )}
                </div>
            </div>
        </motion.article>
    );
}

export default ReviewCard;
