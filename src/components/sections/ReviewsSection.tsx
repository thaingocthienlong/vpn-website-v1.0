"use client";

import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { ReviewCard } from "@/components/cards";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, MotionSection } from "@/components/motion/PublicMotion";

interface Review {
    id: string;
    name: string;
    role?: string;
    company?: string;
    content: string;
    avatar?: string | null;
    rating?: number;
}

interface ReviewsSectionProps {
    reviews?: Review[];
    title?: string;
    subtitle?: string;
}

const viReviews: Review[] = [
    {
        id: "1",
        name: "Nguyễn Văn A",
        role: "Học viên",
        company: "Khóa Quản trị Kinh doanh",
        content: "Chương trình đào tạo rất chất lượng, giảng viên nhiệt tình và có nhiều kinh nghiệm thực tế.",
        rating: 5,
    },
    {
        id: "2",
        name: "Trần Thị B",
        role: "Quản lý",
        company: "Công ty ABC",
        content: "Nhờ khóa đào tạo tại đây, tôi đã nâng cao được kỹ năng quản lý và áp dụng hiệu quả vào công việc.",
        rating: 5,
    },
    {
        id: "3",
        name: "Lê Văn C",
        role: "Du học sinh",
        company: "Đại học Melbourne",
        content: "Dịch vụ tư vấn du học rất chuyên nghiệp, hỗ trợ tận tình từ đầu đến khi nhập học.",
        rating: 5,
    },
];

const enReviews: Review[] = [
    {
        id: "1",
        name: "Nguyen Van A",
        role: "Student",
        company: "Business Administration Course",
        content: "The training program is excellent — instructors are enthusiastic with extensive practical experience.",
        rating: 5,
    },
    {
        id: "2",
        name: "Tran Thi B",
        role: "Manager",
        company: "ABC Company",
        content: "Thanks to the training here, I've improved my management skills and applied them effectively at work.",
        rating: 5,
    },
    {
        id: "3",
        name: "Le Van C",
        role: "International Student",
        company: "University of Melbourne",
        content: "The study abroad consulting service is very professional — supportive from start to enrollment.",
        rating: 5,
    },
];

export function ReviewsSection({
    reviews,
    title,
    subtitle,
}: ReviewsSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedReviews = reviews || (isEn ? enReviews : viReviews);
    const resolvedTitle = title || (isEn ? "What Students Say" : "Học Viên Nói Gì");
    const resolvedSubtitle = subtitle || (isEn
        ? "Testimonials from students who joined our training programs"
        : "Những chia sẻ từ học viên đã tham gia các chương trình đào tạo của chúng tôi");

    return (
        <SectionWrapper>
            <MotionSection>
                <SectionHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
            </MotionSection>

            <MotionGroup className="grid gap-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.91fr)_minmax(0,0.91fr)] lg:items-stretch" stagger={0.12}>
                {resolvedReviews.map((review, index) => (
                    <MotionItem key={review.id}>
                        <ReviewCard
                            name={review.name}
                            role={review.role}
                            company={review.company}
                            content={review.content}
                            avatar={review.avatar}
                            rating={review.rating}
                            variant={index === 0 ? "feature" : "default"}
                            className="h-full min-h-[16.75rem] md:min-h-[17.5rem] lg:min-h-[18.25rem]"
                        />
                    </MotionItem>
                ))}
            </MotionGroup>
        </SectionWrapper>
    );
}

export default ReviewsSection;
