import {
  HeroConfig,
  ServicesConfig,
  TrainingConfig,
  VideosConfig,
  PartnersConfig,
  ReviewsConfig,
  NewsConfig,
  GalleryConfig,
  CTASectionConfig,
  ContactConfig,
} from "../types/site-config";

export const DEFAULT_HOMEPAGE_CONFIG: Record<string, any> = {
  hero: {
    title: "Chuyên Đào Tạo Và Tuyển Sinh Lái Xe",
    subtitle: "Uy Tín - Chất Lượng - Tỷ Lệ Đậu Cao Nhất Khu Vực Dĩ An, Bình Dương",
    videoUrl: "",
    ctaPrimary: { text: "Đăng Ký Ngay", href: "#register" },
    ctaSecondary: { text: "Tìm Hiểu Thêm", href: "#courses" },
    featuredCourseIds: [],
  } as HeroConfig,
  services: {
    title: "Dịch Vụ Của Chúng Tôi",
    subtitle: "Hỗ trợ học viên tối đa trên con đường lấy bằng lái xe",
  } as ServicesConfig,
  training: {
    title: "Chương Trình Đào Tạo",
    subtitle: "Các khóa học bằng lái xe ô tô, mô tô chuẩn Bộ GTVT",
    displayCount: 6,
  } as TrainingConfig,
  videos: {
    title: "Video Nổi Bật",
    subtitle: "Khám phá không gian thực hành và hướng dẫn thi sát hạch",
    displayCount: 3,
  } as VideosConfig,
  partners: {
    title: "Đối Tác Liên Kết",
    subtitle: "Các đối tác uy tín cùng đồng hành phát triển",
    displayCount: 10,
  } as PartnersConfig,
  reviews: {
    title: "Đánh Giá Của Học Viên",
    subtitle: "Hàng ngàn học viên đã tin tưởng và thành công",
    displayCount: 6,
  } as ReviewsConfig,
  news: {
    title: "Tin Tức Mới Nhất",
    subtitle: "Cập nhật thông tin nhanh nhất về các khóa học và luật giao thông",
    displayCount: 4,
  } as NewsConfig,
  gallery: {
    title: "Hình Ảnh Hoạt Động",
    subtitle: "Không gian học tập và thực hành tại trung tâm",
  } as GalleryConfig,
  cta: {
    title: "Bạn Đã Sẵn Sàng Trở Thành Tay Lái Chuyên Nghiệp?",
    subtitle: "Đăng ký khóa học ngay hôm nay để nhận ưu đãi học phí tốt nhất",
    button: { text: "Nhận Tư Vấn Miễn Phí", href: "/contact" },
  } as CTASectionConfig,
  contact: {
    title: "Liên Hệ Với Chúng Tôi",
    subtitle: "Sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn",
    address: "Bình Dương, Việt Nam",
    phone: "0123.456.789",
    email: "contact@trungtamlaixe.com",
    hours: "Thứ 2 - Thứ 7: 08:00 - 17:00",
  } as ContactConfig,
};
