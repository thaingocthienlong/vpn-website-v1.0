import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";

export interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
    id?: string;
    background?: "white" | "gradient-blue" | "gradient-dark";
    padding?: "sm" | "md" | "lg";
    containerClassName?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({
    id,
    className,
    background = "white",
    padding = "sm",
    containerClassName,
    children,
    ...props
}) => {
    const backgrounds = {
        white: "",
        "gradient-blue": "bg-[linear-gradient(180deg,rgba(245,249,252,0.32),rgba(229,238,245,0.14))]",
        "gradient-dark": "overflow-hidden bg-[linear-gradient(180deg,#163049_0%,#0f2135_100%)] text-[var(--on-dark-heading)]",
    } as const;

    const paddings = {
        sm: "py-10 md:py-14",
        md: "py-14 md:py-20",
        lg: "py-16 md:py-24",
    } as const;

    return (
        <section id={id} className={cn("relative", backgrounds[background], paddings[padding], className)} {...props}>
            <Container className={containerClassName}>
                {children}
            </Container>
        </section>
    );
};

SectionWrapper.displayName = "SectionWrapper";

export { SectionWrapper };
