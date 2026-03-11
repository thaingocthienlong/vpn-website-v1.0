import { Header, Footer } from "@/components/layout";
import { getTranslations } from "next-intl/server";

interface Partner {
    id: string;
    name: string;
    logo?: { url: string; secureUrl?: string | null } | null;
    website: string | null;
    description: string | null;
}



export default async function PartnersPage() {
    const t = await getTranslations({ locale: 'vi', namespace: "about.partners" });
    const tCommon = await getTranslations({ locale: 'vi', namespace: "common" });

    // We'll import prisma
    const { prisma } = await import('@/lib/prisma');
    const partners = await prisma.partner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { logo: true }
    }).catch(() => []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                <section className="py-16 relative">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-4">
                            {t("title")}
                        </h1>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            {t("description")}
                        </p>
                    </div>
                </section>

                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {partners.length === 0 ? (
                            <div className="text-center py-20 text-slate-800">
                                {tCommon("updateSoon")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {partners.map((partner) => (
                                    <a key={partner.id}
                                        href={partner.website || "#"}
                                        target={partner.website ? "_blank" : undefined}
                                        rel="noopener noreferrer"
                                        className="bg-white shadow-sm rounded-xl p-6 border border-slate-200 hover:border-slate-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4 overflow-hidden">
                                            {partner.logo ? (
                                                <img src={partner.logo.secureUrl || partner.logo.url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <span className="text-3xl">🤝</span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-slate-800 text-sm">{partner.name}</h3>
                                        {partner.description && (
                                            <p className="text-xs text-slate-800 mt-2 line-clamp-2">{partner.description}</p>
                                        )}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
