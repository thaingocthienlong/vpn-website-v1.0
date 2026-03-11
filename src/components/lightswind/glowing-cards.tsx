"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
}

export interface GlowingCardsProps {
  children: React.ReactNode;
  className?: string;
  /** Enable the glowing overlay effect */
  enableGlow?: boolean;
  /** Size of the glow effect radius */
  glowRadius?: number;
  /** Opacity of the glow effect */
  glowOpacity?: number;
  /** Animation duration for glow transitions */
  animationDuration?: number;
  /** Enable hover effects on individual cards */
  enableHover?: boolean;
  /** Gap between cards */
  gap?: string;
  /** Maximum width of cards container */
  maxWidth?: string;
  /** Padding around the container */
  padding?: string;
  /** Background color for the container */
  backgroundColor?: string;
  /** Border radius for cards */
  borderRadius?: string;
  /** Enable responsive layout */
  responsive?: boolean;
  /** Custom inner container classes */
  innerClassName?: string;
  /** Custom CSS variables for theming */
  customTheme?: {
    cardBg?: string;
    cardBorder?: string;
    textColor?: string;
    hoverBg?: string;
  };
  /** Whether to only apply the glow to the border, leaving the card background unaffected */
  borderGlowOnly?: boolean;
}

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  className,
  glowColor = "#3b82f6",
  // label: "unused hoverEffect removed from sample code"
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex-1 min-w-[14rem] p-6 rounded-[var(--border-radius,1.5rem)] text-slate-900",
        "bg-white/92 border border-slate-200/80 shadow-[0_16px_50px_-24px_rgba(15,23,42,0.28)] backdrop-blur-sm",
        "transition-all duration-400 ease-out",
        className
      )}
      style={{
        '--glow-color': glowColor, // CSS variable definition
      } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlowingCards: React.FC<GlowingCardsProps> = ({
  children,
  className,
  enableGlow = true,
  glowRadius = 25,
  glowOpacity = 1,
  animationDuration = 400,
  // label: "unused enableHover removed from sample code"
  gap = "2.5rem",
  maxWidth = "75rem",
  padding = "3rem 1.5rem",
  backgroundColor,
  borderRadius = "1.5rem",
  responsive = true,
  innerClassName,
  customTheme,
  borderGlowOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (!container || !overlay || !enableGlow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setShowOverlay(true);

      // Using string concatenation for style properties
      overlay.style.setProperty('--x', x + 'px');
      overlay.style.setProperty('--y', y + 'px');
      overlay.style.setProperty('--opacity', glowOpacity.toString());
    };

    const handleMouseLeave = () => {
      setShowOverlay(false);
      overlay.style.setProperty('--opacity', '0');
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enableGlow, glowOpacity]);

  const containerStyle = {
    '--gap': gap,
    '--max-width': maxWidth,
    '--padding': padding,
    '--border-radius': borderRadius,
    '--animation-duration': animationDuration + 'ms', // Concatenation
    '--glow-radius': glowRadius + 'rem', // Concatenation
    '--glow-opacity': glowOpacity,
    backgroundColor: backgroundColor || undefined,
    ...customTheme,
  } as React.CSSProperties;

  return (
    <div
      className={cn("relative w-full", className)}
      style={containerStyle}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative max-w-[var(--max-width)] mx-auto",
        )}
      >
        <div
          className={cn(
            "flex items-stretch flex-wrap gap-[var(--gap)]",
            responsive && "flex-col sm:flex-row",
            innerClassName
          )}
        >
          {children}
        </div>

        {enableGlow && (
          <div
            ref={overlayRef}
            className={cn(
              "absolute inset-0 pointer-events-none select-none z-0",
              "opacity-0 transition-opacity duration-[var(--animation-duration)] ease-out"
            )}
            style={{
              // String concatenation for WebkitMask and mask
              WebkitMask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              mask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              opacity: showOverlay ? 'var(--opacity)' : '0',
            }}
          >
            <div
              className={cn(
                "flex items-stretch flex-wrap gap-[var(--gap)] max-w-[var(--max-width)] mx-auto",
                responsive && "flex-col sm:flex-row",
                innerClassName
              )}
            >
              {React.Children.map(children, (child) => {
                if (React.isValidElement<GlowingCardProps>(child) && child.type === GlowingCard) {
                  const cardGlowColor = child.props.glowColor || "#3b82f6";
                  return React.cloneElement(child, {
                    className: cn(
                      child.props.className,
                      "opacity-100",
                      "bg-transparent",
                      "[&>*]:opacity-0"
                    ),
                    style: {
                      ...child.props.style,
                      // String concatenation for background, border, and boxShadow
                      backgroundColor: borderGlowOnly ? "transparent" : cardGlowColor + "15",
                      borderColor: cardGlowColor,
                      boxShadow: "0 0 0 1px inset " + cardGlowColor,
                    },
                  });
                }
                return child;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { GlowingCards as default };
