import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

const Container: React.FC<ContainerProps> = ({
    className,
    size = "xl",
    children,
    ...props
}) => {
    const sizes = {
        sm: "max-w-3xl",
        md: "max-w-5xl",
        lg: "max-w-6xl",
        xl: "max-w-[1400px]",
        full: "max-w-full",
    };

    return (
        <div
            className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizes[size], className)}
            {...props}
        >
            {children}
        </div>
    );
};

Container.displayName = "Container";

export { Container };
