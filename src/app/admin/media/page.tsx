"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
    Image as ImageIcon, Trash2, Search, RefreshCw, ScanSearch,
    CheckSquare, Square, Loader2, HardDriveDownload, AlertTriangle, X
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface MediaItem {
    id: string;
    publicId: string | null;
    filename: string;
    format: string | null;
    url: string;
    secureUrl: string | null;
    size: number;
    width: number | null;
    height: number | null;
    createdAt: string;
    uploadedBy?: { name: string };
}

interface ScanResult {
    total: number;
    usedCount: number;
    unusedCount: number;
    unused: { id: string; url: string; filename: string; publicId: string | null }[];
}

export default function MediaPage() {
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Selection
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Scan
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);

    // Sync
    const [syncing, setSyncing] = useState(false);

    // Delete
    const [deleting, setDeleting] = useState(false);

    // Preview
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: "24" });
            if (search) params.append("search", search);
            const res = await fetch(`/api/admin/media?${params}`);
            const data = await res.json();
            if (data.success) {
                setMedia(data.data.items);
                setTotalPages(data.data.meta.totalPages);
                setTotal(data.data.meta.total);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchMedia(); }, [fetchMedia]);

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selected.size === media.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(media.map(m => m.id)));
        }
    };

    const handleDelete = async (ids?: string[]) => {
        const toDelete = ids || Array.from(selected);
        if (toDelete.length === 0) return;
        if (!confirm(`Bạn có chắc chắn muốn xóa ${toDelete.length} file? Ảnh sẽ bị xóa khỏi Cloudinary và database.`)) return;

        setDeleting(true);
        try {
            const res = await fetch("/api/admin/media", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: toDelete }),
            });
            if (res.ok) {
                setSelected(new Set());
                setScanResult(null);
                fetchMedia();
            } else {
                alert("Lỗi xóa file");
            }
        } catch (e) {
            alert("Lỗi xóa file");
        } finally {
            setDeleting(false);
        }
    };

    const handleScan = async () => {
        setScanning(true);
        setScanResult(null);
        try {
            const res = await fetch("/api/admin/media/scan", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setScanResult(data.data);
            } else {
                alert("Lỗi quét: " + (data.error || "Unknown"));
            }
        } catch (e) {
            alert("Lỗi quét media");
        } finally {
            setScanning(false);
        }
    };

    const handleSync = async () => {
        if (!confirm("Đồng bộ tất cả ảnh từ Cloudinary vào database? Quá trình này có thể mất vài phút.")) return;
        setSyncing(true);
        try {
            const res = await fetch("/api/admin/media/sync", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                alert(`Đồng bộ hoàn tất! ${data.data.synced} file mới, ${data.data.skipped} file đã có sẵn.`);
                fetchMedia();
            } else {
                alert("Lỗi đồng bộ: " + (data.error || "Unknown"));
            }
        } catch (e) {
            alert("Lỗi đồng bộ");
        } finally {
            setSyncing(false);
        }
    };

    const handleCleanUnused = async () => {
        if (!scanResult || scanResult.unusedCount === 0) return;
        if (!confirm(`Xóa ${scanResult.unusedCount} file không sử dụng? File sẽ bị xóa vĩnh viễn khỏi Cloudinary.`)) return;
        await handleDelete(scanResult.unused.map(u => u.id));
        setScanResult(null);
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Thư viện Media</h1>
                    <p className="text-slate-500">Quản lý tất cả hình ảnh đã upload. Tổng: {total} file.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSync} disabled={syncing} className="text-sm">
                        {syncing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <HardDriveDownload className="w-4 h-4 mr-1" />}
                        Đồng bộ Cloudinary
                    </Button>
                    <Button variant="outline" onClick={handleScan} disabled={scanning} className="text-sm">
                        {scanning ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ScanSearch className="w-4 h-4 mr-1" />}
                        Quét ảnh không dùng
                    </Button>
                </div>
            </div>

            {/* Scan Results Banner */}
            {scanResult && (
                <div className={`rounded-xl border p-4 ${scanResult.unusedCount > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className={`font-semibold ${scanResult.unusedCount > 0 ? "text-amber-800" : "text-green-800"}`}>
                                {scanResult.unusedCount > 0 ? (
                                    <><AlertTriangle className="w-4 h-4 inline mr-1" /> Tìm thấy {scanResult.unusedCount} file không sử dụng</>
                                ) : (
                                    "✅ Tất cả file đều đang được sử dụng!"
                                )}
                            </h3>
                            <p className="text-sm mt-1 text-slate-600">
                                Tổng: {scanResult.total} | Đang dùng: {scanResult.usedCount} | Không dùng: {scanResult.unusedCount}
                            </p>
                        </div>
                        <div className="flex gap-2 items-center">
                            {scanResult.unusedCount > 0 && (
                                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleCleanUnused} disabled={deleting}>
                                    {deleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                                    Xóa {scanResult.unusedCount} file
                                </Button>
                            )}
                            <button onClick={() => setScanResult(null)} className="text-white hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 items-center flex-wrap">
                    <div className="relative flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
                        <Input
                            placeholder="Tìm theo tên file..."
                            className="pl-9"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    {selected.size > 0 && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete()} disabled={deleting}>
                            {deleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                            Xóa {selected.size} file
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={selectAll}>
                        {selected.size === media.length && media.length > 0 ? <CheckSquare className="w-4 h-4 mr-1" /> : <Square className="w-4 h-4 mr-1" />}
                        {selected.size === media.length && media.length > 0 ? "Bỏ chọn" : "Chọn tất cả"}
                    </Button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Đang tải...
                    </div>
                ) : media.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-white" />
                        <p>Chưa có file nào trong thư viện.</p>
                        <p className="text-sm mt-1">Nhấn "Đồng bộ Cloudinary" để import ảnh có sẵn.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 p-2">
                        {media.map(item => (
                            <div
                                key={item.id}
                                className={`group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selected.has(item.id) ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-slate-300"
                                    }`}
                                onClick={() => toggleSelect(item.id)}
                                onDoubleClick={() => setPreviewUrl(item.url)}
                            >
                                <img
                                    src={item.url}
                                    alt={item.filename}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="absolute bottom-0 left-0 right-0 p-2">
                                        <p className="text-white text-xs truncate">{item.filename}</p>
                                        <p className="text-white text-[10px]">
                                            {formatSize(item.size)}
                                            {item.width && item.height && ` • ${item.width}×${item.height}`}
                                        </p>
                                    </div>
                                </div>
                                {/* Checkbox */}
                                <div className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selected.has(item.id) ? "bg-blue-500 border-blue-500" : "bg-white/70 border-white/50 opacity-0 group-hover:opacity-100"
                                    }`}>
                                    {selected.has(item.id) && <span className="text-white text-xs">✓</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex justify-center gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trước</Button>
                        <span className="text-sm flex items-center px-2 text-slate-600">Trang {page} / {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sau</Button>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
                    <button className="absolute top-4 right-4 text-white hover:text-white" onClick={() => setPreviewUrl(null)}>
                        <X className="w-8 h-8" />
                    </button>
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
