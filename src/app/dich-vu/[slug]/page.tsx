"use client";

import { Header, Footer } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ArrowLeft, CheckCircle2, Phone, FlaskConical, Cpu, Shield, BarChart3, Award, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Service data per FEATURES_SPEC
const servicesData = {
    "nghien-cuu": {
        id: "SV-01",
        slug: "nghien-cuu",
        title: "Nghiên cứu Khoa học",
        description: "Viện triển khai các đề tài nghiên cứu khoa học ứng dụng, góp phần giải quyết các vấn đề thực tiễn trong nhiều lĩnh vực như môi trường, công nghệ, xã hội.",
        icon: FlaskConical,
        color: "from-blue-500 to-blue-600",
        heroImage: "/images/research-hero.jpg",
        sections: [
            {
                title: "Lĩnh vực nghiên cứu",
                items: [
                    "Nghiên cứu môi trường và phát triển bền vững",
                    "Nghiên cứu công nghệ và chuyển đổi số",
                    "Nghiên cứu xã hội và phát triển nguồn nhân lực",
                    "Nghiên cứu an toàn lao động và sức khỏe nghề nghiệp",
                ],
            },
            {
                title: "Năng lực nghiên cứu",
                items: [
                    "Đội ngũ 50+ chuyên gia, tiến sĩ đầu ngành",
                    "Phòng thí nghiệm đạt tiêu chuẩn quốc tế",
                    "Hợp tác với các viện nghiên cứu trong và ngoài nước",
                    "100+ đề tài nghiên cứu đã hoàn thành",
                ],
            },
        ],
        process: [
            { step: 1, title: "Tiếp nhận yêu cầu", desc: "Đánh giá nhu cầu và xác định phạm vi nghiên cứu" },
            { step: 2, title: "Xây dựng đề án", desc: "Lập kế hoạch, phương pháp và nguồn lực" },
            { step: 3, title: "Triển khai nghiên cứu", desc: "Thu thập dữ liệu, phân tích và thử nghiệm" },
            { step: 4, title: "Báo cáo kết quả", desc: "Tổng hợp, đánh giá và đề xuất ứng dụng" },
        ],
    },
    "chuyen-giao": {
        id: "SV-02",
        slug: "chuyen-giao",
        title: "Chuyển giao Công nghệ",
        description: "Dịch vụ chuyển giao công nghệ tiên tiến, hỗ trợ doanh nghiệp nâng cao năng lực sản xuất, tối ưu quy trình và phát triển bền vững.",
        icon: Cpu,
        color: "from-cyan-500 to-cyan-600",
        heroImage: "/images/tech-transfer-hero.jpg",
        sections: [
            {
                title: "Công nghệ chuyển giao",
                items: [
                    "Công nghệ sản xuất sạch và tiết kiệm năng lượng",
                    "Hệ thống quản lý thông minh (IoT, AI)",
                    "Công nghệ xử lý môi trường",
                    "Tự động hóa quy trình sản xuất",
                ],
            },
            {
                title: "Dịch vụ đi kèm",
                items: [
                    "Tư vấn lựa chọn công nghệ phù hợp",
                    "Đào tạo vận hành và bảo trì",
                    "Hỗ trợ kỹ thuật sau chuyển giao",
                    "Đánh giá hiệu quả ứng dụng",
                ],
            },
        ],
        process: [
            { step: 1, title: "Khảo sát nhu cầu", desc: "Đánh giá hiện trạng và xác định giải pháp" },
            { step: 2, title: "Đề xuất công nghệ", desc: "Tư vấn lựa chọn công nghệ tối ưu" },
            { step: 3, title: "Triển khai", desc: "Lắp đặt, vận hành thử và điều chỉnh" },
            { step: 4, title: "Bàn giao & Hỗ trợ", desc: "Đào tạo và hỗ trợ kỹ thuật" },
        ],
    },
    "kiem-dinh": {
        id: "SV-03",
        slug: "kiem-dinh",
        title: "Kiểm định An toàn",
        description: "Dịch vụ kiểm định thiết bị, máy móc đảm bảo an toàn trong môi trường công nghiệp theo quy chuẩn Việt Nam và quốc tế.",
        icon: Shield,
        color: "from-green-500 to-green-600",
        heroImage: "/images/safety-hero.jpg",
        sections: [
            {
                title: "Đối tượng kiểm định",
                items: [
                    "Thiết bị nâng: cầu trục, cổng trục, xe nâng",
                    "Thiết bị áp lực: nồi hơi, bình chịu áp",
                    "Thiết bị điện: tủ điện, hệ thống tiếp địa",
                    "Hệ thống phòng cháy chữa cháy",
                ],
            },
            {
                title: "Chứng nhận cấp",
                items: [
                    "Giấy chứng nhận kiểm định kỹ thuật an toàn",
                    "Biên bản kiểm định chi tiết",
                    "Khuyến cáo khắc phục (nếu có)",
                    "Hồ sơ lưu hành thiết bị",
                ],
            },
        ],
        process: [
            { step: 1, title: "Đăng ký kiểm định", desc: "Tiếp nhận và lên lịch kiểm định" },
            { step: 2, title: "Kiểm tra hiện trường", desc: "Đánh giá trực tiếp thiết bị" },
            { step: 3, title: "Thử nghiệm", desc: "Tiến hành các phép thử theo quy chuẩn" },
            { step: 4, title: "Cấp chứng nhận", desc: "Lập biên bản và cấp giấy kiểm định" },
        ],
    },
    "quan-trac": {
        id: "SV-04",
        slug: "quan-trac",
        title: "Quan trắc Môi trường",
        description: "Hệ thống quan trắc, đánh giá tác động và lập báo cáo môi trường đáp ứng yêu cầu pháp lý và phát triển bền vững.",
        icon: BarChart3,
        color: "from-emerald-500 to-emerald-600",
        heroImage: "/images/monitoring-hero.jpg",
        sections: [
            {
                title: "Dịch vụ quan trắc",
                items: [
                    "Quan trắc chất lượng không khí",
                    "Quan trắc nước mặt, nước ngầm, nước thải",
                    "Quan trắc đất và chất thải rắn",
                    "Quan trắc tiếng ồn và rung động",
                ],
            },
            {
                title: "Báo cáo môi trường",
                items: [
                    "Đánh giá tác động môi trường (ĐTM)",
                    "Kế hoạch bảo vệ môi trường",
                    "Báo cáo quan trắc định kỳ",
                    "Đề án xả thải",
                ],
            },
        ],
        process: [
            { step: 1, title: "Khảo sát", desc: "Đánh giá hiện trạng và xác định điểm quan trắc" },
            { step: 2, title: "Lấy mẫu", desc: "Thu thập mẫu theo quy trình chuẩn" },
            { step: 3, title: "Phân tích", desc: "Phân tích tại phòng thí nghiệm" },
            { step: 4, title: "Báo cáo", desc: "Lập báo cáo và khuyến nghị" },
        ],
    },
    "tu-van-iso": {
        id: "SV-05",
        slug: "tu-van-iso",
        title: "Tư vấn ISO",
        description: "Tư vấn xây dựng và chứng nhận hệ thống quản lý chất lượng theo các tiêu chuẩn ISO uy tín quốc tế.",
        icon: Award,
        color: "from-purple-500 to-purple-600",
        heroImage: "/images/iso-hero.jpg",
        sections: [
            {
                title: "Tiêu chuẩn tư vấn",
                items: [
                    "ISO 9001 - Quản lý chất lượng",
                    "ISO 14001 - Quản lý môi trường",
                    "ISO 45001 - An toàn sức khỏe nghề nghiệp",
                    "ISO 27001 - An ninh thông tin",
                ],
            },
            {
                title: "Dịch vụ đi kèm",
                items: [
                    "Đánh giá hiện trạng hệ thống",
                    "Xây dựng tài liệu quy trình",
                    "Đào tạo nhận thức và đánh giá nội bộ",
                    "Hỗ trợ đánh giá chứng nhận",
                ],
            },
        ],
        process: [
            { step: 1, title: "Đánh giá Gap", desc: "Phân tích khoảng cách hiện trạng - yêu cầu" },
            { step: 2, title: "Thiết lập hệ thống", desc: "Xây dựng chính sách, quy trình" },
            { step: 3, title: "Triển khai & Đào tạo", desc: "Áp dụng và đào tạo nhân sự" },
            { step: 4, title: "Đánh giá & Chứng nhận", desc: "Đánh giá nội bộ và hỗ trợ chứng nhận" },
        ],
    },
    "dao-tao": {
        id: "SV-06",
        slug: "dao-tao",
        title: "Đào tạo & Cấp chứng chỉ",
        description: "Các khóa đào tạo chuyên nghiệp với chứng chỉ được công nhận toàn quốc, đáp ứng nhu cầu phát triển nghề nghiệp.",
        icon: GraduationCap,
        color: "from-orange-500 to-orange-600",
        heroImage: "/images/training-hero.jpg",
        sections: [
            {
                title: "Nhóm khóa học",
                items: [
                    "An toàn lao động, vệ sinh lao động",
                    "Quản lý chất lượng (ISO, Lean, 6 Sigma)",
                    "Kỹ năng mềm và quản lý",
                    "Chuyển đổi số và công nghệ",
                ],
            },
            {
                title: "Hình thức đào tạo",
                items: [
                    "Đào tạo tại Viện",
                    "Đào tạo tại doanh nghiệp (In-house)",
                    "Đào tạo trực tuyến (E-learning)",
                    "Kết hợp trực tiếp và trực tuyến (Blended)",
                ],
            },
        ],
        process: [
            { step: 1, title: "Đăng ký", desc: "Chọn khóa học và đăng ký tham gia" },
            { step: 2, title: "Học tập", desc: "Tham gia lớp học với giảng viên" },
            { step: 3, title: "Thi cử", desc: "Kiểm tra đánh giá năng lực" },
            { step: 4, title: "Cấp chứng chỉ", desc: "Nhận chứng chỉ hoàn thành" },
        ],
    },
};

const allServices = Object.values(servicesData);

export default function ServiceDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const service = servicesData[slug as keyof typeof servicesData];

    if (!service) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 pt-24 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-800 mb-4">Không tìm thấy dịch vụ</h1>
                        <Link href="/dich-vu">
                            <Button>Xem tất cả dịch vụ</Button>
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
                <section className="relative py-24 overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <Link
                            href="/dich-vu"
                            className="inline-flex items-center gap-2 text-slate-800 hover:text-slate-800 mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Tất cả dịch vụ
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
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-heading font-bold text-slate-800 mb-8 text-center">
                            Quy trình làm việc
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {service.process.map((step, idx) => (
                                <div key={idx} className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white font-bold text-lg mb-4`}>
                                        {step.step}
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                                    <p className="text-slate-800 text-sm">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 relative overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="glass-panel p-12 rounded-2xl border border-slate-200 max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-heading font-bold text-slate-800 mb-4">
                                Liên hệ tư vấn
                            </h2>
                            <p className="text-slate-800 mb-8">
                                Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/lien-he">
                                    <Button variant="primary" size="lg">
                                        Gửi yêu cầu tư vấn
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <a href="tel:19001234">
                                    <Button variant="outline" size="lg" className="border-slate-200 text-slate-800 hover:bg-white">
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
                            Dịch vụ khác
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {otherServices.slice(0, 3).map((s) => {
                                const SIcon = s.icon;
                                return (
                                    <Link key={s.slug} href={`/dich-vu/${s.slug}`} className="group">
                                        <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200 hover:border-slate-200 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] transition-all cursor-pointer">
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
