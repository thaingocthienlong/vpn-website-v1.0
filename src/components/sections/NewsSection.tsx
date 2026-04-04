"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";
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
    hasEnglishContent?: boolean;
    publishedAt?: Date | string | null;
}

interface NewsSectionProps {
    posts?: Post[];
    title?: string;
    subtitle?: string;
}

function getPostHref(listingHref: string, post: Post) {
    return `${listingHref}/${post.category.slug}/${post.slug}`;
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
    const displayPosts = posts.slice(0, 12);
    const [leadPost] = displayPosts;
    const compactPosts = displayPosts.slice(1, 4);
    const mediumPosts = displayPosts.slice(4, 6);
    const headlinePosts = displayPosts.slice(6, 12);
    const listingHref = isEn ? "/en/news" : "/tin-tuc";

    if (!leadPost) {
        return null;
    }

    return (
        <SectionWrapper>
            <MotionSection>
                <SectionHeader
                    badge={isEn ? "Newsroom" : "Bản tin"}
                    title={title || (isEn ? "Current institutional activity" : "Nhịp hoạt động hiện tại của viện")}
                    subtitle={subtitle || (isEn
                        ? "Editorial headlines curated from featured stories and the latest institutional updates."
                        : "Cụm biên tập gồm tin nổi bật và các cập nhật mới nhất theo nhịp hoạt động của viện.")}
                />
            </MotionSection>

            <MotionGroup className="grid gap-8 lg:gap-8 xl:grid-cols-[minmax(0,1.28fr)_minmax(0,0.76fr)_minmax(260px,0.58fr)] xl:gap-8" stagger={0.06}>
                <MotionItem>
                    <div className="space-y-6 md:space-y-7">
                        <Link href={getPostHref(listingHref, leadPost)} className="group block">
                            <motion.article
                                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                                transition={publicMotionTokens.hoverSpring}
                                className="space-y-5 border-b border-[rgba(16,40,70,0.12)] pb-6 md:space-y-6 md:pb-7"
                            >
                                <div className="relative aspect-[16/9] overflow-hidden rounded-[1.4rem] bg-[rgba(77,111,147,0.08)]">
                                    {leadPost.featuredImage ? (
                                        <Image
                                            src={leadPost.featuredImage}
                                            alt={leadPost.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-[linear-gradient(160deg,#dbe8f3_0%,#c7d8e8_44%,#edf4f8_100%)]" />
                                    )}
                                </div>
                                <div className="space-y-3.5 md:space-y-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--accent-strong)]">
                                        {leadPost.category.name}
                                    </p>
                                    <h3 className="max-w-[20ch] font-heading text-[1.08rem] leading-[1.1] text-[var(--ink)]">
                                        {leadPost.title}
                                    </h3>
                                    {leadPost.excerpt ? (
                                        <p className="max-w-[56ch] text-[0.96rem] leading-6 text-[var(--ink-soft)] md:text-[1rem]">
                                            {leadPost.excerpt}
                                        </p>
                                    ) : null}
                                </div>
                            </motion.article>
                        </Link>

                        {compactPosts.length > 0 ? (
                            <div className="grid gap-4 md:gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {compactPosts.map((post) => (
                                    <Link key={post.id} href={getPostHref(listingHref, post)} className="group block">
                                        <motion.article
                                            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                                            transition={publicMotionTokens.hoverSpring}
                                            className="space-y-3 md:space-y-4"
                                        >
                                            <div className="relative aspect-[16/9] overflow-hidden rounded-[1rem] bg-[rgba(77,111,147,0.08)]">
                                                {post.featuredImage ? (
                                                    <Image
                                                        src={post.featuredImage}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 bg-[linear-gradient(160deg,#dbe8f3_0%,#c7d8e8_44%,#edf4f8_100%)]" />
                                                )}
                                            </div>
                                            <h4 className="line-clamp-3 font-heading text-[0.92rem] leading-[1.5] text-[var(--ink)]">
                                                {post.title}
                                            </h4>
                                        </motion.article>
                                    </Link>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </MotionItem>

                <MotionItem>
                    <div className="space-y-6 md:space-y-7 xl:border-l xl:border-[rgba(16,40,70,0.1)] xl:pl-8">
                        {mediumPosts.map((post) => (
                            <Link key={post.id} href={getPostHref(listingHref, post)} className="group block">
                                <motion.article
                                    whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                                    transition={publicMotionTokens.hoverSpring}
                                    className="space-y-4 border-b border-[rgba(16,40,70,0.1)] pb-6 md:space-y-5 md:pb-7 last:border-b-0 last:pb-0"
                                >
                                    <div className="relative aspect-[16/9] overflow-hidden rounded-[1.2rem] bg-[rgba(77,111,147,0.08)]">
                                        {post.featuredImage ? (
                                            <Image
                                                src={post.featuredImage}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-[linear-gradient(160deg,#dbe8f3_0%,#c7d8e8_44%,#edf4f8_100%)]" />
                                        )}
                                    </div>
                                    <div className="space-y-3 md:space-y-3.5">
                                        <h3 className="line-clamp-3 font-heading text-[1.08rem] leading-[1.22] text-[var(--ink)]">
                                            {post.title}
                                        </h3>
                                        {post.excerpt ? (
                                            <p className="line-clamp-4 text-[0.95rem] leading-6 text-[var(--ink-soft)]">
                                                {post.excerpt}
                                            </p>
                                        ) : null}
                                    </div>
                                </motion.article>
                            </Link>
                        ))}
                    </div>
                </MotionItem>

                <MotionItem>
                    <motion.aside
                        whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="xl:border-l xl:border-[rgba(16,40,70,0.1)] xl:pl-8"
                    >
                        <div className="divide-y divide-[rgba(16,40,70,0.1)] border-y border-[rgba(16,40,70,0.1)]">
                            {headlinePosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={getPostHref(listingHref, post)}
                                    className="group block py-4 md:py-5"
                                >
                                    <h3 className="line-clamp-3 font-heading text-[1.08rem] leading-[1.45] text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--accent-strong)]">
                                        {post.title}
                                    </h3>
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
