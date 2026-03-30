"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarBlank } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    category: {
        name: string;
        slug: string;
    };
    publishedAt?: Date | string | null;
}

interface NewsSectionProps {
    posts?: Post[];
    title?: string;
    subtitle?: string;
}

function formatPostDate(value: Date | string | null | undefined, isEn: boolean) {
    if (!value) return null;

    return new Date(value).toLocaleDateString(isEn ? "en-US" : "vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export function NewsSection({
    posts = [],
    title,
    subtitle,
}: NewsSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const shouldReduceMotion = useReducedMotion();
    const displayPosts = posts.slice(0, 3);
    const [leadPost, ...otherPosts] = displayPosts;
    const listingHref = isEn ? "/en/news" : "/tin-tuc";

    if (!leadPost) {
        return null;
    }

    return (
        <SectionWrapper padding="lg">
            <MotionSection>
                <SectionHeader
                    badge={isEn ? "Newsroom" : "Bản tin"}
                    title={title || (isEn ? "Current institutional activity" : "Nhịp hoạt động hiện tại của viện")}
                    subtitle={subtitle || (isEn
                        ? "A short editorial update block with one lead story and two supporting headlines."
                        : "Khối cập nhật ngắn theo nhịp biên tập, gồm một bài viết chính và hai tiêu đề hỗ trợ.")}
                />
            </MotionSection>

            <MotionGroup className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]" stagger={0.1}>
                <MotionItem>
                    <Link href={`${listingHref}/${leadPost.category.slug}/${leadPost.slug}`} className="group block">
                        <motion.article
                            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                            transition={publicMotionTokens.hoverSpring}
                            className="grid gap-6 border-y border-[rgba(16,40,70,0.1)] py-6 md:grid-cols-[minmax(280px,0.88fr)_minmax(0,1.12fr)] md:items-end"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.45rem] bg-[rgba(77,111,147,0.08)]">
                                {leadPost.featuredImage ? (
                                    <Image
                                        src={leadPost.featuredImage}
                                        alt={leadPost.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-[linear-gradient(160deg,#dbe8f3_0%,#c7d8e8_44%,#edf4f8_100%)]" />
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-strong)]">
                                    {leadPost.category.name}
                                </p>
                                <h3 className="max-w-[13ch] font-heading text-[2.15rem] text-[var(--ink)] md:text-[2.8rem]">
                                    {leadPost.title}
                                </h3>
                                {leadPost.excerpt ? (
                                    <p className="max-w-[36rem] text-sm leading-8 text-[var(--ink-soft)]">
                                        {leadPost.excerpt}
                                    </p>
                                ) : null}
                                {leadPost.publishedAt ? (
                                    <span className="inline-flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                                        <CalendarBlank className="h-4 w-4" weight="bold" />
                                        {formatPostDate(leadPost.publishedAt, isEn)}
                                    </span>
                                ) : null}
                            </div>
                        </motion.article>
                    </Link>
                </MotionItem>

                <MotionItem>
                    <motion.aside
                        whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="border-t border-[rgba(16,40,70,0.12)] pt-5"
                    >
                        <div className="space-y-1 divide-y divide-[rgba(16,40,70,0.1)] border-y border-[rgba(16,40,70,0.1)]">
                            {otherPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`${listingHref}/${post.category.slug}/${post.slug}`}
                                    className="group block py-5"
                                >
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-strong)]">
                                        {post.category.name}
                                    </p>
                                    <h3 className="max-w-[16ch] font-heading text-[1.55rem] text-[var(--ink)]">
                                        {post.title}
                                    </h3>
                                    {post.excerpt ? (
                                        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--ink-soft)]">
                                            {post.excerpt}
                                        </p>
                                    ) : null}
                                    <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                                        <span>{isEn ? "Read" : "Đọc"}</span>
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" />
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <Link href={listingHref} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-strong)]">
                            <span>{isEn ? "View all news" : "Xem tất cả tin tức"}</span>
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </Link>
                    </motion.aside>
                </MotionItem>
            </MotionGroup>
        </SectionWrapper>
    );
}

export default NewsSection;
