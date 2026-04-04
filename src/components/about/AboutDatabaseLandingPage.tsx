"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui";
import { PublicPageShell } from "@/components/route-shell";
import type { VietnameseAboutLandingContent } from "@/lib/services/about-content";

export interface AboutDatabaseLandingPageProps extends VietnameseAboutLandingContent {
    hrefs: {
        visionMission: string;
        contact: string;
    };
}

export function AboutDatabaseLandingPage({
    badge,
    title,
    description,
    motto,
    introParagraphs,
    coreFunctions,
    directionStatement,
    directionDescription,
    commitments,
    values,
    rawContent,
    hrefs,
}: AboutDatabaseLandingPageProps) {
    const heroActions = (
        <>
            <Button asChild size="lg">
                <Link href={hrefs.visionMission}>
                    Tầm nhìn và sứ mệnh
                    <ArrowRight className="h-4 w-4" weight="bold" />
                </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
                <Link href={hrefs.contact}>Liên hệ tư vấn</Link>
            </Button>
        </>
    );

    const secondaryPanel = (
        <div className="public-panel-muted rounded-[2rem] p-6 md:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                Phương châm hoạt động
            </p>
            <p className="mt-4 text-2xl leading-[1.15] text-[var(--ink)] md:text-[2.2rem]">
                {motto ? `“${motto.replace(/^[“"]|[”"]$/g, "")}”` : "Niềm tin đối tác là sức mạnh Phương Nam."}
            </p>
            {values.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                    {values.map((value) => (
                        <span
                            key={value}
                            className="rounded-full border border-[rgba(26,72,164,0.12)] bg-[rgba(255,255,255,0.78)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-muted)]"
                        >
                            {value}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );

    const shouldRenderFallback = coreFunctions.length === 0 || commitments.length === 0;

    const main = (
        <div className="space-y-10 md:space-y-12">
            <section className="public-panel rounded-[2.2rem] p-6 md:p-8">
                <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-4">
                        <div className="glass-badge">Tổng quan</div>
                        <h2 className="text-3xl leading-[0.95] text-[var(--ink)] md:text-[3.1rem]">
                            Hình thành từ nhu cầu phát triển nguồn lực xã hội chất lượng.
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {introParagraphs.map((paragraph) => (
                            <p key={paragraph} className="text-base leading-8 text-[var(--ink-soft)]">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </section>

            {coreFunctions.length > 0 && (
                <section className="grid gap-5 md:grid-cols-3">
                    {coreFunctions.map((item) => (
                        <article key={item.key} className="public-panel interactive-card rounded-[2rem] p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                Nhiệm vụ {item.key.toUpperCase()}
                            </p>
                            <h3 className="mt-3 text-2xl leading-tight text-[var(--ink)]">{item.title}</h3>
                            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{item.description}</p>
                        </article>
                    ))}
                </section>
            )}

            <section className="public-panel rounded-[2.2rem] p-6 md:p-8">
                <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <div className="space-y-4">
                        <div className="glass-badge">Định hướng và cam kết</div>
                        <h2 className="text-3xl leading-[0.95] text-[var(--ink)] md:text-[3.1rem]">
                            {directionStatement || "Cam kết phụng sự xã hội bằng những giá trị đích thực."}
                        </h2>
                        {directionDescription && (
                            <p className="text-base leading-8 text-[var(--ink-soft)]">{directionDescription}</p>
                        )}
                    </div>
                    <div className="space-y-6">
                        {commitments.length > 0 && (
                            <div className="rounded-[1.7rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.62)] p-5 md:p-6">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                    Cam kết triển khai
                                </p>
                                <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
                                    {commitments.map((item) => (
                                        <li key={item} className="flex gap-3">
                                            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--accent-strong)]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {values.length > 0 && (
                            <div className="rounded-[1.7rem] border border-[rgba(26,72,164,0.1)] bg-[rgba(255,255,255,0.62)] p-5 md:p-6">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                                    Giá trị cốt lõi
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {values.map((value) => (
                                        <span
                                            key={value}
                                            className="rounded-full bg-[rgba(23,88,216,0.08)] px-3 py-1 text-sm text-[var(--ink)]"
                                        >
                                            {value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {shouldRenderFallback && (
                <section className="public-panel rounded-[2.2rem] p-6 md:p-8">
                    <div
                        className="content-area prose prose-lg max-w-none text-[var(--ink-soft)] prose-headings:text-[var(--ink)] prose-strong:text-[var(--ink)]"
                        dangerouslySetInnerHTML={{ __html: rawContent }}
                    />
                </section>
            )}

            <section className="public-panel public-band rounded-[2.2rem] p-6 text-center md:p-8">
                <h2 className="text-3xl leading-[0.95] text-[var(--ink)] md:text-[3.1rem]">
                    Đồng hành cùng hành trình phát triển nguồn lực chất lượng.
                </h2>
                <p className="mx-auto mt-4 max-w-[58ch] text-base leading-8 text-[var(--ink-soft)]">
                    Kết nối với Viện Phương Nam để trao đổi về chương trình đào tạo, tư vấn và các hoạt động hợp tác phù hợp với nhu cầu của bạn.
                </p>
                <div className="mt-6 flex justify-center">
                    <Button asChild size="lg">
                        <Link href={hrefs.contact}>
                            Liên hệ tư vấn
                            <ArrowRight className="h-4 w-4" weight="bold" />
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    );

    return (
        <PublicPageShell
            badge={badge}
            title={title}
            description={description}
            actions={heroActions}
            secondaryPanel={secondaryPanel}
            main={main}
            asideSticky={false}
        />
    );
}

export default AboutDatabaseLandingPage;
