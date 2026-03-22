"use client";

import * as React from "react";
import { UsersThree } from "@phosphor-icons/react";
import { PublicPageShell, PublicStatePanel } from "@/components/route-shell";
import { StaffCard, type StaffCardPerson } from "@/components/cards/StaffCard";

export interface StaffDirectoryGroup {
    title: string;
    members: StaffCardPerson[];
}

export interface StaffDirectoryPageProps {
    title: string;
    description?: string;
    badge?: string;
    featuredTitle?: string;
    featuredMembers?: StaffCardPerson[];
    groups: StaffDirectoryGroup[];
    loading?: boolean;
    emptyTitle: string;
}

export function StaffDirectoryPage({
    title,
    description,
    badge,
    featuredTitle,
    featuredMembers = [],
    groups,
    loading = false,
    emptyTitle,
}: StaffDirectoryPageProps) {
    const hasContent = featuredMembers.length > 0 || groups.some((group) => group.members.length > 0);

    const main = loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="public-panel h-[240px] animate-pulse rounded-[1.9rem]" />
            ))}
        </div>
    ) : !hasContent ? (
        <PublicStatePanel icon={UsersThree} title={emptyTitle} />
    ) : (
        <div className="space-y-10 md:space-y-12">
            {featuredMembers.length > 0 && featuredTitle && (
                <section className="space-y-5">
                    <div className="space-y-3">
                        <div className="public-divider" />
                        <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                            {featuredTitle}
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {featuredMembers.map((member, index) => (
                            <StaffCard
                                key={member.id}
                                person={member}
                                variant="large"
                                className={featuredMembers.length > 1 && index % 3 === 1 ? "xl:translate-y-6" : undefined}
                            />
                        ))}
                    </div>
                </section>
            )}

            {groups.map((group) => (
                <section key={group.title} className="space-y-5">
                    <div className="space-y-3">
                        <div className="public-divider" />
                        <h2 className="text-2xl leading-tight text-[var(--ink)] md:text-[2.2rem]">
                            {group.title}
                        </h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {group.members.map((member, index) => (
                            <StaffCard
                                key={member.id}
                                person={member}
                                className={group.members.length > 2 && index % 3 === 1 ? "xl:translate-y-6" : undefined}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );

    return <PublicPageShell badge={badge} title={title} description={description} main={main} asideSticky={false} />;
}

export default StaffDirectoryPage;
