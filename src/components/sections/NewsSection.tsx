"use client";

import { SectionWrapper } from "./SectionWrapper";
import { SectionHeader } from "./SectionHeader";
import { Button } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarBlank, Eye, NewspaperClipping } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { detectLocaleFromPath } from "@/lib/routes";
import { motion, useReducedMotion } from "framer-motion";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

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
    viewCount?: number;
    isFeatured?: boolean;
    locale?: "vi" | "en";
}

interface NewsSectionProps {
    posts?: Post[];
    title?: string;
    subtitle?: string;
}

export function NewsSection({
    posts = [],
    title,
    subtitle,
}: NewsSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";

    const resolvedTitle = title || (isEn ? "News & Events" : "Tin Tức & Sự Kiện");
    const resolvedSubtitle = subtitle || (isEn
        ? "Latest updates on training and institutional activities"
        : "Cập nhật những thông tin mới nhất về đào tạo và hoạt động của Viện");

    const displayPosts = posts.slice(0, 4);
    const [leadPost, ...otherPosts] = displayPosts;
    const listingHref = isEn ? "/en/news" : "/tin-tuc";
    const shouldReduceMotion = useReducedMotion();

    return (
        <SectionWrapper background="gradient-blue">
            <MotionSection>
                <SectionHeader title={resolvedTitle} subtitle={resolvedSubtitle} />
            </MotionSection>

            {displayPosts.length > 0 ? (
                <>
                    <MotionGroup className="grid gap-5 xl:grid-cols-[1.06fr_0.94fr]" stagger={0.12}>
                        {leadPost ? (
                            <MotionItem>
                                <Link href={`${listingHref}/${leadPost.category.slug}/${leadPost.slug}`} className="group block h-full">
                                    <motion.article
                                        whileHover={shouldReduceMotion ? undefined : { y: -10, rotateX: 2.5, rotateY: -2 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                        className="interactive-card public-panel public-band relative h-full overflow-hidden rounded-[2.4rem] p-5 md:p-6"
                                    >
                                        <FloatingAccent className="right-[9%] top-[8%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.14),transparent_70%)]" variant="orb" />
                                        <div className="grid gap-6 lg:grid-cols-[minmax(280px,0.94fr)_minmax(0,1.06fr)]">
                                            <div className="relative min-h-[300px] overflow-hidden rounded-[2rem]">
                                                {leadPost.featuredImage ? (
                                                    <Image
                                                        src={leadPost.featuredImage}
                                                        alt={leadPost.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(23,88,216,0.18),rgba(226,238,255,0.78))]" />
                                                )}
                                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,42,0.02),rgba(7,20,42,0.26))]" />
                                                <div className="absolute bottom-5 left-5">
                                                    <div className="inline-flex rounded-full border border-white/14 bg-white/86 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)] backdrop-blur-sm">
                                                        {leadPost.category.name}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-between gap-8">
                                                <div className="space-y-4">
                                                    <h3 className="max-w-[13ch] font-heading text-[2.25rem] text-[var(--ink)] md:text-[2.95rem]">
                                                        {leadPost.title}
                                                    </h3>
                                                    {leadPost.excerpt ? (
                                                        <p className="max-w-[38rem] text-sm leading-8 text-[var(--ink-soft)]">
                                                            {leadPost.excerpt}
                                                        </p>
                                                    ) : null}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 border-t border-[rgba(26,72,164,0.1)] pt-4 text-sm text-[var(--ink-soft)]">
                                                    {leadPost.publishedAt ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <CalendarBlank className="h-4 w-4" weight="bold" />
                                                            {new Date(leadPost.publishedAt).toLocaleDateString(isEn ? "en-US" : "vi-VN", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                    ) : null}
                                                    {leadPost.viewCount !== undefined ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <Eye className="h-4 w-4" weight="bold" />
                                                            {leadPost.viewCount.toLocaleString()}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                </Link>
                            </MotionItem>
                        ) : null}

                        <MotionGroup className="grid gap-5" stagger={0.08}>
                            {otherPosts.map((post, index) => (
                                <MotionItem key={post.id}>
                                    <Link href={`${listingHref}/${post.category.slug}/${post.slug}`} className="group block h-full">
                                        <motion.article
                                            whileHover={shouldReduceMotion ? undefined : { y: -8, rotateX: 2, rotateY: -1.6 }}
                                            transition={publicMotionTokens.hoverSpring}
                                            style={shouldReduceMotion ? undefined : { transformPerspective: 1200 }}
                                            className="interactive-card rounded-[2rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(234,243,255,0.8))] p-5 shadow-[var(--shadow-xs)] md:p-6"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-3">
                                                    <span className="inline-flex rounded-full border border-[rgba(23,88,216,0.12)] bg-[rgba(23,88,216,0.08)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-strong)]">
                                                        {post.category.name}
                                                    </span>
                                                    <h3 className={`font-heading text-[var(--ink)] ${index === 0 ? "max-w-[15ch] text-[1.95rem]" : "max-w-[17ch] text-[1.6rem]"}`}>
                                                        {post.title}
                                                    </h3>
                                                </div>
                                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--accent-strong)] transition-transform duration-300 group-hover:translate-x-1" weight="bold" />
                                            </div>

                                            {post.excerpt ? (
                                                <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">
                                                    {post.excerpt}
                                                </p>
                                            ) : null}

                                            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[rgba(26,72,164,0.1)] pt-4 text-sm text-[var(--ink-soft)]">
                                                {post.publishedAt ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarBlank className="h-4 w-4" weight="bold" />
                                                        {new Date(post.publishedAt).toLocaleDateString(isEn ? "en-US" : "vi-VN", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                ) : null}
                                                {post.viewCount !== undefined ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Eye className="h-4 w-4" weight="bold" />
                                                        {post.viewCount.toLocaleString()}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </motion.article>
                                    </Link>
                                </MotionItem>
                            ))}
                        </MotionGroup>
                    </MotionGroup>

                    <MotionSection className="mt-10" delay={0.1}>
                        <Button asChild variant="outline" size="lg" motion="magnetic">
                            <Link href={listingHref} className="inline-flex items-center">
                                <span>{isEn ? "View all news" : "Xem tất cả tin tức"}</span>
                                <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
                            </Link>
                        </Button>
                    </MotionSection>
                </>
            ) : (
                <MotionGroup className="grid gap-5 xl:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.96fr)]" stagger={0.12}>
                    <MotionItem>
                    <div className="public-panel public-band relative overflow-hidden rounded-[2.4rem] p-6 md:p-8">
                        <FloatingAccent className="right-[8%] top-[10%] h-20 w-20 rounded-full bg-[radial-gradient(circle,rgba(23,88,216,0.14),transparent_72%)]" variant="halo" />
                        <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
                            <div className="inline-flex h-18 w-18 items-center justify-center rounded-[1.65rem] border border-[rgba(23,88,216,0.12)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                                <NewspaperClipping className="h-9 w-9" weight="duotone" />
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <h3 className="max-w-[16ch] font-heading text-[2rem] text-[var(--ink)] md:text-[2.45rem]">
                                        {isEn ? "New articles coming soon" : "Sắp ra mắt tin tức mới"}
                                    </h3>
                                    <p className="max-w-[42rem] text-sm leading-8 text-[var(--ink-soft)] md:text-[15px]">
                                        {isEn
                                            ? "We're updating the latest information. Please check back later!"
                                            : "Chúng tôi đang cập nhật những thông tin mới nhất. Vui lòng quay lại sau!"}
                                    </p>
                                </div>

                                <Button asChild variant="outline" size="md" motion="magnetic">
                                    <Link href={isEn ? "/en/contact" : "/lien-he"}>
                                        {isEn ? "Contact us" : "Liên hệ với chúng tôi"}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                    </MotionItem>

                    <MotionGroup className="grid gap-4" stagger={0.1}>
                        {[0, 1].map((index) => (
                            <MotionItem
                                key={`news-shell-${index}`}
                                className="rounded-[1.9rem] border border-[rgba(26,72,164,0.12)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(232,242,255,0.8))] p-5 shadow-[var(--shadow-xs)]"
                            >
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[rgba(23,88,216,0.12)] bg-[rgba(23,88,216,0.08)] text-[var(--accent-strong)]">
                                        <NewspaperClipping className="h-5 w-5" weight="duotone" />
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[var(--accent-strong)]" weight="bold" />
                                </div>
                                <div className="space-y-3">
                                    <motion.div className="h-3 w-[70%] rounded-full bg-[rgba(23,88,216,0.13)]" animate={shouldReduceMotion ? undefined : { opacity: [0.45, 0.92, 0.45], x: [0, 6, 0] }} transition={shouldReduceMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
                                    <motion.div className="h-3 w-[88%] rounded-full bg-[rgba(23,88,216,0.09)]" animate={shouldReduceMotion ? undefined : { opacity: [0.35, 0.76, 0.35], x: [0, 8, 0] }} transition={shouldReduceMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.14 }} />
                                    <motion.div className="h-3 w-[58%] rounded-full bg-[rgba(23,88,216,0.09)]" animate={shouldReduceMotion ? undefined : { opacity: [0.35, 0.76, 0.35], x: [0, 5, 0] }} transition={shouldReduceMotion ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.22 }} />
                                </div>
                                <div className="mt-6 flex gap-3">
                                    <motion.div className="h-2.5 w-20 rounded-full bg-[rgba(23,88,216,0.1)]" animate={shouldReduceMotion ? undefined : { opacity: [0.3, 0.7, 0.3] }} transition={shouldReduceMotion ? undefined : { duration: 2.1, repeat: Infinity, ease: "easeInOut" }} />
                                    <motion.div className="h-2.5 w-16 rounded-full bg-[rgba(23,88,216,0.08)]" animate={shouldReduceMotion ? undefined : { opacity: [0.25, 0.6, 0.25] }} transition={shouldReduceMotion ? undefined : { duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.12 }} />
                                </div>
                            </MotionItem>
                        ))}
                    </MotionGroup>
                </MotionGroup>
            )}
        </SectionWrapper>
    );
}

export default NewsSection;
