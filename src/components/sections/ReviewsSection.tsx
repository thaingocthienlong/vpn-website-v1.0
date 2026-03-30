"use client";

import Image from "next/image";
import { Quotes, Star } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

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

function ReviewIdentity({ review, dark = false }: { review: Review; dark?: boolean }) {
    const identityLabel = [review.role, review.company].filter(Boolean).join(" • ");

    return (
        <div className="flex items-center gap-4">
            {review.avatar ? (
                <Image
                    src={review.avatar}
                    alt={review.name}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-[1.35rem] object-cover"
                />
            ) : (
                <div className={`flex h-14 w-14 items-center justify-center rounded-[1.35rem] font-semibold ${dark ? "bg-white/12 text-white" : "bg-[rgba(16,40,70,0.08)] text-[var(--accent-strong)]"}`}>
                    {review.name.charAt(0).toUpperCase()}
                </div>
            )}
            <div>
                <p className={`font-medium ${dark ? "text-white" : "text-[var(--ink)]"}`}>
                    {review.name}
                </p>
                {identityLabel ? (
                    <p className={`text-sm ${dark ? "text-white/62" : "text-[var(--ink-soft)]"}`}>
                        {identityLabel}
                    </p>
                ) : null}
            </div>
        </div>
    );
}

function Rating({ rating = 5, dark = false }: { rating?: number; dark?: boolean }) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={index}
                    className={dark
                        ? index < rating ? "h-4 w-4 fill-[#f3d4a5] text-[#f3d4a5]" : "h-4 w-4 fill-white/15 text-white/15"
                        : index < rating ? "h-4 w-4 fill-[rgba(160,121,66,0.76)] text-[rgba(160,121,66,0.76)]" : "h-4 w-4 fill-[rgba(16,40,70,0.1)] text-[rgba(16,40,70,0.1)]"}
                    weight="fill"
                />
            ))}
        </div>
    );
}

export function ReviewsSection({
    reviews,
    title,
    subtitle,
}: ReviewsSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();

    const resolvedReviews = reviews?.slice(0, 3) || [];
    const resolvedTitle = title || (isEn ? "Voices from the institute network" : "Những tiếng nói từ mạng lưới của viện");
    const resolvedSubtitle = subtitle || (isEn
        ? "Experiences from learners, partners, and practitioners who worked with Vien Phuong Nam."
        : "Chia sẻ từ người học, đối tác và chuyên gia đã đồng hành cùng Viện Phương Nam.");

    const leadReview = resolvedReviews[0];
    const supportingReviews = resolvedReviews.slice(1, 3);

    if (!leadReview) {
        return null;
    }

    return (
        <SectionWrapper>
            <MotionSection>
                <SectionHeader
                    title={resolvedTitle}
                    subtitle={resolvedSubtitle}
                    badge={isEn ? "Selected testimonials" : "Phản hồi chọn lọc"}
                />
            </MotionSection>

            <MotionGroup className="grid gap-5 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]" stagger={0.12}>
                <MotionItem>
                    <motion.article
                        whileHover={shouldReduceMotion ? undefined : { y: -8 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="public-panel-contrast public-frame relative h-full overflow-hidden rounded-[2.8rem] p-6 md:p-8"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_84%_18%,rgba(160,121,66,0.14),transparent_18%)]" />
                        <div className="relative flex h-full flex-col justify-between gap-8">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="editorial-caption text-white/48">
                                        {isEn ? "Lead perspective" : "Chia sẻ nổi bật"}
                                    </p>
                                    <div className="mt-4 inline-flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-white/12 bg-white/10 text-white">
                                        <Quotes className="h-7 w-7" weight="duotone" />
                                    </div>
                                </div>
                                <Rating rating={leadReview.rating} dark />
                            </div>

                            <p className="max-w-[24ch] font-heading text-[2rem] leading-[1.02] tracking-[-0.04em] text-white md:text-[2.7rem]">
                                “{leadReview.content}”
                            </p>

                            <ReviewIdentity review={leadReview} dark />
                        </div>
                    </motion.article>
                </MotionItem>

                <MotionGroup className="grid gap-5 md:grid-cols-2" stagger={0.08}>
                    {supportingReviews.map((review, index) => (
                        <MotionItem key={review.id}>
                            <motion.article
                                whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                                transition={publicMotionTokens.hoverSpring}
                                className={`relative overflow-hidden rounded-[2.35rem] border p-5 md:p-6 ${
                                    index === 0
                                        ? "public-frame border-[rgba(19,35,56,0.08)] bg-[linear-gradient(180deg,rgba(255,251,245,0.95),rgba(242,232,219,0.82))]"
                                        : "border-[rgba(19,35,56,0.08)] bg-[linear-gradient(180deg,rgba(245,239,230,0.9),rgba(233,224,208,0.76))]"
                                }`}
                            >
                                <div className="space-y-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <p className="editorial-caption text-[var(--ink-muted)]">
                                            {isEn ? "Testimonial" : "Phản hồi"}
                                        </p>
                                        <Rating rating={review.rating} />
                                    </div>

                                    <p className="text-[0.98rem] leading-8 text-[var(--ink)]">
                                        “{review.content}”
                                    </p>

                                    <ReviewIdentity review={review} />
                                </div>
                            </motion.article>
                        </MotionItem>
                    ))}

                </MotionGroup>
            </MotionGroup>
        </SectionWrapper>
    );
}

export default ReviewsSection;
