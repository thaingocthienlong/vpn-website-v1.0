"use client";

import { SectionWrapper, type SectionWrapperProps } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { ReviewCard } from "@/components/cards";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import ScrollList from "@/components/lightswind/scroll-list";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";

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
    background?: SectionWrapperProps["background"];
    textColor?: SectionWrapperProps["textColor"];
    backdropBlur?: SectionWrapperProps["backdropBlur"];
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
    {
        id: "4",
        name: "Nguyễn Văn A",
        role: "Học viên",
        company: "Khóa Quản trị Kinh doanh",
        content: "Chương trình đào tạo rất chất lượng, giảng viên nhiệt tình và có nhiều kinh nghiệm thực tế.",
        rating: 5,
    },
    {
        id: "5",
        name: "Trần Thị B",
        role: "Quản lý",
        company: "Công ty ABC",
        content: "Nhờ khóa đào tạo tại đây, tôi đã nâng cao được kỹ năng quản lý và áp dụng hiệu quả vào công việc.",
        rating: 5,
    },
    {
        id: "6",
        name: "Lê Văn C",
        role: "Du học sinh",
        company: "Đại học Melbourne",
        content: "Dịch vụ tư vấn du học rất chuyên nghiệp, hỗ trợ tận tình từ đầu đến khi nhập học.",
        rating: 5,
    },
    {
        id: "7",
        name: "Nguyễn Văn A",
        role: "Học viên",
        company: "Khóa Quản trị Kinh doanh",
        content: "Chương trình đào tạo rất chất lượng, giảng viên nhiệt tình và có nhiều kinh nghiệm thực tế.",
        rating: 5,
    },
    {
        id: "8",
        name: "Trần Thị B",
        role: "Quản lý",
        company: "Công ty ABC",
        content: "Nhờ khóa đào tạo tại đây, tôi đã nâng cao được kỹ năng quản lý và áp dụng hiệu quả vào công việc.",
        rating: 5,
    },
    {
        id: "9",
        name: "Lê Văn C",
        role: "Du học sinh",
        company: "Đại học Melbourne",
        content: "Dịch vụ tư vấn du học rất chuyên nghiệp, hỗ trợ tận tình từ đầu đến khi nhập học.",
        rating: 5,
    },
    {
        id: "10",
        name: "Nguyễn Văn A",
        role: "Học viên",
        company: "Khóa Quản trị Kinh doanh",
        content: "Chương trình đào tạo rất chất lượng, giảng viên nhiệt tình và có nhiều kinh nghiệm thực tế.",
        rating: 5,
    },
    {
        id: "11",
        name: "Trần Thị B",
        role: "Quản lý",
        company: "Công ty ABC",
        content: "Nhờ khóa đào tạo tại đây, tôi đã nâng cao được kỹ năng quản lý và áp dụng hiệu quả vào công việc.",
        rating: 5,
    },
    {
        id: "12",
        name: "Lê Văn C",
        role: "Du học sinh",
        company: "Đại học Melbourne",
        content: "Dịch vụ tư vấn du học rất chuyên nghiệp, hỗ trợ tận tình từ đầu đến khi nhập học.",
        rating: 5,
    },
    {
        id: "13",
        name: "Nguyễn Văn A",
        role: "Học viên",
        company: "Khóa Quản trị Kinh doanh",
        content: "Chương trình đào tạo rất chất lượng, giảng viên nhiệt tình và có nhiều kinh nghiệm thực tế.",
        rating: 5,
    },
    {
        id: "14",
        name: "Trần Thị B",
        role: "Quản lý",
        company: "Công ty ABC",
        content: "Nhờ khóa đào tạo tại đây, tôi đã nâng cao được kỹ năng quản lý và áp dụng hiệu quả vào công việc.",
        rating: 5,
    },
    {
        id: "15",
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
    {
        id: "4",
        name: "Nguyen Van A",
        role: "Student",
        company: "Business Administration Course",
        content: "The training program is excellent — instructors are enthusiastic with extensive practical experience.",
        rating: 5,
    },
    {
        id: "5",
        name: "Tran Thi B",
        role: "Manager",
        company: "ABC Company",
        content: "Thanks to the training here, I've improved my management skills and applied them effectively at work.",
        rating: 5,
    },
    {
        id: "6",
        name: "Le Van C",
        role: "International Student",
        company: "University of Melbourne",
        content: "The study abroad consulting service is very professional — supportive from start to enrollment.",
        rating: 5,
    },
    {
        id: "7",
        name: "Nguyen Van A",
        role: "Student",
        company: "Business Administration Course",
        content: "The training program is excellent — instructors are enthusiastic with extensive practical experience.",
        rating: 5,
    },
    {
        id: "8",
        name: "Tran Thi B",
        role: "Manager",
        company: "ABC Company",
        content: "Thanks to the training here, I've improved my management skills and applied them effectively at work.",
        rating: 5,
    },
    {
        id: "9",
        name: "Le Van C",
        role: "International Student",
        company: "University of Melbourne",
        content: "The study abroad consulting service is very professional — supportive from start to enrollment.",
        rating: 5,
    },
    {
        id: "10",
        name: "Nguyen Van A",
        role: "Student",
        company: "Business Administration Course",
        content: "The training program is excellent — instructors are enthusiastic with extensive practical experience.",
        rating: 5,
    },
    {
        id: "11",
        name: "Tran Thi B",
        role: "Manager",
        company: "ABC Company",
        content: "Thanks to the training here, I've improved my management skills and applied them effectively at work.",
        rating: 5,
    },
    {
        id: "12",
        name: "Le Van C",
        role: "International Student",
        company: "University of Melbourne",
        content: "The study abroad consulting service is very professional — supportive from start to enrollment.",
        rating: 5,
    },
    {
        id: "13",
        name: "Nguyen Van A",
        role: "Student",
        company: "Business Administration Course",
        content: "The training program is excellent — instructors are enthusiastic with extensive practical experience.",
        rating: 5,
    },
    {
        id: "14",
        name: "Tran Thi B",
        role: "Manager",
        company: "ABC Company",
        content: "Thanks to the training here, I've improved my management skills and applied them effectively at work.",
        rating: 5,
    },
    {
        id: "15",
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
    background,
    textColor,
    backdropBlur,
}: ReviewsSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedReviews = reviews || (isEn ? enReviews : viReviews);
    const resolvedTitle = title || (isEn ? "What Students Say" : "Học Viên Nói Gì");

    return (
        <SectionWrapper background={background || "slate"} textColor={textColor} backdropBlur={backdropBlur} className="overflow-hidden">
            <ScrollReveal>
                <SectionHeader
                    title={resolvedTitle}
                    centered
                />
            </ScrollReveal>

            <ScrollReveal delay={1}>
                <div className="mt-12 max-w-7xl mx-auto relative h-[600px]">
                    {/* Background magical glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-full max-h-[500px] bg-linear-to-tr from-blue-600/10 to-slate-500/10 rounded-full blur-[80px] pointer-events-none z-0" />
                    
                    {/* Scroll List Container with Fade Mask */}
                    <div 
                        className="absolute inset-0 z-10" 
                        style={{ 
                            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
                        }}
                    >
                        <ScrollList
                            data={resolvedReviews}
                            itemHeight="auto" 
                            itemClassName="max-w-4xl mb-8"
                            renderItem={(review) => (
                                <ReviewCard
                                    name={review.name}
                                    role={review.role}
                                    company={review.company}
                                    content={review.content}
                                    avatar={review.avatar}
                                    rating={review.rating}
                                />
                            )}
                        />
                    </div>
                </div>
            </ScrollReveal>
        </SectionWrapper>
    );
}

export default ReviewsSection;
