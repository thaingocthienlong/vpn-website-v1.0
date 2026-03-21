import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getActiveServices } from "@/lib/services/api-services";
import Image from "next/image";

// Gradient colors for service cards (cycled through)
const CARD_COLORS = [
    "from-blue-500 to-blue-600",
    "from-cyan-500 to-cyan-600",
    "from-green-500 to-green-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-teal-500 to-teal-600",
    "from-indigo-500 to-indigo-600",
    "from-rose-500 to-rose-600",
];

export const revalidate = 3600; // ISR: revalidate every hour

export default async function ServicesListingPage() {
    const services = await getActiveServices();

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
                                <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
                            {services.map((service, idx) => {
                                const color = CARD_COLORS[idx % CARD_COLORS.length];
                                return (
                                    <Link
                                        key={service.id}
                                        href={`/dich-vu/${service.slug}`}
                                        className="group"
                                    >
                                        <div className="bg-white shadow-sm rounded-3xl p-8 border border-slate-200 h-full hover:border-slate-200 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all cursor-pointer">
                                            {/* Thumbnail or gradient fallback */}
                                            {service.thumbnailUrl ? (
                                                <div className="w-full h-40 rounded-2xl overflow-hidden mb-6 relative">
                                                    <Image
                                                        src={service.thumbnailUrl}
                                                        alt={service.title}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 33vw"
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center mb-6`}>
                                                    <span className="text-white font-bold text-xl">
                                                        {service.title.charAt(0)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <h3 className="text-xl font-heading font-bold text-slate-800 mb-3 group-hover:text-blue-400 transition-colors">
                                                {service.title}
                                            </h3>
                                            {service.excerpt && (
                                                <p className="text-slate-600 mb-6 leading-relaxed line-clamp-3">
                                                    {service.excerpt}
                                                </p>
                                            )}

                                            {/* CTA */}
                                            <div className="flex items-center gap-2 text-blue-400 font-medium group-hover:gap-3 transition-all mt-auto">
                                                Xem chi tiết
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {services.length === 0 && (
                            <p className="text-center text-slate-500 py-20">
                                Chưa có dịch vụ nào. Vui lòng chạy migration để tải dữ liệu.
                            </p>
                        )}
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
