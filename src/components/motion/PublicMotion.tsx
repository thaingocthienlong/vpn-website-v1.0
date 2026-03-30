"use client";

import * as React from "react";
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type HTMLMotionProps,
    type TargetAndTransition,
    type Transition,
    type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

type MotionPreset = "hero" | "section" | "contrast" | "footer";
type MotionItemPreset = "fade-up" | "fade-left" | "fade-right" | "scale";
type MotionElement = "div" | "section" | "article" | "aside";
type AccentVariant = "orb" | "mesh" | "halo";

export const publicMotionTokens = {
    sectionSpring: {
        type: "spring",
        stiffness: 86,
        damping: 18,
        mass: 0.95,
    } as Transition,
    hoverSpring: {
        type: "spring",
        stiffness: 220,
        damping: 20,
        mass: 0.65,
    } as Transition,
    magneticSpring: {
        stiffness: 220,
        damping: 18,
        mass: 0.45,
    },
    stagger: 0.12,
    slowLoop: 16,
    fastLoop: 8,
};

const sectionStates: Record<MotionPreset, { initial: TargetAndTransition; animate: TargetAndTransition }> = {
    hero: {
        initial: { opacity: 0, y: 52, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
    },
    section: {
        initial: { opacity: 0, y: 42, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1 },
    },
    contrast: {
        initial: { opacity: 0, y: 48, scale: 0.975 },
        animate: { opacity: 1, y: 0, scale: 1 },
    },
    footer: {
        initial: { opacity: 0, y: 28 },
        animate: { opacity: 1, y: 0 },
    },
};

const itemVariants: Record<MotionItemPreset, Variants> = {
    "fade-up": {
        hidden: { opacity: 0, y: 28, scale: 0.985 },
        visible: { opacity: 1, y: 0, scale: 1 },
    },
    "fade-left": {
        hidden: { opacity: 0, x: 28 },
        visible: { opacity: 1, x: 0 },
    },
    "fade-right": {
        hidden: { opacity: 0, x: -28 },
        visible: { opacity: 1, x: 0 },
    },
    scale: {
        hidden: { opacity: 0, scale: 0.94, y: 14 },
        visible: { opacity: 1, scale: 1, y: 0 },
    },
};

function renderMotionElement(
    as: MotionElement,
    props: HTMLMotionProps<"div">,
    children: React.ReactNode
) {
    if (as === "section") return <motion.section {...props}>{children}</motion.section>;
    if (as === "article") return <motion.article {...props}>{children}</motion.article>;
    if (as === "aside") return <motion.aside {...props}>{children}</motion.aside>;
    return <motion.div {...props}>{children}</motion.div>;
}

interface MotionSectionProps {
    children: React.ReactNode;
    className?: string;
    preset?: MotionPreset;
    as?: MotionElement;
    once?: boolean;
    amount?: number;
    delay?: number;
}

export function MotionSection({
    children,
    className,
    preset = "section",
    as = "div",
    once = true,
    amount = 0.18,
    delay = 0,
}: MotionSectionProps) {
    const shouldReduceMotion = useReducedMotion();
    const state = sectionStates[preset];

    return renderMotionElement(
        as,
        {
            className,
            initial: shouldReduceMotion ? undefined : state.initial,
            whileInView: shouldReduceMotion ? undefined : state.animate,
            viewport: shouldReduceMotion ? undefined : { once, amount, margin: "0px 0px -10% 0px" },
            transition: delay
                ? { ...publicMotionTokens.sectionSpring, delay }
                : publicMotionTokens.sectionSpring,
        },
        children
    );
}

interface MotionGroupProps {
    children: React.ReactNode;
    className?: string;
    stagger?: number;
    delay?: number;
    once?: boolean;
    amount?: number;
}

export function MotionGroup({
    children,
    className,
    stagger = publicMotionTokens.stagger,
    delay = 0,
    once = true,
    amount = 0.18,
}: MotionGroupProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            className={className}
            variants={{
                hidden: {},
                visible: {
                    transition: {
                        staggerChildren: stagger,
                        delayChildren: delay,
                    },
                },
            }}
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView={shouldReduceMotion ? undefined : "visible"}
            viewport={shouldReduceMotion ? undefined : { once, amount, margin: "0px 0px -10% 0px" }}
        >
            {children}
        </motion.div>
    );
}

interface MotionItemProps {
    children: React.ReactNode;
    className?: string;
    as?: MotionElement;
    preset?: MotionItemPreset;
    delay?: number;
}

export function MotionItem({
    children,
    className,
    as = "div",
    preset = "fade-up",
    delay = 0,
}: MotionItemProps) {
    const shouldReduceMotion = useReducedMotion();

    return renderMotionElement(
        as,
        {
            className,
            variants: itemVariants[preset],
            transition: delay
                ? { ...publicMotionTokens.sectionSpring, delay }
                : publicMotionTokens.sectionSpring,
            initial: shouldReduceMotion ? false : undefined,
            animate: shouldReduceMotion ? undefined : undefined,
        },
        children
    );
}

interface ParallaxLayerProps {
    children: React.ReactNode;
    className?: string;
    depth?: number;
}

export function ParallaxLayer({
    children,
    className,
    depth = 24,
}: ParallaxLayerProps) {
    const shouldReduceMotion = useReducedMotion();
    const ref = React.useRef<HTMLDivElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const yRange = useTransform(scrollYProgress, [0, 1], [depth, -depth]);
    const y = useSpring(yRange, {
        stiffness: 90,
        damping: 18,
        mass: 0.45,
    });

    return (
        <motion.div
            ref={ref}
            className={cn("relative", className)}
            style={shouldReduceMotion ? undefined : { y, willChange: "transform" }}
        >
            {children}
        </motion.div>
    );
}

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    strength?: number;
}

export function MagneticButton({
    children,
    className,
    strength = 14,
}: MagneticButtonProps) {
    const shouldReduceMotion = useReducedMotion();
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const x = useSpring(rawX, publicMotionTokens.magneticSpring);
    const y = useSpring(rawY, publicMotionTokens.magneticSpring);
    const rotateX = useTransform(y, [-strength, strength], [4, -4]);
    const rotateY = useTransform(x, [-strength, strength], [-4, 4]);

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        if (shouldReduceMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
        rawX.set(offsetX * strength * 2);
        rawY.set(offsetY * strength * 2);
    };

    const handlePointerLeave = () => {
        rawX.set(0);
        rawY.set(0);
    };

    return (
        <motion.div
            className={cn("inline-flex transform-gpu", className)}
            style={
                shouldReduceMotion
                    ? undefined
                    : {
                          x,
                          y,
                          rotateX,
                          rotateY,
                          transformPerspective: 1200,
                          transformStyle: "preserve-3d",
                          willChange: "transform",
                      }
            }
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            {children}
        </motion.div>
    );
}

interface FloatingAccentProps {
    className?: string;
    variant?: AccentVariant;
}

const accentAnimations: Record<AccentVariant, HTMLMotionProps<"div">["animate"]> = {
    orb: {
        x: [0, 18, -10, 0],
        y: [0, -18, 12, 0],
        scale: [1, 1.05, 0.96, 1],
        rotate: [0, 4, -4, 0],
    },
    mesh: {
        x: [0, -14, 14, 0],
        y: [0, 12, -10, 0],
        scale: [1, 1.08, 0.94, 1],
        rotate: [0, -3, 3, 0],
    },
    halo: {
        opacity: [0.45, 0.8, 0.5],
        scale: [0.98, 1.04, 1],
        y: [0, -10, 0],
    },
};

export function FloatingAccent({
    className,
    variant = "orb",
}: FloatingAccentProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <motion.div
            aria-hidden="true"
            className={cn("pointer-events-none absolute transform-gpu", className)}
            animate={shouldReduceMotion ? undefined : accentAnimations[variant]}
            transition={
                shouldReduceMotion
                    ? undefined
                    : {
                          duration: variant === "halo" ? publicMotionTokens.fastLoop : publicMotionTokens.slowLoop,
                          ease: "easeInOut",
                          repeat: Infinity,
                      }
            }
        />
    );
}
