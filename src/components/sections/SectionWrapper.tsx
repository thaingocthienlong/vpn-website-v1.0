import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";

export interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
    id?: string;
    background?: "white" | "gradient-blue" | "gradient-dark";
    padding?: "sm" | "md" | "lg";
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
    id,
    className,
    background = "white",
    padding = "md",
    children,
    ...props
}) => {
    const backgrounds = {
        white: "",
        "gradient-blue":
            "section-shell rounded-[2.6rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(241,247,255,0.88),rgba(223,236,255,0.78))] shadow-[var(--shadow-sm)]",
        "gradient-dark":
            "section-shell overflow-hidden rounded-[2.8rem] border border-white/8 bg-[linear-gradient(160deg,var(--shell),var(--shell-strong))] text-white shadow-[var(--shadow-lg)]",
    } as const;

    const paddings = {
        sm: "py-14 md:py-18",
        md: "py-18 md:py-24",
        lg: "py-24 md:py-32",
    } as const;

    const framePadding =
        background === "white"
            ? ""
            : background === "gradient-dark"
              ? "px-5 py-6 md:px-8 md:py-8"
              : "px-5 py-6 md:px-7 md:py-7";

    return (
        <section id={id} className={cn("relative", paddings[padding], className)} {...props}>
            <Container>
                <div className={cn(backgrounds[background], framePadding)}>
                    {children}
                </div>
            </Container>
        </section>
    );
};

SectionWrapper.displayName = "SectionWrapper";

export { SectionWrapper };
