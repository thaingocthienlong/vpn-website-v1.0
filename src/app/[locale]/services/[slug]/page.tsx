"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, CheckCircle2, Phone, FlaskConical, Cpu, Shield, BarChart3, Award, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

// EN Service data - translated from VI
const servicesData = {
    "nghien-cuu": {
        id: "SV-01",
        slug: "nghien-cuu",
        title: "Scientific Research",
        description: "The Institute conducts applied scientific research projects, contributing to solving practical problems in many fields such as environment, technology, and society.",
        icon: FlaskConical,
        color: "from-blue-500 to-blue-600",
        sections: [
            {
                title: "Research Areas",
                items: [
                    "Environmental research and sustainable development",
                    "Technology research and digital transformation",
                    "Social research and human resources development",
                    "Occupational safety and health research",
                ],
            },
            {
                title: "Research Capabilities",
                items: [
                    "Team of 50+ leading experts and PhDs",
                    "Internationally certified laboratories",
                    "Collaboration with domestic and international research institutes",
                    "100+ completed research projects",
                ],
            },
        ],
        process: [
            { step: 1, title: "Receive Request", desc: "Assess needs and define the scope of research" },
            { step: 2, title: "Develop Proposal", desc: "Plan methodology and resources" },
            { step: 3, title: "Conduct Research", desc: "Collect data, analyze and experiment" },
            { step: 4, title: "Report Results", desc: "Synthesize, evaluate and propose applications" },
        ],
    },
    "chuyen-giao": {
        id: "SV-02",
        slug: "chuyen-giao",
        title: "Technology Transfer",
        description: "Advanced technology transfer services, helping businesses enhance production capacity, optimize processes, and achieve sustainable development.",
        icon: Cpu,
        color: "from-cyan-500 to-cyan-600",
        sections: [
            {
                title: "Technologies Transferred",
                items: [
                    "Clean production and energy-saving technologies",
                    "Smart management systems (IoT, AI)",
                    "Environmental treatment technologies",
                    "Production process automation",
                ],
            },
            {
                title: "Accompanying Services",
                items: [
                    "Technology selection consulting",
                    "Operation and maintenance training",
                    "Post-transfer technical support",
                    "Application effectiveness assessment",
                ],
            },
        ],
        process: [
            { step: 1, title: "Needs Assessment", desc: "Evaluate current status and identify solutions" },
            { step: 2, title: "Technology Proposal", desc: "Recommend optimal technology solutions" },
            { step: 3, title: "Implementation", desc: "Install, test run and adjust" },
            { step: 4, title: "Handover & Support", desc: "Training and technical support" },
        ],
    },
    "kiem-dinh": {
        id: "SV-03",
        slug: "kiem-dinh",
        title: "Safety Inspection",
        description: "Equipment and machinery inspection services ensuring safety in industrial environments according to Vietnamese and international standards.",
        icon: Shield,
        color: "from-green-500 to-green-600",
        sections: [
            {
                title: "Inspection Objects",
                items: [
                    "Lifting equipment: bridge cranes, gantry cranes, forklifts",
                    "Pressure equipment: boilers, pressure vessels",
                    "Electrical equipment: switchboards, grounding systems",
                    "Fire protection and fighting systems",
                ],
            },
            {
                title: "Certifications Issued",
                items: [
                    "Technical safety inspection certificate",
                    "Detailed inspection report",
                    "Remediation recommendations (if any)",
                    "Equipment circulation documents",
                ],
            },
        ],
        process: [
            { step: 1, title: "Register Inspection", desc: "Receive and schedule inspection" },
            { step: 2, title: "On-site Inspection", desc: "Direct equipment assessment" },
            { step: 3, title: "Testing", desc: "Conduct tests according to standards" },
            { step: 4, title: "Certification", desc: "Prepare report and issue inspection certificate" },
        ],
    },
    "quan-trac": {
        id: "SV-04",
        slug: "quan-trac",
        title: "Environmental Monitoring",
        description: "Monitoring systems, impact assessment and environmental reporting to meet legal requirements and sustainable development goals.",
        icon: BarChart3,
        color: "from-emerald-500 to-emerald-600",
        sections: [
            {
                title: "Monitoring Services",
                items: [
                    "Air quality monitoring",
                    "Surface water, groundwater, and wastewater monitoring",
                    "Soil and solid waste monitoring",
                    "Noise and vibration monitoring",
                ],
            },
            {
                title: "Environmental Reports",
                items: [
                    "Environmental Impact Assessment (EIA)",
                    "Environmental Protection Plan",
                    "Periodic monitoring reports",
                    "Discharge proposals",
                ],
            },
        ],
        process: [
            { step: 1, title: "Survey", desc: "Assess current status and identify monitoring points" },
            { step: 2, title: "Sampling", desc: "Collect samples following standard procedures" },
            { step: 3, title: "Analysis", desc: "Analyze at the laboratory" },
            { step: 4, title: "Reporting", desc: "Prepare reports and recommendations" },
        ],
    },
    "tu-van-iso": {
        id: "SV-05",
        slug: "tu-van-iso",
        title: "ISO Consulting",
        description: "Consulting on building and certifying quality management systems according to internationally recognized ISO standards.",
        icon: Award,
        color: "from-purple-500 to-purple-600",
        sections: [
            {
                title: "Standards Consulted",
                items: [
                    "ISO 9001 - Quality Management",
                    "ISO 14001 - Environmental Management",
                    "ISO 45001 - Occupational Health and Safety",
                    "ISO 27001 - Information Security",
                ],
            },
            {
                title: "Accompanying Services",
                items: [
                    "Current system status assessment",
                    "Process documentation development",
                    "Awareness and internal audit training",
                    "Certification audit support",
                ],
            },
        ],
        process: [
            { step: 1, title: "Gap Analysis", desc: "Analyze gap between current status and requirements" },
            { step: 2, title: "System Setup", desc: "Develop policies and procedures" },
            { step: 3, title: "Implementation & Training", desc: "Apply and train personnel" },
            { step: 4, title: "Audit & Certification", desc: "Internal audit and certification support" },
        ],
    },
    "dao-tao": {
        id: "SV-06",
        slug: "dao-tao",
        title: "Training & Certification",
        description: "Professional training courses with nationally recognized certificates, meeting career development needs.",
        icon: GraduationCap,
        color: "from-orange-500 to-orange-600",
        sections: [
            {
                title: "Course Categories",
                items: [
                    "Occupational safety and health",
                    "Quality management (ISO, Lean, Six Sigma)",
                    "Soft skills and management",
                    "Digital transformation and technology",
                ],
            },
            {
                title: "Training Formats",
                items: [
                    "Training at the Institute",
                    "In-house corporate training",
                    "Online training (E-learning)",
                    "Blended learning (Online + Offline)",
                ],
            },
        ],
        process: [
            { step: 1, title: "Register", desc: "Choose a course and register to participate" },
            { step: 2, title: "Study", desc: "Attend classes with instructors" },
            { step: 3, title: "Assessment", desc: "Competency evaluation tests" },
            { step: 4, title: "Certification", desc: "Receive completion certificate" },
        ],
    },
};

const allServices = Object.values(servicesData);

export default function ServiceDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const service = servicesData[slug as keyof typeof servicesData];
    const t = useTranslations("services");

    if (!service) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-24 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-800 mb-4">{t("notFound")}</h1>
                        <Link href="/en/services">
                            <Button>{t("viewAll")}</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const Icon = service.icon;
    const otherServices = allServices.filter(s => s.slug !== slug);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="relative py-24">
                    <div className="container mx-auto px-4 relative z-10">
                        <Link
                            href="/en/services"
                            className="inline-flex items-center gap-2 text-slate-800 hover:text-slate-800 mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t("allServices")}
                        </Link>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 rounded-2xl bg-white  flex items-center justify-center">
                                <Icon className="w-10 h-10 text-slate-800" />
                            </div>
                            <div>
                                <span className="text-slate-800 text-sm">{service.id}</span>
                                <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800">
                                    {service.title}
                                </h1>
                            </div>
                        </div>

                        <p className="text-xl text-slate-800 max-w-3xl leading-relaxed">
                            {service.description}
                        </p>
                    </div>
                </section>

                {/* Content Sections */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12">
                            {service.sections.map((section, idx) => (
                                <div key={idx}>
                                    <h2 className="text-2xl font-heading font-bold text-slate-800 mb-6">
                                        {section.title}
                                    </h2>
                                    <ul className="space-y-4">
                                        {section.items.map((item, itemIdx) => (
                                            <li key={itemIdx} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5 text-blue-400" />
                                                <span className="text-slate-800">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Process */}
                <section className="py-16 border-t border-slate-200 relative before:content-[''] before:absolute before:inset-0 before:bg-blue-900/10 before:-z-10">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-heading font-bold text-slate-800 mb-8 text-center">
                            {t("workingProcess")}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {service.process.map((step, idx) => (
                                <div key={idx} className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200 hover:border-slate-200 transition-all group">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                        {step.step}
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                                    <p className="text-slate-600 text-sm">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 relative border-y border-slate-200">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-heading font-bold text-slate-800 mb-4">
                                {t("contactConsultation")}
                            </h2>
                            <p className="text-slate-800 mb-8">
                                {t("ourTeam")}
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/en/contact">
                                    <Button variant="secondary" size="lg">
                                        {t("sendInquiry")}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <a href="tel:19001234">
                                    <Button variant="ghost" size="lg" className="border-2 border-white !text-slate-800 !bg-transparent hover:!bg-white">
                                        <Phone className="w-4 h-4 mr-2" />
                                        Hotline: 1900 1234
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Other Services */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-heading font-bold text-slate-800 mb-8">
                            {t("otherServices")}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherServices.slice(0, 3).map((s) => {
                                const SIcon = s.icon;
                                return (
                                    <Link key={s.slug} href={`/en/services/${s.slug}`} className="group">
                                        <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200 hover:border-slate-200 hover:shadow-lg hover:shadow-blue-900/20 transition-all cursor-pointer">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                                                <SIcon className="w-6 h-6 text-slate-800" />
                                            </div>
                                            <h3 className="font-semibold text-slate-800 group-hover:text-blue-400 transition-colors mb-2">
                                                {s.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm line-clamp-2">{s.description}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
