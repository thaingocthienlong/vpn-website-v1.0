"use client";

import { Header, Footer } from "@/components/layout";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface StaffMember {
    id: string;
    name: string;
    title: string | null;
    bio: string | null;
    avatar: string | null;
    staffType: { id: string; name: string; level: number; isAdvisory: boolean };
}

export default function AdvisoryBoardPage() {
    const t = useTranslations("about.advisory");
    const tCommon = useTranslations("common");
    const [advisors, setAdvisors] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAdvisors() {
            try {
                const res = await fetch("/api/staff?advisory=true&locale=en");
                if (res.ok) {
                    const data = await res.json();
                    setAdvisors(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching advisors:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAdvisors();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                <section className="py-16 relative">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-4">
                            {t("title")}
                        </h1>
                        <p className="text-slate-800 max-w-2xl mx-auto">
                            {t("description")}
                        </p>
                    </div>
                </section>

                <section className="py-12">
                    <div className="container mx-auto px-4">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white rounded-xl h-48 border border-white/5" />
                                ))}
                            </div>
                        ) : advisors.length === 0 ? (
                            <div className="text-center py-20 text-slate-800">
                                {tCommon("updateSoon")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                {advisors.map((advisor) => (
                                    <div key={advisor.id} className="bg-white shadow-sm rounded-xl p-8 border border-slate-200 hover:border-slate-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
                                        <div className="flex items-start gap-5">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {advisor.avatar ? (
                                                    <img src={advisor.avatar} alt={advisor.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl text-blue-400 font-bold">{advisor.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">{advisor.name}</h3>
                                                {advisor.title && <p className="text-blue-400 font-medium">{advisor.title}</p>}
                                                <p className="text-sm text-slate-800">{advisor.staffType.name}</p>
                                            </div>
                                        </div>
                                        {advisor.bio && (
                                            <p className="text-slate-800 mt-4 leading-relaxed">{advisor.bio}</p>
                                        )}
                                    </div>
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
