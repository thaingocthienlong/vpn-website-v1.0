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
        sm: "max-w-screen-sm",    // 640px
        md: "max-w-screen-md",    // 768px
        lg: "max-w-screen-lg",    // 1024px
        xl: "max-w-7xl",          // 1280px (default)
        full: "max-w-full",
    };

    return (
        <div
            className={cn("mx-auto px-6", sizes[size], className)}
            {...props}
        >
            {children}
        </div>
    );
};

Container.displayName = "Container";

export { Container };
