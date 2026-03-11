import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";

export interface SectionWrapperProps
    extends React.HTMLAttributes<HTMLElement> {
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
        white: "bg-transparent",
        "gradient-blue": "bg-transparent",
        "gradient-dark": "bg-transparent",
    };

    const paddings = {
        sm: "py-16",
        md: "py-24",
        lg: "py-32",
    };

    return (
        <section
            id={id}
            className={cn(backgrounds[background], paddings[padding], className)}
            {...props}
        >
            <Container>{children}</Container>
        </section>
    );
};

SectionWrapper.displayName = "SectionWrapper";

export { SectionWrapper };
