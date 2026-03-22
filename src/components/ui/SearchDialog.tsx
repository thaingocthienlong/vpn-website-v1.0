"use client";

import * as React from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Search, Loader2, BookOpen, FileText, Briefcase } from "lucide-react";
import Link from "next/link";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";

interface SearchResult {
    id: string;
    title: string;
    url: string;
    image?: string;
    type: string;
}

interface SearchResponse {
    courses: SearchResult[];
    posts: SearchResult[];
    services: SearchResult[];
}

interface SearchDialogProps {
    isOpen: boolean;
    onClose: () => void;
    locale?: string;
}

export function SearchDialog({ isOpen, onClose, locale = "vi" }: SearchDialogProps) {
    const [query, setQuery] = React.useState("");
    const debouncedQuery = useDebounce(query, 500);
    const [results, setResults] = React.useState<SearchResponse | null>(null);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) {
            setQuery("");
            setResults(null);
        }
    }, [isOpen]);

    React.useEffect(() => {
        async function performSearch() {
            if (debouncedQuery.length < 2) {
                setResults(null);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&locale=${locale}`);
                const data = await res.json();
                if (data.success) {
                    setResults(data.data);
                }
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setLoading(false);
            }
        }

        performSearch();
    }, [debouncedQuery, locale]);

    const hasResults = results && (
        results.courses.length > 0 ||
        results.posts.length > 0 ||
        results.services.length > 0
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-800" />
                    <Input
                        placeholder={locale === "en" ? "Search courses, news..." : "Tìm kiếm khóa học, tin tức..."}
                        className="pl-10 h-12 text-lg"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    {loading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500 animate-spin" />
                    )}
                </div>

                <div className="min-h-[200px] max-h-[60vh] overflow-y-auto">
                    {!query && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-800">
                            <Search className="h-12 w-12 mb-2 opacity-20" />
                            <p>{locale === "en" ? "Enter keyword to search" : "Nhập từ khóa để tìm kiếm"}</p>
                        </div>
                    )}

                    {debouncedQuery.length >= 2 && !loading && !hasResults && (
                        <div className="text-center py-12 text-slate-500">
                            <p>{locale === "en" ? "No results found" : "Không tìm thấy kết quả nào"}</p>
                        </div>
                    )}

                    {hasResults && (
                        <div className="space-y-6">
                            {/* Courses */}
                            {results!.courses.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        {locale === "en" ? "Training" : "Đào tạo"}
                                    </h3>
                                    <div className="space-y-2">
                                        {results!.courses.map((item) => (
                                            <ResultItem key={item.id} item={item} onClose={onClose} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services */}
                            {results!.services.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        {locale === "en" ? "Services" : "Dịch vụ"}
                                    </h3>
                                    <div className="space-y-2">
                                        {results!.services.map((item) => (
                                            <ResultItem key={item.id} item={item} onClose={onClose} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* News */}
                            {results!.posts.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        {locale === "en" ? "News" : "Tin tức"}
                                    </h3>
                                    <div className="space-y-2">
                                        {results!.posts.map((item) => (
                                            <ResultItem key={item.id} item={item} onClose={onClose} />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

function ResultItem({ item, onClose }: { item: SearchResult; onClose: () => void }) {
    return (
        <Link
            href={item.url}
            onClick={onClose}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors group"
        >
            {item.image ? (
                <div className="h-10 w-10 shrink-0 rounded-md overflow-hidden bg-white relative">
                    <Image src={item.image} alt="" fill className="object-cover" />
                </div>
            ) : (
                <div className="h-10 w-10 shrink-0 rounded-md bg-blue-50 flex items-center justify-center text-blue-400">
                    <HashIcon type={item.type} />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <h4 className="font-medium text-slate-800 truncate group-hover:text-blue-400 transition-colors">
                    {item.title}
                </h4>
                <p className="text-xs text-slate-800">{item.type}</p>
            </div>
        </Link>
    );
}

function HashIcon({ type }: { type: string }) {
    if (type.toLowerCase().includes("service")) {
        return <Briefcase className="h-5 w-5" />;
    }

    if (type.toLowerCase().includes("news") || type.toLowerCase().includes("tin")) {
        return <FileText className="h-5 w-5" />;
    }

    if (type.toLowerCase().includes("training") || type.toLowerCase().includes("đào")) {
        return <BookOpen className="h-5 w-5" />;
    }

    return <Search className="h-5 w-5" />;
}
