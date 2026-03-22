export type ServiceLocale = "vi" | "en";

export type ServiceIconKey =
    | "research"
    | "transfer"
    | "inspection"
    | "monitoring"
    | "iso"
    | "training";

export interface ServiceProcessStep {
    step: number;
    title: string;
    desc: string;
}

export interface ServiceContentSection {
    title: string;
    items: string[];
}

export interface ServiceDetailContent {
    id: string;
    slug: string;
    title: string;
    description: string;
    iconKey: ServiceIconKey;
    sections: ServiceContentSection[];
    process: ServiceProcessStep[];
}

export interface ServiceListSummary {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    iconKey: ServiceIconKey;
    features: string[];
}

const viServices: Record<string, ServiceDetailContent> = {
    "nghien-cuu": {
        id: "SV-01",
        slug: "nghien-cuu",
        title: "Nghiên cứu Khoa học",
        description: "Viện triển khai các đề tài nghiên cứu khoa học ứng dụng, góp phần giải quyết các vấn đề thực tiễn trong nhiều lĩnh vực như môi trường, công nghệ, xã hội.",
        iconKey: "research",
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
        iconKey: "transfer",
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
        iconKey: "inspection",
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
        iconKey: "monitoring",
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
        iconKey: "iso",
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
        iconKey: "training",
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

const enServices: Record<string, ServiceDetailContent> = {
    "nghien-cuu": {
        id: "SV-01",
        slug: "nghien-cuu",
        title: "Scientific Research",
        description: "The Institute conducts applied scientific research projects, contributing to solving practical problems in many fields such as environment, technology, and society.",
        iconKey: "research",
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
        iconKey: "transfer",
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
        iconKey: "inspection",
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
        iconKey: "monitoring",
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
        iconKey: "iso",
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
        iconKey: "training",
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

export const viServiceListSummaries: ServiceListSummary[] = [
    {
        id: "SV-01",
        slug: "nghien-cuu",
        title: "Nghiên cứu Khoa học",
        excerpt: "Triển khai các đề tài nghiên cứu khoa học, ứng dụng thực tiễn trong nhiều lĩnh vực.",
        iconKey: "research",
        features: ["Nghiên cứu cơ bản", "Nghiên cứu ứng dụng", "Công bố khoa học"],
    },
    {
        id: "SV-02",
        slug: "chuyen-giao",
        title: "Chuyển giao Công nghệ",
        excerpt: "Chuyển giao các công nghệ tiên tiến, hỗ trợ doanh nghiệp nâng cao năng lực sản xuất.",
        iconKey: "transfer",
        features: ["Tư vấn công nghệ", "Đào tạo vận hành", "Hỗ trợ triển khai"],
    },
    {
        id: "SV-03",
        slug: "kiem-dinh",
        title: "Kiểm định An toàn",
        excerpt: "Dịch vụ kiểm định thiết bị, máy móc đảm bảo an toàn trong môi trường công nghiệp.",
        iconKey: "inspection",
        features: ["Kiểm định thiết bị", "Huấn luyện an toàn", "Cấp chứng nhận"],
    },
    {
        id: "SV-04",
        slug: "quan-trac",
        title: "Quan trắc Môi trường",
        excerpt: "Hệ thống quan trắc, đánh giá tác động và báo cáo môi trường theo quy chuẩn.",
        iconKey: "monitoring",
        features: ["Quan trắc tự động", "Đánh giá tác động", "Lập báo cáo"],
    },
    {
        id: "SV-05",
        slug: "tu-van-iso",
        title: "Tư vấn ISO",
        excerpt: "Tư vấn xây dựng và chứng nhận hệ thống quản lý chất lượng theo tiêu chuẩn ISO.",
        iconKey: "iso",
        features: ["Xây dựng hệ thống", "Đào tạo nhân sự", "Hỗ trợ chứng nhận"],
    },
    {
        id: "SV-06",
        slug: "dao-tao",
        title: "Đào tạo & Cấp chứng chỉ",
        excerpt: "Các khóa đào tạo chuyên nghiệp với chứng chỉ được công nhận toàn quốc.",
        iconKey: "training",
        features: ["Khóa ngắn hạn", "Khóa dài hạn", "Cấp chứng chỉ"],
    },
];

const serviceContentByLocale = {
    vi: viServices,
    en: enServices,
} as const;

export function getAllServiceContent(locale: ServiceLocale): ServiceDetailContent[] {
    return Object.values(serviceContentByLocale[locale]);
}

export function getServiceContent(locale: ServiceLocale, slug: string): ServiceDetailContent | null {
    const services = serviceContentByLocale[locale] as Record<string, ServiceDetailContent>;

    return services[slug] ?? null;
}

export function getServiceIconKeyBySlug(slug: string): ServiceIconKey {
    const matched =
        getAllServiceContent("vi").find((service) => service.slug === slug)?.iconKey ??
        getAllServiceContent("en").find((service) => service.slug === slug)?.iconKey;

    return matched ?? "training";
}
