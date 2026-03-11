"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";

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
        <article className="bg-white rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-primary p-6 h-full flex flex-col">
            {/* Quote icon */}
            <div className="mb-4">
                <Quote className="w-8 h-8 text-blue-500/40" />
            </div>

            {/* Content */}
            <p className="text-slate-800 italic leading-relaxed mb-6 flex-1">
                "{content}"
            </p>

            {/* Rating */}
            {rating > 0 && (
                <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                {avatar ? (
                    <Image
                        src={avatar}
                        alt={name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                        {name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <p className="font-semibold text-slate-800">{name}</p>
                    {(role || company) && (
                        <p className="text-sm text-slate-800">
                            {role}
                            {role && company && " - "}
                            {company}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

export default ReviewCard;
