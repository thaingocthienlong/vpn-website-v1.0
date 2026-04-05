import Link from "next/link";
import { Globe2, Home, Palette, Settings2 } from "lucide-react";

const siteCards = [
    {
        title: "Homepage",
        description: "Manage the sections the public homepage renderer actually uses.",
        href: "/admin/site/homepage",
        icon: Home,
    },
    {
        title: "Navigation",
        description: "Update header, footer, and menu items from the unified site shell workspace.",
        href: "/admin/site/navigation",
        icon: Globe2,
    },
    {
        title: "Global Settings",
        description: "Control shared brand, contact, social, and SEO defaults for the site.",
        href: "/admin/site/settings",
        icon: Settings2,
    },
    {
        title: "Appearance",
        description: "Manage semantic tokens, presets, and target assignments for the public site.",
        href: "/admin/site/appearance",
        icon: Palette,
    },
];

export default function AdminSiteHubPage() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-slate-800">Site Admin</h1>
                <p className="text-sm text-slate-500">
                    This is the new home for homepage sections, navigation, header and footer, plus the shared site-wide settings.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {siteCards.map((card) => (
                    <Link
                        key={card.href}
                        href={card.href}
                        className="group rounded-[1.4rem] border border-[rgba(26,72,164,0.12)] bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(220,233,255,0.62)] text-[var(--accent-strong)]">
                            <card.icon className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-800">{card.title}</h2>
                        <p className="mt-2 text-sm text-slate-500">{card.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
