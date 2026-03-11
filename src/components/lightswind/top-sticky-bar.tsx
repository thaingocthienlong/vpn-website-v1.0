"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export interface TopStickyBarProps {
  children?: React.ReactNode;
  className?: string;
  scrollThreshold?: number;
}

export default function TopStickyBar({
  children,
  className,
  scrollThreshold = 20,
}: TopStickyBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  // useMotionValueEvent is more performant than generic window scroll listeners
  // because it reads from the Framer Motion sync loop outside of React's main render phase
  useMotionValueEvent(scrollY, "change", (latest) => {
    const shouldBeScrolled = latest > scrollThreshold;
    if (shouldBeScrolled !== isScrolled) {
      setIsScrolled(shouldBeScrolled);
    }
  });

  return (
    <motion.header
      // The 'layout' prop tells Framer Motion to automatically animate size, position, 
      // and border-radius changes when the CSS classes switch.
      layout
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 1,
      }}
      className={cn(
        "sticky z-[60] mx-auto",
        // We explicitly construct the classes for each state. 
        // Notice we REMOVED `transition-all` and `duration-500` because Framer Motion handles it now.
        isScrolled
          ? "top-3 w-[96%] max-w-7xl rounded-2xl md:rounded-[2rem] bg-[#f1f1f1]/50 backdrop-blur-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-slate-800"
          : "top-0 w-full rounded-none bg-[#f1f1f1]/80 backdrop-blur-xl border-b border-zinc-200/50 shadow-none text-slate-800",
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {children}
      </div>
    </motion.header>
  );
}
