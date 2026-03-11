/**
 * Seed script for News & Events
 * Creates Categories (type=POST) and sample Posts according to FEATURES_SPEC.md
 * 
 * Run: npx tsx scripts/seed-news-v2.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Initialize Prisma with LibSQL adapter
const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

// Categories according to FEATURES_SPEC.md
const CATEGORIES = [
    { name: "Sự kiện", name_en: "Events", slug: "su-kien" },
    { name: "Tin tức", name_en: "News", slug: "tin-tuc" },
    { name: "Đào tạo", name_en: "Training", slug: "dao-tao" },
    { name: "Dự án", name_en: "Projects", slug: "du-an" },
    { name: "Hợp tác", name_en: "Cooperation", slug: "hop-tac" },
];

// Sample posts data
const POSTS_DATA = [
    // Sự kiện (2 posts)
    {
        categorySlug: "su-kien",
        title: "Lễ kỷ niệm 15 năm thành lập Viện Phương Nam",
        title_en: "15th Anniversary Celebration of SISRD",
        slug: "le-ky-niem-15-nam-thanh-lap",
        excerpt: "Viện Phát triển Nguồn lực Xã hội Phương Nam long trọng tổ chức lễ kỷ niệm 15 năm thành lập với sự tham dự của các đối tác trong và ngoài nước.",
        content: `<h2>Lễ kỷ niệm trọng thể</h2>
<p>Ngày 15/01/2026, Viện Phát triển Nguồn lực Xã hội Phương Nam (SISRD) đã tổ chức lễ kỷ niệm 15 năm thành lập tại Trung tâm Hội nghị Quốc tế, TP.HCM.</p>
<p>Buổi lễ có sự tham dự của hơn 500 khách mời bao gồm các đối tác chiến lược, cựu học viên, và đại diện các cơ quan ban ngành.</p>
<h3>Thành tựu nổi bật</h3>
<ul>
<li>Đào tạo hơn 50,000 học viên</li>
<li>Hợp tác với 200+ đối tác</li>
<li>Triển khai 500+ dự án nghiên cứu</li>
</ul>`,
        isFeatured: true,
        viewCount: 1250,
    },
    {
        categorySlug: "su-kien",
        title: "Hội thảo Quốc tế về Phát triển Bền vững 2026",
        title_en: "International Conference on Sustainable Development 2026",
        slug: "hoi-thao-quoc-te-phat-trien-ben-vung-2026",
        excerpt: "Hội thảo quy tụ hơn 200 chuyên gia từ 15 quốc gia, tập trung thảo luận các giải pháp phát triển bền vững trong bối cảnh biến đổi khí hậu.",
        content: `<h2>Hội thảo Quốc tế</h2>
<p>SISRD phối hợp với Bộ Tài nguyên và Môi trường tổ chức Hội thảo Quốc tế về Phát triển Bền vững 2026.</p>
<h3>Chủ đề chính</h3>
<ol>
<li>Kinh tế tuần hoàn</li>
<li>Năng lượng tái tạo</li>
<li>Quản lý tài nguyên nước</li>
<li>Đô thị thông minh</li>
</ol>`,
        isFeatured: false,
        viewCount: 890,
    },
    // Tin tức (2 posts)
    {
        categorySlug: "tin-tuc",
        title: "SISRD đạt chứng nhận ISO 9001:2015 lần thứ 3",
        title_en: "SISRD achieves ISO 9001:2015 certification for the 3rd time",
        slug: "sisrd-dat-chung-nhan-iso-9001-2015-lan-thu-3",
        excerpt: "Viện Phương Nam tiếp tục khẳng định chất lượng dịch vụ khi đạt chứng nhận ISO 9001:2015 lần thứ 3 liên tiếp.",
        content: `<h2>Chứng nhận ISO 9001:2015</h2>
<p>Sau quá trình đánh giá nghiêm ngặt từ tổ chức chứng nhận quốc tế, SISRD đã được cấp chứng nhận ISO 9001:2015 về hệ thống quản lý chất lượng.</p>
<p>Đây là lần thứ 3 liên tiếp Viện đạt được chứng nhận này, khẳng định cam kết không ngừng nâng cao chất lượng dịch vụ.</p>`,
        isFeatured: true,
        viewCount: 756,
    },
    {
        categorySlug: "tin-tuc",
        title: "Thông báo tuyển dụng Chuyên viên Nghiên cứu 2026",
        title_en: "Research Specialist Recruitment 2026",
        slug: "thong-bao-tuyen-dung-chuyen-vien-nghien-cuu-2026",
        excerpt: "SISRD tuyển dụng 05 Chuyên viên Nghiên cứu có kinh nghiệm trong lĩnh vực môi trường, năng lượng và phát triển bền vững.",
        content: `<h2>Vị trí tuyển dụng</h2>
<p>Viện Phát triển Nguồn lực Xã hội Phương Nam thông báo tuyển dụng:</p>
<ul>
<li>02 Chuyên viên Nghiên cứu Môi trường</li>
<li>02 Chuyên viên Nghiên cứu Năng lượng</li>
<li>01 Chuyên viên Phát triển Bền vững</li>
</ul>
<h3>Yêu cầu</h3>
<ul>
<li>Tốt nghiệp Thạc sĩ trở lên</li>
<li>Kinh nghiệm tối thiểu 3 năm</li>
<li>Thành thạo tiếng Anh</li>
</ul>`,
        isFeatured: false,
        viewCount: 432,
    },
    // Đào tạo (2 posts)
    {
        categorySlug: "dao-tao",
        title: "Khai giảng khóa An toàn Lao động K78",
        title_en: "Opening of Occupational Safety Course K78",
        slug: "khai-giang-khoa-an-toan-lao-dong-k78",
        excerpt: "Khóa đào tạo An toàn Lao động K78 chính thức khai giảng với 45 học viên đến từ các doanh nghiệp sản xuất công nghiệp.",
        content: `<h2>Khóa An toàn Lao động K78</h2>
<p>Ngày 20/01/2026, SISRD khai giảng khóa đào tạo An toàn Lao động K78 tại Trung tâm Đào tạo TP.HCM.</p>
<h3>Nội dung khóa học</h3>
<ul>
<li>Pháp luật về an toàn lao động</li>
<li>Nhận diện và đánh giá rủi ro</li>
<li>Phòng chống cháy nổ</li>
<li>Sơ cứu tai nạn lao động</li>
</ul>`,
        isFeatured: false,
        viewCount: 567,
    },
    {
        categorySlug: "dao-tao",
        title: "Chương trình Thạc sĩ Quản lý Môi trường 2026",
        title_en: "Master's Program in Environmental Management 2026",
        slug: "chuong-trinh-thac-si-quan-ly-moi-truong-2026",
        excerpt: "SISRD phối hợp với Đại học Quốc gia TP.HCM mở chương trình Thạc sĩ Quản lý Môi trường khóa 2026-2028.",
        content: `<h2>Chương trình Thạc sĩ</h2>
<p>Chương trình đào tạo Thạc sĩ Quản lý Môi trường được thiết kế theo tiêu chuẩn quốc tế, kết hợp lý thuyết và thực hành.</p>
<h3>Đặc điểm nổi bật</h3>
<ul>
<li>Giảng viên quốc tế</li>
<li>Thực tập tại doanh nghiệp</li>
<li>Cơ hội học bổng</li>
</ul>`,
        isFeatured: true,
        viewCount: 923,
    },
    // Dự án (1 post)
    {
        categorySlug: "du-an",
        title: "Dự án Quan trắc Môi trường Đồng bằng Sông Cửu Long",
        title_en: "Mekong Delta Environmental Monitoring Project",
        slug: "du-an-quan-trac-moi-truong-dong-bang-song-cuu-long",
        excerpt: "SISRD triển khai dự án quan trắc môi trường quy mô lớn tại 13 tỉnh Đồng bằng Sông Cửu Long với tổng kinh phí 50 tỷ đồng.",
        content: `<h2>Dự án Quan trắc Môi trường</h2>
<p>Đây là dự án quan trắc môi trường lớn nhất khu vực Đồng bằng Sông Cửu Long, được triển khai từ 2025-2027.</p>
<h3>Mục tiêu</h3>
<ul>
<li>Xây dựng hệ thống quan trắc tự động</li>
<li>Đánh giá chất lượng nước, không khí</li>
<li>Dự báo và cảnh báo sớm</li>
</ul>`,
        isFeatured: true,
        viewCount: 678,
    },
    // Hợp tác (1 post)
    {
        categorySlug: "hop-tac",
        title: "Ký kết hợp tác với Đại học Tokyo, Nhật Bản",
        title_en: "Partnership Agreement with University of Tokyo, Japan",
        slug: "ky-ket-hop-tac-dai-hoc-tokyo-nhat-ban",
        excerpt: "SISRD và Đại học Tokyo ký kết thỏa thuận hợp tác chiến lược trong lĩnh vực nghiên cứu khoa học và đào tạo nguồn nhân lực.",
        content: `<h2>Hợp tác chiến lược</h2>
<p>Ngày 10/01/2026, SISRD và Đại học Tokyo (Nhật Bản) đã ký kết thỏa thuận hợp tác chiến lược giai đoạn 2026-2030.</p>
<h3>Nội dung hợp tác</h3>
<ul>
<li>Trao đổi giảng viên và sinh viên</li>
<li>Nghiên cứu chung về biến đổi khí hậu</li>
<li>Hỗ trợ học bổng du học</li>
</ul>`,
        isFeatured: false,
        viewCount: 534,
    },
];

async function main() {
    console.log("🧹 Cleaning up old data...");

    // Delete existing posts with type POST categories
    const postCategories = await prisma.category.findMany({
        where: { type: "POST" },
        select: { id: true },
    });

    if (postCategories.length > 0) {
        const categoryIds = postCategories.map((c) => c.id);
        await prisma.post.deleteMany({
            where: { categoryId: { in: categoryIds } },
        });
        await prisma.category.deleteMany({
            where: { type: "POST" },
        });
        console.log("✅ Deleted old POST categories and posts");
    }

    // Get or create admin user
    let adminUser = await prisma.user.findFirst({
        where: { role: "SUPER_ADMIN" },
    });

    if (!adminUser) {
        adminUser = await prisma.user.create({
            data: {
                email: "admin@sisrd.org.vn",
                password: "hashed_password_placeholder",
                name: "Admin",
                role: "SUPER_ADMIN",
            },
        });
        console.log("✅ Created admin user");
    }

    // Create categories
    console.log("\n📁 Creating categories...");
    const categoryMap: Record<string, string> = {};

    for (let i = 0; i < CATEGORIES.length; i++) {
        const cat = CATEGORIES[i];
        const created = await prisma.category.create({
            data: {
                name: cat.name,
                name_en: cat.name_en,
                slug: cat.slug,
                type: "POST",
                sortOrder: i,
                isActive: true,
            },
        });
        categoryMap[cat.slug] = created.id;
        console.log(`  ✅ ${cat.name} (${cat.slug})`);
    }

    // Create posts
    console.log("\n📝 Creating posts...");

    for (const postData of POSTS_DATA) {
        const categoryId = categoryMap[postData.categorySlug];

        // Create post
        await prisma.post.create({
            data: {
                title: postData.title,
                title_en: postData.title_en,
                slug: postData.slug,
                excerpt: postData.excerpt,
                content: postData.content,
                categoryId,
                authorId: adminUser.id,
                type: "ORIGINAL",
                isFeatured: postData.isFeatured,
                isPublished: true,
                publishedAt: new Date(),
                viewCount: postData.viewCount,
            },
        });
        console.log(`  ✅ ${postData.title.substring(0, 50)}...`);
    }

    console.log("\n🎉 Seed completed!");
    console.log(`   Categories: ${CATEGORIES.length}`);
    console.log(`   Posts: ${POSTS_DATA.length}`);
}

main()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
