"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface DynamicNavigationProps {
  /** Navigation links */
  links: {
    id: string;
    label: string;
    href: string;
    icon?: React.ReactNode;
    children?: {
      id: string;
      label: string;
      href: string;
      icon?: React.ReactNode;
    }[];
  }[];
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Highlight color */
  highlightColor?: string;

  /** CSS class name */
  className?: string;
  /** Whether to show labels on mobile */
  showLabelsOnMobile?: boolean;
  /** Callback when a link is clicked */
  onLinkClick?: (id: string) => void;
  /** Initially active link ID */
  activeLink?: string;
  /** Enable ripple effect on click */
  enableRipple?: boolean;
}

export const DynamicNavigation = ({
  links,
  backgroundColor,
  textColor,
  highlightColor,
  className,
  showLabelsOnMobile = false,
  onLinkClick,
  activeLink,
  enableRipple = true,
}: DynamicNavigationProps) => {
  const navRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(
    activeLink || (links.length > 0 ? links[0].id : null)
  );
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const currentActive = activeLink ?? active;

  // Directly define the default styles representing a light theme fallback
  const defaultThemeStyles = {
    bg: backgroundColor === "transparent" ? "" : backgroundColor || "bg-white",
    border: backgroundColor === "transparent" ? "" : "border-zinc-200/50",
    text: textColor || "text-slate-800",
    highlight: highlightColor || "bg-slate-900/10",
    glow: "", // Let's remove this white glow since the menu sits on a light background.
  };

  // Update highlight position based on active link
  const updateHighlightPosition = useCallback((id?: string) => {
    if (!navRef.current || !highlightRef.current) return;

    const linkElement = navRef.current.querySelector(
      `#nav-item-${id || active}`
    );
    if (!linkElement) return;

    const { left, width } = linkElement.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();

    highlightRef.current.style.transform = `translateX(${left - navRect.left
      }px)`;
    highlightRef.current.style.width = `${width}px`;
  }, [active]);

  // Create ripple effect
  const createRipple = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!enableRipple) return;

    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - diameter / 2
      }px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - diameter / 2
      }px`;
    circle.classList.add(
      "absolute",
      "bg-white",
      "rounded-full",
      "pointer-events-none",
      "opacity-30",
      "animate-ripple"
    );

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  // Handle link click
  const handleLinkClick = (
    id: string,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (enableRipple) {
      createRipple(event);
    }
    setActive(id);
    if (onLinkClick) {
      onLinkClick(id);
    }
  };

  // Handle link hover
  const handleLinkHover = (id: string) => {
    if (!navRef.current || !highlightRef.current) return;
    updateHighlightPosition(id);
  };

  // Set initial highlight position and update on window resize
  useEffect(() => {
    updateHighlightPosition();

    const handleResize = () => {
      updateHighlightPosition();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentActive, links, updateHighlightPosition]);

  return (
    <nav
      ref={navRef}
      className={cn(
        `relative rounded-full transition-all duration-300`,
        defaultThemeStyles.bg,
        defaultThemeStyles.border,
        defaultThemeStyles.glow,
        className
      )}
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
      }}
      onMouseLeave={() => setHoveredLink(null)}
    >
      {/* Background highlight */}
      <div
        ref={highlightRef}
        className={cn(
          `absolute top-0 left-0 h-full rounded-full transition-all 
          duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-0`,
          defaultThemeStyles.highlight
        )}
        style={{
          backgroundColor: highlightColor,
        }}
      ></div>

      <ul className="flex justify-between items-center gap-4 py-2 relative z-10">
        {links.map((link) => (
          <li
            key={link.id}
            className="flex-1 rounded-full mx-1 lg:mx-2 px-4 relative"
            id={`nav-item-${link.id}`}
            onMouseEnter={() => {
              handleLinkHover(link.id);
              setHoveredLink(link.id);
            }}
          >
            <a
              href={link.href}
              className={cn(
                `flex gap-1 items-center justify-center h-8 md:h-8 text-xs md:text-sm 
                rounded-full font-medium transition-all duration-300 hover:scale-105 
                relative overflow-hidden`,
                defaultThemeStyles.text,
                currentActive === link.id && "font-semibold"
              )}
              onClick={(e) => {
                handleLinkClick(link.id, e);
              }}
            >
              {link.icon && (
                <span className="text-current text-xs">
                  {link.icon}
                </span>
              )}
              <span
                className={cn(showLabelsOnMobile ? "flex" : "hidden sm:flex", "items-center gap-1 whitespace-nowrap")}
              >
                {link.label}
                {link.children && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform ml-1", hoveredLink === link.id ? "rotate-180" : "rotate-0")}><path d="m6 9 6 6 6-6" /></svg>
                )}
              </span>
            </a>

            {/* Dropdown Menu */}
            {link.children && link.children.length > 0 && hoveredLink === link.id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 min-w-[220px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className={cn(
                  "p-2 rounded-2xl flex flex-col gap-1",
                  "bg-[#f1f1f1] backdrop-blur-2xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-slate-800"
                )}>
                  {link.children.map((child) => (
                    <a
                      key={child.id}
                      href={child.href}
                      className={cn(
                        "px-4 py-2 text-sm rounded-xl transition-colors hover:bg-blue-50 flex items-center gap-2",
                        defaultThemeStyles.text
                      )}
                    >
                      {child.icon && <span>{child.icon}</span>}
                      {child.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <style
        dangerouslySetInnerHTML={{
          __html: `        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s linear;
        }
`,
        }}
      />
    </nav>
  );
};

export default DynamicNavigation;
