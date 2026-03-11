"use client";

import { useParams, notFound } from "next/navigation";

const VALID_LOCALES = ["vi", "en"];

export default function AdminLocaleLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const locale = params.locale as string;

    if (!VALID_LOCALES.includes(locale)) {
        notFound();
    }

    return <>{children}</>;
}
