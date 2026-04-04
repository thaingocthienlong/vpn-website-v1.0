import Image from "next/image";
import { cn } from "@/lib/utils";

type AvatarLike = {
    url: string;
    secureUrl?: string | null;
} | null;

export interface StaffCardPerson {
    id: string;
    name: string;
    title?: string | null;
    position?: string | null;
    bio?: string | null;
    avatar?: AvatarLike;
}

interface StaffCardProps {
    person: StaffCardPerson;
    variant?: "default" | "large";
    className?: string;
}

export function StaffCard({ person, variant = "default", className }: StaffCardProps) {
    const isLarge = variant === "large";
    const roleLabel = person.position && person.position !== person.title ? person.position : null;
    const avatarUrl = person.avatar?.secureUrl || person.avatar?.url;

    return (
        <article
            className={cn(
                "group public-panel interactive-card flex h-full flex-col rounded-[2rem]",
                isLarge ? "p-6 md:p-7" : "p-5 md:p-6",
                className
            )}
        >
            <div className="flex items-start gap-4">
                <div
                    className={cn(
                        "relative flex-none overflow-hidden rounded-[1.45rem] border border-[rgba(26,72,164,0.12)] bg-[rgba(23,88,216,0.08)]",
                        isLarge ? "h-24 w-24" : "h-[72px] w-[72px]"
                    )}
                >
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={person.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes={isLarge ? "96px" : "72px"}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[var(--accent-strong)]">
                            {person.name.charAt(0)}
                        </div>
                    )}
                </div>

                <div className="min-w-0 space-y-2 text-left">
                    <h3
                        className={cn(
                            "leading-tight text-[var(--ink)] transition-colors group-hover:text-[var(--accent-strong)]",
                            isLarge ? "text-[1.75rem]" : "text-xl"
                        )}
                    >
                        {person.name}
                    </h3>

                    {person.title && (
                        <p className="text-sm leading-7 text-[var(--accent-strong)]">
                            {person.title}
                        </p>
                    )}

                    {roleLabel && (
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">
                            {roleLabel}
                        </p>
                    )}
                </div>
            </div>

            {person.bio && (
                <div
                    className="prose prose-sm mt-5 max-w-none border-t border-[rgba(26,72,164,0.1)] pt-5 text-[var(--ink-soft)] prose-p:my-2 prose-p:text-[var(--ink-soft)] prose-strong:text-[var(--ink)] prose-ul:pl-5 prose-li:my-1 prose-li:text-[var(--ink-soft)]"
                    dangerouslySetInnerHTML={{ __html: person.bio }}
                />
            )}
        </article>
    );
}
