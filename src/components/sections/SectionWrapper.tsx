import * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/Container";
import { toBgStyle, toTextStyle, type BackdropBlur } from "@/lib/tailwind-colors";

export interface SectionWrapperProps
    extends React.HTMLAttributes<HTMLElement> {
    id?: string;
    /** Tailwind color value: "sky-950", "sky-950/70", "white/80", "transparent" */
    background?: string;
    /** Tailwind color value for text */
    textColor?: string;
    /** Backdrop blur intensity */
    backdropBlur?: BackdropBlur;
    padding?: "sm" | "md" | "lg" | "none";
}

const BLUR_CLASSES: Record<string, string> = {
    none: "",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
    "2xl": "backdrop-blur-2xl",
};

const SectionWrapper: React.FC<SectionWrapperProps> = ({
    id,
    className,
    background = "transparent",
    textColor,
    backdropBlur = "none",
    padding = "md",
    children,
    style,
    ...props
}) => {
    const paddings = {
        none: "",
        sm: "py-16",
        md: "py-24",
        lg: "py-32",
    };

    const bgStyle = toBgStyle(background);
    const txtStyle = textColor ? toTextStyle(textColor) : {};
    const blurClass = BLUR_CLASSES[backdropBlur] || "";

    return (
        <section
            id={id}
            className={cn(blurClass, paddings[padding], className)}
            style={{ ...bgStyle, ...txtStyle, ...style }}
            {...props}
        >
            <Container>{children}</Container>
        </section>
    );
};

SectionWrapper.displayName = "SectionWrapper";

export { SectionWrapper };
