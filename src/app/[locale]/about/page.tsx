"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { Award, Users, Target, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

// Stats data
const statsIcons = [Users, Award, Target, BookOpen];
const statsValues = ["5,000+", "15+", "100+", "50+"];

// Timeline milestones
const milestones = [
    { year: "2009", titleKey: "Establishment", descKey: "Beginning the journey with a mission to develop human resources" },
    { year: "2012", titleKey: "Expansion", descKey: "Developing research and technology transfer services" },
    { year: "2016", titleKey: "ISO 9001 Certification", descKey: "Achieving international quality management certification" },
    { year: "2020", titleKey: "International Cooperation", descKey: "Expanding partnerships with international organizations" },
    { year: "2024", titleKey: "Digital Transformation", descKey: "Applying new technology in training and research" },
];

export default function AboutPage() {
    const t = useTranslations("about");

    const statsLabels = [
        t("stats.students"),
        t("stats.experience"),
        t("stats.projects"),
        t("stats.courses"),
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-50 rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <span className="inline-flex items-center px-4 py-2 rounded-full glass-badge text-blue-700 text-sm font-medium mb-6">
                                {t("hero.badge")}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-6">
                                {t("hero.title")}{" "}
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                    {t("hero.titleHighlight")}
                                </span>
                            </h1>
                            <p className="text-lg text-slate-800 mb-8 leading-relaxed">
                                {t("hero.description")}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link href="/en/about/vision-mission">
                                    <Button variant="primary" size="lg" className="!bg-blue-600 hover:!bg-blue-700">
                                        {t("visionMission.vision")} <ArrowRight className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <Link href="/en/contact">
                                    <Button variant="outline" size="lg" className="border-slate-200 text-slate-800 hover:bg-white glass-button">
                                        {t("cta.button")}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {statsIcons.map((Icon, index) => (
                                <div key={index} className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 border border-slate-200 hover:border-slate-200">
                                    <Icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                    <div className="text-3xl font-bold text-slate-800">{statsValues[index]}</div>
                                    <div className="text-slate-600 mt-1">{statsLabels[index]}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Timeline Section */}
                <section className="py-20 relative">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-800 mb-4">
                                {t("timeline.title")}
                            </h2>
                            <p className="text-slate-800 max-w-2xl mx-auto">
                                {t("timeline.description")}
                            </p>
                        </div>
                        <div className="max-w-3xl mx-auto">
                            {milestones.map((milestone, index) => (
                                <div key={index} className="flex gap-6 mb-8 last:mb-0">
                                    <div className="flex-shrink-0 w-20 text-right">
                                        <span className="text-xl font-bold text-blue-400">{milestone.year}</span>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-900/30 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                        {index < milestones.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-white mt-2" />
                                        )}
                                    </div>
                                    <div className="pb-8">
                                        <h3 className="font-semibold text-slate-800 text-lg">{milestone.titleKey}</h3>
                                        <p className="text-slate-800 mt-1">{milestone.descKey}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 text-slate-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/img/grid.svg')] bg-center opacity-10" />
                    <div className="container mx-auto px-4 text-center relative z-10 glass-panel p-12 rounded-2xl border border-slate-200 max-w-4xl">
                        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                            {t("cta.title")}
                        </h2>
                        <p className="text-slate-700 max-w-2xl mx-auto mb-8 text-lg">
                            {t("cta.description")}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/en/contact">
                                <Button variant="primary" size="lg" className="!bg-white !text-[#0D2B6B] hover:!bg-blue-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    {t("cta.button")} <ArrowRight className="ml-2 w-4 h-4" />
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
