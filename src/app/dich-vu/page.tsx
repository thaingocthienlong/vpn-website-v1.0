"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { ArrowRight, FlaskConical, Cpu, Shield, BarChart3, Award, GraduationCap } from "lucide-react";
import Link from "next/link";

// Services per FEATURES_SPEC SV-01 to SV-06
const services = [
    {
        id: "SV-01",
        slug: "nghien-cuu",
        title: "Nghiên cứu Khoa học",
        excerpt: "Triển khai các đề tài nghiên cứu khoa học, ứng dụng thực tiễn trong nhiều lĩnh vực.",
        icon: FlaskConical,
        color: "from-blue-500 to-blue-600",
        bgColor: "from-blue-50 to-blue-100",
        features: ["Nghiên cứu cơ bản", "Nghiên cứu ứng dụng", "Công bố khoa học"],
    },
    {
        id: "SV-02",
        slug: "chuyen-giao",
        title: "Chuyển giao Công nghệ",
        excerpt: "Chuyển giao các công nghệ tiên tiến, hỗ trợ doanh nghiệp nâng cao năng lực sản xuất.",
        icon: Cpu,
        color: "from-cyan-500 to-cyan-600",
        bgColor: "from-cyan-50 to-cyan-100",
        features: ["Tư vấn công nghệ", "Đào tạo vận hành", "Hỗ trợ triển khai"],
    },
    {
        id: "SV-03",
        slug: "kiem-dinh",
        title: "Kiểm định An toàn",
        excerpt: "Dịch vụ kiểm định thiết bị, máy móc đảm bảo an toàn trong môi trường công nghiệp.",
        icon: Shield,
        color: "from-green-500 to-green-600",
        bgColor: "from-green-50 to-green-100",
        features: ["Kiểm định thiết bị", "Huấn luyện an toàn", "Cấp chứng nhận"],
    },
    {
        id: "SV-04",
        slug: "quan-trac",
        title: "Quan trắc Môi trường",
        excerpt: "Hệ thống quan trắc, đánh giá tác động và báo cáo môi trường theo quy chuẩn.",
        icon: BarChart3,
        color: "from-emerald-500 to-emerald-600",
        bgColor: "from-emerald-50 to-emerald-100",
        features: ["Quan trắc tự động", "Đánh giá tác động", "Lập báo cáo"],
    },
    {
        id: "SV-05",
        slug: "tu-van-iso",
        title: "Tư vấn ISO",
        excerpt: "Tư vấn xây dựng và chứng nhận hệ thống quản lý chất lượng theo tiêu chuẩn ISO.",
        icon: Award,
        color: "from-purple-500 to-purple-600",
        bgColor: "from-purple-50 to-purple-100",
        features: ["Xây dựng hệ thống", "Đào tạo nhân sự", "Hỗ trợ chứng nhận"],
    },
    {
        id: "SV-06",
        slug: "dao-tao",
        title: "Đào tạo & Cấp chứng chỉ",
        excerpt: "Các khóa đào tạo chuyên nghiệp với chứng chỉ được công nhận toàn quốc.",
        icon: GraduationCap,
        color: "from-orange-500 to-orange-600",
        bgColor: "from-orange-50 to-orange-100",
        features: ["Khóa ngắn hạn", "Khóa dài hạn", "Cấp chứng chỉ"],
    },
];

export default function ServicesListingPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-24">
                {/* Hero */}
                <section className="relative py-20 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6 border border-blue-500/30">
                                Dịch vụ của chúng tôi
                            </span>
                            <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800 mb-6">
                                Giải pháp{" "}
                                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    toàn diện
                                </span>
                            </h1>
                            <p className="text-lg text-slate-800 leading-relaxed">
                                Chúng tôi cung cấp đa dạng các dịch vụ nghiên cứu, tư vấn và đào tạo
                                đáp ứng nhu cầu phát triển của doanh nghiệp và tổ chức.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service) => {
                                const Icon = service.icon;
                                return (
                                    <Link
                                        key={service.id}
                                        href={`/dich-vu/${service.slug}`}
                                        className="group"
                                    >
                                        <div className="bg-white shadow-sm rounded-3xl p-8 border border-slate-200 h-full hover:border-slate-200 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all cursor-pointer">
                                            {/* Icon */}
                                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}>
                                                <Icon className="w-8 h-8 text-slate-800" />
                                            </div>

                                            {/* Content */}
                                            <h3 className="text-xl font-heading font-bold text-slate-800 mb-3 group-hover:text-blue-400 transition-colors">
                                                {service.title}
                                            </h3>
                                            <p className="text-slate-800 mb-4 leading-relaxed">
                                                {service.excerpt}
                                            </p>

                                            {/* Features */}
                                            <ul className="space-y-2 mb-6">
                                                {service.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-800">
                                                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${service.color}`} />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* CTA */}
                                            <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:gap-3 transition-all">
                                                Xem chi tiết
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="glass-panel p-12 rounded-2xl border border-slate-200 text-center">
                            <h2 className="text-3xl font-heading font-bold text-slate-800 mb-4">
                                Cần tư vấn dịch vụ?
                            </h2>
                            <p className="text-slate-800 mb-8 max-w-2xl mx-auto">
                                Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn tìm giải pháp phù hợp nhất
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/lien-he">
                                    <Button variant="primary" size="lg">
                                        Liên hệ tư vấn
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/dao-tao">
                                    <Button variant="outline" size="lg" className="border-slate-200 text-slate-800 hover:bg-white">
                                        Xem khóa đào tạo
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
