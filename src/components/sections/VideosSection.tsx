"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { SectionWrapper } from "./SectionWrapper";
import { detectLocaleFromPath } from "@/lib/routes";
import { FloatingAccent, MotionGroup, MotionItem, MotionSection, ParallaxLayer, publicMotionTokens } from "@/components/motion/PublicMotion";

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

const viVideos: Video[] = [
    {
        id: "1",
        title: "Giới thiệu Viện SISRD",
        thumbnailUrl: "",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
        id: "2",
        title: "Chương trình đào tạo",
        thumbnailUrl: "",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
];

const enVideos: Video[] = [
    {
        id: "1",
        title: "About SISRD",
        thumbnailUrl: "",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
        id: "2",
        title: "Training Programs",
        thumbnailUrl: "",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
];

export function VideosSection({
    videos,
    title,
    subtitle,
}: VideosSectionProps) {
    const pathname = usePathname();
    const locale = detectLocaleFromPath(pathname);
    const isEn = locale === "en";
    const resolvedVideos = videos || (isEn ? enVideos : viVideos);
    const resolvedTitle = title || (isEn ? "Introduction Videos" : "Video Giới Thiệu");
    const resolvedSubtitle = subtitle || (
        isEn
            ? "Learn more about us through our introduction videos"
            : "Tìm hiểu thêm về chúng tôi qua các video giới thiệu"
    );
    const shouldReduceMotion = useReducedMotion();

    const [activeVideoId, setActiveVideoId] = useState(resolvedVideos[0]?.id ?? null);
    const activeVideo = resolvedVideos.find((video) => video.id === activeVideoId) ?? resolvedVideos[0];
    const [playingId, setPlayingId] = useState<string | null>(null);

    if (!activeVideo) {
        return null;
    }

    return (
        <SectionWrapper background="gradient-blue">
            <MotionSection preset="contrast">
                <SectionHeader title={resolvedTitle} subtitle={resolvedSubtitle} motionPreset="section" />
            </MotionSection>

            <div className="relative overflow-hidden rounded-[2.7rem] border border-[rgba(96,148,255,0.2)] bg-[linear-gradient(155deg,rgba(30,82,186,0.96),rgba(51,106,224,0.93)_54%,rgba(133,181,255,0.86)_124%)] p-4 text-white shadow-[0_34px_96px_rgba(25,72,182,0.22)] md:p-5">
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(214,232,255,0.14),transparent_26%)]" />
                <FloatingAccent className="left-[8%] top-[10%] h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_70%)]" variant="halo" />
                <FloatingAccent className="bottom-[10%] right-[8%] h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(210,230,255,0.18),transparent_74%)]" variant="orb" />

                <MotionGroup className="relative grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] xl:items-stretch" stagger={0.1}>
                    <MotionItem preset="fade-right">
                        <ParallaxLayer depth={20}>
                            <motion.div
                                layout
                                className="relative aspect-video overflow-hidden rounded-[2.2rem] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.06))] shadow-[0_28px_60px_rgba(18,56,138,0.18)]"
                                animate={
                                    shouldReduceMotion
                                        ? undefined
                                        : {
                                              scale: [1, 1.008, 1],
                                          }
                                }
                                transition={
                                    shouldReduceMotion
                                        ? undefined
                                        : {
                                              duration: 7.5,
                                              ease: "easeInOut",
                                              repeat: Infinity,
                                          }
                                }
                            >
                                <AnimatePresence mode="wait">
                                    {playingId === activeVideo.id ? (
                                        <motion.iframe
                                            key={`playing-${activeVideo.id}`}
                                            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
                                            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                                            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
                                            transition={publicMotionTokens.sectionSpring}
                                            src={`${activeVideo.videoUrl}?autoplay=1`}
                                            title={activeVideo.title}
                                            className="h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <motion.button
                                            key={`poster-${activeVideo.id}`}
                                            type="button"
                                            onClick={() => setPlayingId(activeVideo.id)}
                                            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
                                            animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                                            exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
                                            transition={publicMotionTokens.sectionSpring}
                                            className="group relative flex h-full w-full items-center justify-center overflow-hidden"
                                            aria-label={activeVideo.title}
                                        >
                                            {activeVideo.thumbnailUrl ? (
                                                <Image
                                                    src={activeVideo.thumbnailUrl}
                                                    alt={activeVideo.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                />
                                            ) : null}
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_56%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(7,20,42,0.28))]" />
                                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,rgba(7,20,42,0),rgba(7,20,42,0.74))]" />
                                            <motion.div
                                                className="relative z-10 inline-flex h-18 w-18 items-center justify-center rounded-full border border-white/18 bg-white/12 text-white"
                                                whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
                                                transition={publicMotionTokens.hoverSpring}
                                            >
                                                <Play className="ml-1 h-7 w-7" weight="fill" />
                                            </motion.div>
                                            <div className="absolute bottom-0 left-0 right-0 z-10 p-5 text-left md:p-6">
                                                <motion.p
                                                    className="max-w-xl text-base leading-8 text-white/86 md:text-lg"
                                                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                                                    animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                                                    transition={{ ...publicMotionTokens.sectionSpring, delay: 0.08 }}
                                                >
                                                    {activeVideo.title}
                                                </motion.p>
                                            </div>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </ParallaxLayer>
                    </MotionItem>

                    <MotionGroup className="grid h-full gap-4 md:grid-cols-2 xl:grid-cols-1 xl:auto-rows-fr" stagger={0.08}>
                        {resolvedVideos.map((video, index) => {
                            const isActive = video.id === activeVideo.id;

                            return (
                                <MotionItem key={video.id} preset="fade-left">
                                    <motion.button
                                        layout
                                        type="button"
                                        onClick={() => {
                                            setActiveVideoId(video.id);
                                            setPlayingId(null);
                                        }}
                                        whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
                                        whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                                        transition={publicMotionTokens.hoverSpring}
                                        className={`relative flex h-full w-full items-stretch overflow-hidden rounded-[1.85rem] border p-3.5 text-left ${
                                            isActive
                                                ? "border-white/18 bg-white/14 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                                : "border-white/14 bg-white/8 text-white/82 hover:bg-white/10"
                                        }`}
                                    >
                                        {!shouldReduceMotion && isActive ? (
                                            <motion.div
                                                layoutId="video-selector-glow"
                                                className="absolute inset-0 rounded-[1.75rem] border border-white/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_62%)]"
                                            />
                                        ) : null}

                                        <div className="relative z-[1] grid flex-1 gap-4 md:grid-cols-[144px_minmax(0,1fr)] md:items-center">
                                            <motion.div
                                                className="relative min-h-[120px] overflow-hidden rounded-[1.3rem] border border-white/10 bg-[rgba(255,255,255,0.08)]"
                                                animate={
                                                    shouldReduceMotion || !isActive
                                                        ? undefined
                                                        : { scale: [1, 1.02, 1] }
                                                }
                                                transition={
                                                    shouldReduceMotion || !isActive
                                                        ? undefined
                                                        : { duration: 4.2, ease: "easeInOut", repeat: Infinity }
                                                }
                                            >
                                                {video.thumbnailUrl ? (
                                                    <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                                                ) : null}
                                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,42,0.02),rgba(7,20,42,0.5))]" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <motion.div
                                                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/12 text-white"
                                                        animate={
                                                            shouldReduceMotion
                                                                ? undefined
                                                                : { scale: [1, 1.06, 1] }
                                                        }
                                                        transition={
                                                            shouldReduceMotion
                                                                ? undefined
                                                                : {
                                                                      duration: 3.2,
                                                                      ease: "easeInOut",
                                                                      repeat: Infinity,
                                                                      delay: index * 0.18,
                                                                  }
                                                        }
                                                    >
                                                        <Play className="ml-0.5 h-4 w-4" weight="fill" />
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                layout
                                                className="flex h-full items-center pr-1"
                                                animate={shouldReduceMotion ? undefined : { x: isActive ? 0 : -2 }}
                                                transition={publicMotionTokens.hoverSpring}
                                            >
                                                <p className="text-sm leading-7 text-white/90 md:text-base">
                                                    {video.title}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </motion.button>
                                </MotionItem>
                            );
                        })}
                    </MotionGroup>
                </MotionGroup>
            </div>
        </SectionWrapper>
    );
}

export default VideosSection;
