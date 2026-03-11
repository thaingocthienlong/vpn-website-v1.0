"use client";

import { Header, Footer } from "@/components/layout";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface Service {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage: string | null;
}

export default function ServicesPage() {
    const t = useTranslations("services");
    const tCommon = useTranslations("common");
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchServices() {
            try {
                const res = await fetch("/api/services?locale=en");
                if (res.ok) {
                    const data = await res.json();
                    setServices(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchServices();
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white rounded-xl h-64 border border-white/5" />
                                ))}
                            </div>
                        ) : services.length === 0 ? (
                            <div className="text-center py-20 text-slate-800">
                                {tCommon("noResults")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {services.map((service) => (
                                    <Link key={service.id} href={`/en/services/${service.slug}`}
                                        className="group bg-white shadow-sm rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 transition-all duration-300 border border-slate-200 hover:border-slate-200">
                                        <div className="relative aspect-video bg-white overflow-hidden">
                                            {service.featuredImage ? (
                                                <Image src={service.featuredImage} alt={service.title} fill sizes="(max-width: 768px) 100vw, 33vw"
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-blue-700 bg-blue-900/40">
                                                    <span className="text-4xl">🔬</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-400 transition-colors">
                                                {service.title}
                                            </h3>
                                            <p className="text-sm text-slate-800 mt-2 line-clamp-3">{service.excerpt}</p>
                                        </div>
                                    </Link>
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
