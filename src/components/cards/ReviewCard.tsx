"use client";

import Image from "next/image";
import { Star, Quote, CheckCircle2 } from "lucide-react";

interface ReviewCardProps {
    name: string;
    role?: string;
    company?: string;
    content: string;
    avatar?: string | null;
    rating?: number;
}

export function ReviewCard({
    name,
    role,
    company,
    content,
    avatar,
    rating = 5,
}: ReviewCardProps) {
    return (
        <article className="rounded-2xl border border-slate-100 bg-white p-8 h-auto min-h-[260px] flex flex-col shadow-sm transition-all duration-300 hover:shadow-md relative overflow-hidden group">
            {/* Background subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Quote icon */}
            <div className="mb-6 relative z-10 flex justify-between items-start">
                <Quote className="w-10 h-10 text-blue-500/20" />
                {/* Rating */}
                {rating > 0 && (
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${i < rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-200 text-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <p className="text-slate-800 md:text-lg italic leading-relaxed mb-8 flex-1 relative z-10 font-light">
                &quot;{content}&quot;
            </p>

            {/* Author */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200/60 relative z-10">
                {avatar ? (
                    <Image
                        src={avatar}
                        alt={name}
                        width={56}
                        height={56}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-slate-100"
                    />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-slate-100 shrink-0">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-slate-900 tracking-wide">{name}</p>
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] uppercase text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-full tracking-wider hidden sm:inline-block">
                            Verified
                        </span>
                    </div>
                    {(role || company) && (
                        <p className="text-sm text-slate-500 font-light">
                            {role}
                            {role && company && " • "}
                            {company}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

export default ReviewCard;
