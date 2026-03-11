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
    email: string | null;
    department: { id: string; name: string; slug: string } | null;
    staffType: { id: string; name: string; level: number; isAdvisory: boolean };
}

export default function OrgStructurePage() {
    const t = useTranslations("about.structure");
    const tCommon = useTranslations("common");
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStaff() {
            try {
                const res = await fetch("/api/staff?locale=en");
                if (res.ok) {
                    const data = await res.json();
                    setStaff(data.data || []);
                }
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStaff();
    }, []);

    // Group by department
    const departments = staff.reduce<Record<string, StaffMember[]>>((acc, member) => {
        const deptName = member.department?.name || "Leadership";
        if (!acc[deptName]) acc[deptName] = [];
        acc[deptName].push(member);
        return acc;
    }, {});

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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white rounded-xl h-48 border border-white/5" />
                                ))}
                            </div>
                        ) : Object.keys(departments).length === 0 ? (
                            <div className="text-center py-20 text-slate-800">
                                {tCommon("updateSoon")}
                            </div>
                        ) : (
                            Object.entries(departments).map(([deptName, members]) => (
                                <div key={deptName} className="mb-12">
                                    <h2 className="text-2xl font-heading font-bold text-slate-800 mb-6 pb-2 border-b-2 border-blue-500/30">
                                        {deptName}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {members.map((member) => (
                                            <div key={member.id} className="bg-white shadow-sm rounded-xl p-6 border border-slate-200 hover:border-slate-200 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {member.avatar ? (
                                                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl text-blue-400 font-bold">{member.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-slate-800">{member.name}</h3>
                                                        {member.title && <p className="text-sm text-blue-400">{member.title}</p>}
                                                        <p className="text-xs text-slate-800">{member.staffType.name}</p>
                                                    </div>
                                                </div>
                                                {member.bio && (
                                                    <p className="text-sm text-slate-800 mt-4 line-clamp-3">{member.bio}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
