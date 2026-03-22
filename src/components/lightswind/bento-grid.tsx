import React from "react";
import { cn } from "../../lib/utils";

interface BentoCardData {
  title: string;
  description: string;
  icon: React.ElementType;
  className?: string;
  background?: React.ReactNode;
  href?: string;
  content?: React.ReactNode;
  overlay?: React.ReactNode;
}

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cards: BentoCardData[];
  columns?: number;
  rowHeight?: string;
}

export const BentoGrid = ({
  cards,
  columns = 3,
  rowHeight = "auto",
  className,
  ...props
}: BentoGridProps) => {
  return (
    <div
      className={cn(
        `grid w-full gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`,
        className
      )}
      style={{ gridAutoRows: rowHeight }}
      {...props}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden rounded-2xl p-5 flex flex-col justify-end",
              "h-full min-h-[15rem]",
              "transition-all duration-300 ease-out",
              "border border-black/10 dark:border-white/10",
              "text-black dark:text-white",
              "group",
              card.className
            )}
          >
            {card.background && (
              <div className="absolute inset-0 z-0">{card.background}</div>
            )}

            {/* Hover-revealed content */}
            <div className="relative z-10 w-full h-full flex flex-col justify-end">
              {card.content ? (
                card.content
              ) : (
                <div
                  className={cn(
                    "flex flex-col justify-end h-full",
                    "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0",
                    "transition-all duration-300 ease-out"
                  )}
                >
                  <Icon className="h-5 w-5 text-current mb-2" />
                  <h3 className="text-base font-semibold">{card.title}</h3>
                  <p className="text-sm text-muted-foreground dark:text-white/60">
                    {card.description}
                  </p>
                </div>
              )}
            </div>

            {/* Hover overlay effect — only on simple cards without custom background/content */}
            {!card.background && !card.content && (
              <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-black/5 dark:group-hover:bg-white/5 rounded-2xl" />
            )}

            {/* Card overlay (e.g. BorderBeam) — direct child of card for correct positioning */}
            {card.overlay}
          </div>
        );
      })}
    </div>
  );
};
