"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Play } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { MotionGroup, MotionItem, MotionSection, publicMotionTokens } from "@/components/motion/PublicMotion";

interface Video {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
}

interface VideosSectionProps {
    videos?: Video[];
    title?: string;
    subtitle?: string;
}

function getDisplayVideoTitle(title: string | undefined, fallback: string) {
    if (!title) return fallback;

    const normalized = title.trim().toLowerCase();
    if (!normalized || /^video\s*\d+$/i.test(normalized)) {
        return fallback;
    }

    return title;
}

export function VideosSection({
    videos,
    title,
    subtitle,
}: VideosSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const resolvedVideos = videos?.slice(0, 2) || [];
    const resolvedTitle = title || (isEn ? "Introduction Videos" : "Video Giới Thiệu");
    const resolvedSubtitle = subtitle || (
        isEn
            ? "Learn more about us through our introduction videos"
            : "Tìm hiểu thêm về chúng tôi qua các video giới thiệu"
    );
    const shouldReduceMotion = useReducedMotion();

    const [activeVideoId, setActiveVideoId] = useState(resolvedVideos[0]?.id ?? null);
    const activeVideo = resolvedVideos.find((video) => video.id === activeVideoId) ?? resolvedVideos[0];
    const secondaryVideo = resolvedVideos.find((video) => video.id !== activeVideo?.id) || null;
    const activeVideoTitle = getDisplayVideoTitle(activeVideo?.title, resolvedTitle);
    const secondaryVideoTitle = secondaryVideo ? getDisplayVideoTitle(secondaryVideo.title, resolvedTitle) : null;
    const [playingId, setPlayingId] = useState<string | null>(null);

    if (!activeVideo) {
        return null;
    }

    return (
        <SectionWrapper background="gradient-dark">
            <MotionSection>
                <SectionHeader
                    badge={isEn ? "Film" : "Phim giới thiệu"}
                    title={resolvedTitle}
                    subtitle={resolvedSubtitle}
                    variant="dark"
                />
            </MotionSection>

            <MotionGroup className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_320px] xl:items-stretch" stagger={0.1}>
                <MotionItem>
                    <motion.div
                        whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="relative aspect-video overflow-hidden rounded-[2.5rem] border border-white/12 bg-white/6 backdrop-blur-md"
                    >
                        <AnimatePresence mode="wait">
                            {playingId === activeVideo.id ? (
                                <motion.iframe
                                    key={`playing-${activeVideo.id}`}
                                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.99 }}
                                    animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                                    exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
                                    transition={publicMotionTokens.sectionSpring}
                                    src={`${activeVideo.videoUrl}?autoplay=1`}
                                    title={activeVideoTitle}
                                    className="h-full w-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <motion.button
                                    key={`poster-${activeVideo.id}`}
                                    type="button"
                                    onClick={() => setPlayingId(activeVideo.id)}
                                    initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.99 }}
                                    animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                                    exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
                                    transition={publicMotionTokens.sectionSpring}
                                    className="group relative flex h-full w-full items-center justify-center overflow-hidden"
                                    aria-label={activeVideoTitle}
                                >
                                    {activeVideo.thumbnailUrl ? (
                                        <Image
                                            src={activeVideo.thumbnailUrl}
                                            alt={activeVideoTitle}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03)_30%,rgba(8,20,35,0.56))]" />
                                    )}
                                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,42,0.02),rgba(7,20,42,0.24),rgba(7,20,42,0.72))]" />
                                    <div className="relative z-10 inline-flex h-18 w-18 items-center justify-center rounded-full border border-white/16 bg-white/12 text-white">
                                        <Play className="ml-1 h-7 w-7" weight="fill" />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-left md:p-6">
                                        <p className="max-w-xl font-heading text-[1.85rem] leading-[0.98] !text-white md:text-[2.45rem]">
                                            {activeVideoTitle}
                                        </p>
                                    </div>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </MotionItem>

                <MotionItem>
                    <motion.div
                        whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                        transition={publicMotionTokens.hoverSpring}
                        className="flex h-full flex-col rounded-[2.1rem] border border-white/10 bg-white/6 p-5 backdrop-blur-md md:p-6"
                    >
                        <div className="space-y-4">
                            <p className="editorial-caption text-white/46">
                                {isEn ? "Screening note" : "Ghi chú xem nhanh"}
                            </p>
                            <h3 className="max-w-[12ch] font-heading text-[1.95rem] !text-white md:text-[2.3rem]">
                                {activeVideoTitle}
                            </h3>
                            <p className="text-sm leading-8 text-white/68">
                                {isEn
                                    ? "One primary film stays on the homepage. Supporting clips stay secondary so the section reads like one clear media moment."
                                    : "Trang chủ chỉ giữ một video chính. Những video còn lại được đẩy về vai trò phụ để khu vực này hoạt động như một điểm dừng hình ảnh rõ ràng."}
                            </p>
                        </div>

                        {secondaryVideo ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveVideoId(secondaryVideo.id);
                                    setPlayingId(null);
                                }}
                                className="group mt-6 flex items-start justify-between gap-4 rounded-[1.7rem] border border-white/10 bg-white/[0.05] px-4 py-4 text-left transition-colors hover:bg-white/[0.08]"
                            >
                                <div className="space-y-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/46">
                                        {isEn ? "Next film" : "Video tiếp theo"}
                                    </p>
                                    <p className="text-sm leading-7 text-white/88">
                                        {secondaryVideoTitle}
                                    </p>
                                </div>
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/62 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" weight="bold" />
                            </button>
                        ) : null}

                        <button
                            type="button"
                            onClick={() => setPlayingId(activeVideo.id)}
                            className="mt-auto inline-flex items-center gap-3 pt-8 text-sm font-semibold text-white"
                        >
                            <span>{isEn ? "Play film" : "Phát video"}</span>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/8">
                                <Play className="ml-0.5 h-4 w-4" weight="fill" />
                            </span>
                        </button>
                    </motion.div>
                </MotionItem>
            </MotionGroup>
        </SectionWrapper>
    );
}

export default VideosSection;
