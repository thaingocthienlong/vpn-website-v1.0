
export interface LayoutConfig {
    header: {
        logo: string;
        navigation: {
            label: string;
            href: string;
            children?: { label: string; href: string }[];
        }[];
        ctaButton: {
            label: string;
            href: string;
        };
    };
    footer: {
        column1: {
            title: string;
            content: string;
        };
        column2: {
            title: string;
            links: { label: string; href: string }[];
        };
        contact: {
            address: string;
            phone: string;
            email: string;
        };
        socials: {
            platform: 'facebook' | 'youtube' | 'zalo' | 'tiktok';
            url: string;
        }[];
    };
}

export const mockLayoutConfig: LayoutConfig = {
    header: {
        logo: "/images/logo.png",
        navigation: [
            { label: "Giới thiệu", href: "/gioi-thieu" },
            { label: "Tin tức", href: "/tin-tuc" },
            { label: "Đào tạo", href: "/dao-tao" },
            { label: "Dịch vụ", href: "/dich-vu" },
            { label: "Liên hệ", href: "/lien-he" },
        ],
        ctaButton: {
            label: "Đăng ký ngay",
            href: "/dao-tao/dang-ky",
        },
    },
    footer: {
        column1: {
            title: "Về SISRD",
            content: "<p>Viện Nghiên cứu và Phát triển Bền vững (SISRD) là tổ chức khoa học công nghệ hàng đầu...</p>",
        },
        column2: {
            title: "Liên kết",
            links: [
                { label: "Về chúng tôi", href: "/gioi-thieu" },
                { label: "Đội ngũ", href: "/gioi-thieu/hoi-dong-co-van" },
                { label: "Tin tức", href: "/tin-tuc" },
                { label: "Tuyển dụng", href: "/tuyen-dung" },
            ],
        },
        contact: {
            address: "Số 123, Đường ABC, Quận XYZ, TP.HCM",
            phone: "090 123 4567",
            email: "info@sisrd.edu.vn",
        },
        socials: [
            { platform: "facebook", url: "https://facebook.com/sisrd" },
            { platform: "youtube", url: "https://youtube.com/sisrd" },
            { platform: "zalo", url: "https://zalo.me/0901234567" },
        ],
    },
};

export interface HomeConfig {
    hero: {
        title: string;
        subtitle: string;
        backgroundImage: string;
        primaryCta: { label: string; href: string };
        secondaryCta: { label: string; href: string };
    };
    stats: {
        label: string;
        value: string;
        icon: string;
    }[];
    features: {
        id: string;
        title: string;
        description: string;
        items: {
            icon: string;
            title: string;
            description: string;
        }[];
    }[];
}

export const mockHomeConfig: HomeConfig = {
    hero: {
        title: "Kiến tạo Tương lai Bền vững",
        subtitle: "SISRD tiên phong trong nghiên cứu, đào tạo và chuyển giao công nghệ vì sự phát triển bền vững.",
        backgroundImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",
        primaryCta: { label: "Tìm hiểu thêm", href: "/gioi-thieu" },
        secondaryCta: { label: "Liên hệ tư vấn", href: "/lien-he" },
    },
    stats: [
        { label: "Học viên", value: "5000+", icon: "Users" },
        { label: "Đối tác", value: "100+", icon: "Handshake" },
        { label: "Dự án", value: "50+", icon: "Briefcase" },
        { label: "Năm kinh nghiệm", value: "10+", icon: "Award" },
    ],
    features: [
        {
            id: "core-values",
            title: "Giá trị cốt lõi",
            description: "Chúng tôi cam kết mang lại giá trị thực cho cộng đồng và doanh nghiệp.",
            items: [
                { icon: "Shield", title: "Uy tín", description: "Đặt chất lượng và uy tín lên hàng đầu." },
                { icon: "Zap", title: "Đổi mới", description: "Không ngừng sáng tạo và cải tiến." },
                { icon: "Heart", title: "Tận tâm", description: "Phục vụ khách hàng bằng cả trái tim." },
            ],
        },
    ],
};

export interface Post {
    id: string;
    title: string;
    slug: string;
    category: "Tin tức" | "Hoạt động" | "Sự kiện" | "Thông báo";
    excerpt: string;
    content: string;
    thumbnail: string;
    author: {
        name: string;
        avatar: string;
    };
    publishedAt: string;
    status: "published" | "draft" | "archived";
    views: number;
}

export const mockPosts: Post[] = [
    {
        id: "1",
        title: "Lễ ký kết hợp tác đào tạo với Đại học Quốc gia TP.HCM",
        slug: "le-ky-ket-hop-tac-dao-tao-voi-dai-hoc-quoc-gia-tphcm",
        category: "Sự kiện",
        excerpt: "SISRD chính thức ký kết thỏa thuận hợp tác chiến lược với ĐHQG TP.HCM nhằm nâng cao chất lượng đào tạo nguồn nhân lực.",
        content: "<p>Nội dung chi tiết bài viết...</p>",
        thumbnail: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&q=80",
        author: {
            name: "Nguyễn Văn A",
            avatar: "https://i.pravatar.cc/150?u=1",
        },
        publishedAt: "2026-02-09T08:00:00Z",
        status: "published",
        views: 1250,
    },
    {
        id: "2",
        title: "Khai giảng khóa đào tạo An toàn Lao động Nhóm 3 - Tháng 2/2026",
        slug: "khai-giang-khoa-dao-tao-an-toan-lao-dong-nhom-3-thang-2-2026",
        category: "Thông báo",
        excerpt: "Thông báo chiêu sinh khóa học ATLĐ Nhóm 3, dự kiến khai giảng ngày 15/02/2026 tại TP.HCM.",
        content: "<p>Nội dung chi tiết thông báo...</p>",
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
        author: {
            name: "Trần Thị B",
            avatar: "https://i.pravatar.cc/150?u=2",
        },
        publishedAt: "2026-02-08T14:30:00Z",
        status: "published",
        views: 890,
    },
    {
        id: "3",
        title: "Hội thảo: Xu hướng chuyển đổi số trong giáo dục 2026",
        slug: "hoi-thao-xu-huong-chuyen-doi-so-trong-giao-duc-2026",
        category: "Hoạt động",
        excerpt: "Tổng kết các nội dung chính tại hội thảo chuyển đổi số vừa diễn ra tại Hà Nội.",
        content: "<p>Nội dung chi tiết...</p>",
        thumbnail: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
        author: {
            name: "Lê Văn C",
            avatar: "https://i.pravatar.cc/150?u=3",
        },
        publishedAt: "2026-02-05T09:15:00Z",
        status: "draft",
        views: 0,
    },
    {
        id: "4",
        title: "SISRD đón nhận bằng khen của Bộ Lao động - Thương binh và Xã hội",
        slug: "sisrd-don-nhan-bang-khen-cua-bo-ldtbxh",
        category: "Tin tức",
        excerpt: "Ghi nhận những đóng góp tích cực trong công tác đào tạo nghề và giải quyết việc làm năm 2025.",
        content: "<p>Nội dung chi tiết...</p>",
        thumbnail: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80",
        author: {
            name: "Nguyễn Văn A",
            avatar: "https://i.pravatar.cc/150?u=1",
        },
        publishedAt: "2026-01-20T10:00:00Z",
        status: "published",
        views: 3420,
    },
    {
        id: "5",
        title: "Thông báo nghỉ Tết Nguyên Đán 2026",
        slug: "thong-bao-nghi-tet-nguyen-dan-2026",
        category: "Thông báo",
        excerpt: "Lịch nghỉ Tết và thời gian làm việc trở lại của Viện SISRD.",
        content: "<p>Nội dung chi tiết...</p>",
        thumbnail: "https://images.unsplash.com/photo-1548625361-987707d7c674?w=800&q=80",
        author: {
            name: "Admin",
            avatar: "https://i.pravatar.cc/150?u=0",
        },
        publishedAt: "2026-01-15T08:00:00Z",
        status: "archived",
        views: 5600,
    },
];

export interface Course {
    id: string;
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    thumbnail: string;
    duration: string;
    level: "Cơ bản" | "Nâng cao" | "Chuyên sâu";
    price: number;
    maxStudents?: number;
    status: "active" | "full" | "closed";
    isFeatured: boolean;
}

export const mockCourses: Course[] = [
    {
        id: "1",
        title: "Huấn luyện An toàn Lao động - Vệ sinh Lao động (Nhóm 3)",
        slug: "huan-luyen-an-toan-lao-dong-nhom-3",
        category: "An toàn lao động",
        excerpt: "Khóa huấn luyện dành cho người làm công việc có yêu cầu nghiêm ngặt về an toàn, vệ sinh lao động.",
        content: "<p>Nội dung chi tiết khóa học...</p>",
        thumbnail: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80",
        duration: "3 ngày",
        level: "Cơ bản",
        price: 1500000,
        maxStudents: 50,
        status: "active",
        isFeatured: true,
    },
    {
        id: "2",
        title: "Nghiệp vụ Sư phạm Giáo dục nghề nghiệp",
        slug: "nghiep-vu-su-pham-giao-duc-nghe-nghiep",
        category: "Nghiệp vụ sư phạm",
        excerpt: "Đào tạo kỹ năng giảng dạy cho giáo viên tại các cơ sở giáo dục nghề nghiệp.",
        content: "<p>Nội dung chi tiết...</p>",
        thumbnail: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
        duration: "2 tháng",
        level: "Nâng cao",
        price: 3500000,
        maxStudents: 30,
        status: "active",
        isFeatured: true,
    },
    {
        id: "3",
        title: "Quản lý Chất lượng ISO 9001:2015",
        slug: "quan-ly-chat-luong-iso-9001-2015",
        category: "Quản lý chất lượng",
        excerpt: "Trang bị kiến thức và kỹ năng xây dựng, vận hành hệ thống quản lý chất lượng theo tiêu chuẩn quốc tế.",
        content: "<p>Nội dung...</p>",
        thumbnail: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
        duration: "5 ngày",
        level: "Chuyên sâu",
        price: 5000000,
        maxStudents: 20,
        status: "closed",
        isFeatured: false,
    }
];

export interface Service {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail: string;
    icon: string;
    isFeatured: boolean;
    status: "published" | "draft";
}

export const mockServices: Service[] = [
    {
        id: "1",
        title: "Tư vấn Du học & Định cư",
        slug: "tu-van-du-hoc-dinh-cu",
        excerpt: "Dịch vụ tư vấn lộ trình du học và định cư tại các nước phát triển: Mỹ, Canada, Úc, Châu Âu.",
        content: "<p>Chi tiết dịch vụ...</p>",
        thumbnail: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
        icon: "Globe",
        isFeatured: true,
        status: "published",
    },
    {
        id: "2",
        title: "Đào tạo & Cung ứng nguồn nhân lực",
        slug: "dao-tao-cung-ung-nguon-nhan-luc",
        excerpt: "Cung cấp giải pháp nhân sự chất lượng cao cho doanh nghiệp trong và ngoài nước.",
        content: "<p>Chi tiết...</p>",
        thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
        icon: "Users",
        isFeatured: true,
        status: "published",
    },
    {
        id: "3",
        title: "Tư vấn Môi trường & Sức khỏe nghề nghiệp",
        slug: "tu-van-moi-truong-suc-khoe-nghe-nghiep",
        excerpt: "Dịch vụ quan trắc môi trường và khám sức khỏe định kỳ theo quy định pháp luật.",
        content: "<p>Chi tiết...</p>",
        thumbnail: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80",
        icon: "Activity",
        isFeatured: false,
        status: "published",
    }
];

export interface Staff {
    id: string;
    name: string;
    slug: string;
    position: string;
    department: string;
    bio: string;
    avatar: string;
    email: string;
    phone: string;
    isLeadership: boolean;
    isAdvisory: boolean;
    status: "published" | "draft";
}

export const mockStaff: Staff[] = [
    {
        id: "1",
        name: "TS. Nguyễn Văn A",
        slug: "ts-nguyen-van-a",
        position: "Viện trưởng",
        department: "Ban lãnh đạo",
        bio: "Tiến sĩ Kinh tế học, hơn 20 năm kinh nghiệm trong lĩnh vực giáo dục và đào tạo.",
        avatar: "https://i.pravatar.cc/150?u=1",
        email: "nguyenvana@sisrd.edu.vn",
        phone: "0901234567",
        isLeadership: true,
        isAdvisory: false,
        status: "published",
    },
    {
        id: "2",
        name: "ThS. Trần Thị B",
        slug: "ths-tran-thi-b",
        position: "Phó Viện trưởng",
        department: "Ban lãnh đạo",
        bio: "Thạc sĩ Quản lý giáo dục, chuyên gia tư vấn hướng nghiệp.",
        avatar: "https://i.pravatar.cc/150?u=2",
        email: "tranthib@sisrd.edu.vn",
        phone: "0909876543",
        isLeadership: true,
        isAdvisory: false,
        status: "published",
    },
    {
        id: "3",
        name: "GS.TS. Lê Văn C",
        slug: "gs-ts-le-van-c",
        position: "Cố vấn cấp cao",
        department: "Hội đồng khoa học",
        bio: "Giáo sư đầu ngành về Khoa học Môi trường.",
        avatar: "https://i.pravatar.cc/150?u=3",
        email: "levanc@sisrd.edu.vn",
        phone: "",
        isLeadership: false,
        isAdvisory: true,
        status: "published",
    }
];

export interface Partner {
    id: string;
    name: string;
    logo: string;
    website: string;
    status: "active" | "inactive";
}

export const mockPartners: Partner[] = [
    {
        id: "1",
        name: "Đại học Quốc gia TP.HCM",
        logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/e/e1/Logo_Đại_học_Quốc_gia_Thành_phố_Hồ_Chí_Minh.svg/1200px-Logo_Đại_học_Quốc_gia_Thành_phố_Hồ_Chí_Minh.svg.png",
        website: "https://vnuhcm.edu.vn",
        status: "active",
    },
    {
        id: "2",
        name: "Bộ Lao động - Thương binh và Xã hội",
        logo: "https://molisa.gov.vn/Images/Logo.png",
        website: "https://molisa.gov.vn",
        status: "active",
    },
];
