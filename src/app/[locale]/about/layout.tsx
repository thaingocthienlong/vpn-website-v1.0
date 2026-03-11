import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About - Southern Institute for Social Resources Development (SISRD)",
    description:
        "Learn about the Southern Institute for Social Resources Development (SISRD) - A leading institution in scientific research, technology transfer, and high-quality human resources development.",
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
