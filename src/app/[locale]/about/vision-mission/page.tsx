"use client";

import { Header, Footer } from "@/components/layout";
import { Target, Eye, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

export default function VisionMissionPage() {
    const t = useTranslations("about.visionMission");

    const coreValues = [
        { icon: Star, title: t("integrity"), description: t("integrityDesc") },
        { icon: Target, title: t("quality"), description: t("qualityDesc") },
        { icon: Eye, title: t("innovation"), description: t("innovationDesc") },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                <section className="py-20 relative">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-8">
                                {t("title")}
                            </h1>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mt-16">
                            <div className="bg-white shadow-sm rounded-2xl p-8 border border-slate-200">
                                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center mb-6">
                                    <Eye className="w-7 h-7 text-blue-400" />
                                </div>
                                <h2 className="text-2xl font-heading font-bold text-slate-800 mb-4">{t("vision")}</h2>
                                <p className="text-slate-600 leading-relaxed">{t("visionText")}</p>
                            </div>
                            <div className="bg-white shadow-sm rounded-2xl p-8 border border-slate-200">
                                <div className="w-14 h-14 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6">
                                    <Target className="w-7 h-7 text-cyan-400" />
                                </div>
                                <h2 className="text-2xl font-heading font-bold text-slate-800 mb-4">{t("mission")}</h2>
                                <p className="text-slate-600 leading-relaxed">{t("missionText")}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-heading font-bold text-slate-800 text-center mb-12">{t("coreValues")}</h2>
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {coreValues.map((value, i) => (
                                <div key={i} className="text-center p-8 rounded-2xl bg-white shadow-sm border border-slate-200 hover:border-slate-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
                                    <value.icon className="w-10 h-10 text-blue-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-800 mb-3">{value.title}</h3>
                                    <p className="text-slate-800">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-16 text-slate-800">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl font-heading font-bold mb-4">{t("learnMore")}</h2>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link href="/en/about/structure">
                                <Button variant="outline" className="border-white text-slate-800 hover:bg-white">
                                    Organizational Structure <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <Link href="/en/about/advisory-board">
                                <Button variant="outline" className="border-white text-slate-800 hover:bg-white">
                                    Advisory Board <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
