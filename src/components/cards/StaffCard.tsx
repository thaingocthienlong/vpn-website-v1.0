
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Media, Staff } from '@prisma/client';

interface StaffCardProps {
    person: Staff & { avatar: Media | null };
    variant?: 'default' | 'large';
    className?: string;
}

export function StaffCard({ person, variant = 'default', className }: StaffCardProps) {
    const isLarge = variant === 'large';

    return (
        <div className={cn(
            "group flex flex-col items-center text-center bg-white shadow-sm rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-100",
            isLarge ? "p-6" : "p-4",
            className
        )}>
            <div className={cn(
                "relative overflow-hidden rounded-full border-4 border-slate-100 shadow-sm bg-white mb-4",
                isLarge ? "w-48 h-48" : "w-32 h-32"
            )}>
                {person.avatar ? (
                    <Image
                        src={person.avatar.secureUrl || person.avatar.url}
                        alt={person.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes={isLarge ? "192px" : "128px"}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-400">
                        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                )}
            </div>

            <h3 className={cn(
                "font-bold text-slate-900 group-hover:text-primary transition-colors",
                isLarge ? "text-xl mb-1" : "text-lg mb-1"
            )}>
                {person.name}
            </h3>

            {person.title && (
                <p className={cn(
                    "text-slate-500 font-medium tracking-wide mb-2 text-center",
                    isLarge ? "text-sm" : "text-xs"
                )}>
                    {person.title}
                </p>
            )}

            {person.bio && (
                <div
                    className={cn(
                        "text-slate-700 prose prose-sm max-w-none w-full text-left prose-p:my-1 prose-strong:text-primary prose-strong:font-bold prose-ul:list-disc prose-ul:pl-4 prose-li:my-0.5",
                        isLarge ? "text-sm" : "text-xs"
                    )}
                    dangerouslySetInnerHTML={{ __html: person.bio }}
                />
            )}
        </div>
    );
}
