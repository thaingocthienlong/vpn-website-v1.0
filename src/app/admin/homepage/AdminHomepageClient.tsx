"use client";

import React, { useState, useEffect } from "react";
import { Edit, ChevronUp, ChevronDown, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import TailwindColorPicker from "@/components/admin/TailwindColorPicker";

type HomepageSection = {
    id: string;
    sectionKey: string;
    locale: string;
    title: string | null;
    title_en: string | null;
    subtitle: string | null;
    subtitle_en: string | null;
    isEnabled: boolean;
    sortOrder: number;
    config: string | null; // JSON string
};

type Course = {
    id: string;
    title: string;
    title_en: string;
    slug: string;
    isPublished?: boolean;
};

export default function AdminHomepageClient() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Editor State
    const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
    const [editForm, setEditForm] = useState<any>({}); // Parsed config + title

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/homepage").then((r) => r.json()),
            fetch("/api/admin/courses").then((r) => r.json()),
            fetch("/api/admin/services").then((r) => r.json()),
            fetch("/api/admin/posts").then((r) => r.json()),
            fetch("/api/admin/reviews").then((r) => r.json())
        ]).then(([sectionsRes, coursesRes, servicesRes, postsRes, reviewsRes]) => {
            if (sectionsRes.success) {
                // Let's only deal with 'vi' for the layout structure, or group them if needed.
                // For simplicity, we just sort them by sortOrder. We'll show all and edit the common DB fields.
                // Actually the API returns all locales. Usually we edit section layout globally, but title per locale.
                // We'll list unique sectionKeys and their 'vi' record, then update 'vi' (and 'en' optionally).
                const viSections = sectionsRes.data.filter((s: any) => s.locale === "vi");
                // If a section doesn't exist in vi, use en
                const allSections = viSections; 
                setSections(allSections.sort((a: any, b: any) => a.sortOrder - b.sortOrder));
            }
            if (coursesRes.success) {
                setCourses(coursesRes.data?.courses || coursesRes.data || []);
            }
            if (servicesRes.success) {
                setServices(servicesRes.data || []);
            }
            if (postsRes.success) {
                setPosts(postsRes.data?.posts || postsRes.data || []);
            }
            if (reviewsRes.success) {
                setReviews(reviewsRes.data || []);
            }
            setLoading(false);
        });
    }, []);

    const handleReorder = async (index: number, direction: -1 | 1) => {
        const newSections = [...sections];
        const targetIndex = index + direction;
        
        if (targetIndex < 0 || targetIndex >= newSections.length) return;
        
        // Swap
        const temp = newSections[index];
        newSections[index] = newSections[targetIndex];
        newSections[targetIndex] = temp;
        
        // Update sortOrder values
        const updatedItems = newSections.map((sec, i) => ({ id: sec.id, sortOrder: i * 10 }));
        
        setSections(newSections.map((sec, i) => ({ ...sec, sortOrder: i * 10 })));
        
        // Save to backend
        try {
            await fetch("/api/admin/homepage/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: updatedItems }),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const toggleEnabled = async (section: HomepageSection, index: number) => {
        const newEnabled = !section.isEnabled;
        
        const newSections = [...sections];
        newSections[index].isEnabled = newEnabled;
        setSections(newSections);

        try {
            await fetch("/api/admin/homepage", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: section.id, isEnabled: newEnabled }),
            });
        } catch (error) {
            console.error(error);
        }
    };

    const openEditor = (section: HomepageSection) => {
        setEditingSection(section);
        let parsedConfig: any = {};
        try {
            if (section.config) parsedConfig = JSON.parse(section.config);
        } catch (e) {
            console.error("Failed to parse config", e);
        }
        setEditForm({
            title: section.title || "",
            title_en: section.title_en || "",
            subtitle: section.subtitle || "",
            subtitle_en: section.subtitle_en || "",
            background: parsedConfig.background || "transparent",
            textColor: parsedConfig.textColor || "",
            backdropBlur: parsedConfig.backdropBlur || "none",
            ...parsedConfig
        });
    };

    const renderMultiSelect = (label: string, fieldName: string, items: any[], itemLabelKey = "title") => {
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">{label}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto p-2 border rounded-xl bg-slate-50">
                    {items.map(item => {
                        const isSelected = (editForm[fieldName] || []).includes(item.id);
                        return (
                            <label key={item.id} className="flex items-center gap-2 p-2 hover:bg-white rounded border border-transparent hover:border-slate-200 cursor-pointer transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onChange={(e) => {
                                        const currentIds = editForm[fieldName] || [];
                                        if (e.target.checked) {
                                            setEditForm({...editForm, [fieldName]: [...currentIds, item.id].filter(Boolean)});
                                        } else {
                                            setEditForm({...editForm, [fieldName]: currentIds.filter((id: string) => id !== item.id)});
                                        }
                                    }}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-sm line-clamp-1">
                                    {itemLabelKey === "name" ? item.name : item.title} 
                                    {item.isPublished === false || item.isActive === false ? " (Hidden)" : ""}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderVideoConfig = () => {
        const videos = editForm.videos || [];
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Videos Configuration</h3>
                {videos.map((vid: any, i: number) => (
                    <div key={i} className="p-4 border rounded-xl bg-slate-50 space-y-3 relative">
                        <button onClick={() => {
                            const newVids = [...videos];
                            newVids.splice(i, 1);
                            setEditForm({...editForm, videos: newVids});
                        }} className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 rounded">✕</button>
                        <input className="w-full px-4 py-2 border rounded-xl outline-none text-sm focus:border-blue-500 pr-8" value={vid.title || ""} onChange={e => { const v = [...videos]; v[i].title = e.target.value; setEditForm({...editForm, videos: v}); }} placeholder="Video Title" />
                        <input className="w-full px-4 py-2 border rounded-xl outline-none text-sm focus:border-blue-500" value={vid.thumbnailUrl || ""} onChange={e => { const v = [...videos]; v[i].thumbnailUrl = e.target.value; setEditForm({...editForm, videos: v}); }} placeholder="Thumbnail URL" />
                        <input className="w-full px-4 py-2 border rounded-xl outline-none text-sm focus:border-blue-500" value={vid.videoUrl || ""} onChange={e => { const v = [...videos]; v[i].videoUrl = e.target.value; setEditForm({...editForm, videos: v}); }} placeholder="Video URL (e.g., YouTube URL)" />
                    </div>
                ))}
                <button onClick={() => setEditForm({...editForm, videos: [...videos, {id: Date.now().toString(), title: "", thumbnailUrl: "", videoUrl: ""}]})} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium">+ Add Video</button>
            </div>
        );
    };

    const renderGalleryConfig = () => {
        const images = editForm.images || [];
        return (
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Gallery Configuration</h3>
                {images.map((img: any, i: number) => (
                    <div key={i} className="p-4 border rounded-xl bg-slate-50 space-y-3 relative grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button onClick={() => {
                            const newImgs = [...images];
                            newImgs.splice(i, 1);
                            setEditForm({...editForm, images: newImgs});
                        }} className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-white shadow-sm border text-red-500 hover:bg-red-50 rounded-full z-10">✕</button>
                        <input className="w-full px-4 py-2 border rounded-xl outline-none text-sm focus:border-blue-500" value={img.alt || ""} onChange={e => { const v = [...images]; v[i].alt = e.target.value; setEditForm({...editForm, images: v}); }} placeholder="Image Alt Text" />
                        <input className="w-full px-4 py-2 border rounded-xl outline-none text-sm focus:border-blue-500" value={img.url || ""} onChange={e => { const v = [...images]; v[i].url = e.target.value; setEditForm({...editForm, images: v}); }} placeholder="Image URL" />
                    </div>
                ))}
                <button onClick={() => setEditForm({...editForm, images: [...images, {id: Date.now().toString(), url: "", alt: ""}]})} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium">+ Add Image</button>
            </div>
        );
    };

    const saveEditor = async () => {
        if (!editingSection) return;
        setSaving(true);
        
        // Extract DB fields vs config fields
        const { title, title_en, subtitle, subtitle_en, background, textColor, backdropBlur, ...configData } = editForm;

        // Strip empty strings from arrays for final config
        if (configData.featuredCourseIds && Array.isArray(configData.featuredCourseIds)) {
            configData.featuredCourseIds = configData.featuredCourseIds.filter(Boolean);
        }
        if (configData.featuredServiceIds && Array.isArray(configData.featuredServiceIds)) {
            configData.featuredServiceIds = configData.featuredServiceIds.filter(Boolean);
        }
        if (configData.featuredPostIds && Array.isArray(configData.featuredPostIds)) {
            configData.featuredPostIds = configData.featuredPostIds.filter(Boolean);
        }
        if (configData.featuredReviewIds && Array.isArray(configData.featuredReviewIds)) {
            configData.featuredReviewIds = configData.featuredReviewIds.filter(Boolean);
        }
        
        // Put color config back into config
        if (background) configData.background = background;
        if (textColor) configData.textColor = textColor;
        if (backdropBlur && backdropBlur !== "none") configData.backdropBlur = backdropBlur;

        try {
            const res = await fetch("/api/admin/homepage", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingSection.id,
                    title,
                    title_en,
                    subtitle,
                    subtitle_en,
                    config: JSON.stringify(configData)
                }),
            });
            const data = await res.json();
            
            if (data.success) {
                // Update local state
                setSections(sections.map(s => s.id === editingSection.id ? {
                    ...s,
                    title,
                    title_en,
                    subtitle,
                    subtitle_en,
                    config: JSON.stringify(configData)
                } : s));
                setEditingSection(null);
            } else {
                alert("Failed to save: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 font-semibold bg-slate-50 border-b border-slate-200 text-slate-600 px-6">
                    <div>Order</div>
                    <div>Section Name (Key)</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>
                
                <div className="divide-y divide-slate-100">
                    {sections.map((section, index) => (
                        <div key={section.id} className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 p-4 px-6 transition-colors ${!section.isEnabled ? "bg-slate-50 text-slate-400" : "hover:bg-slate-50"}`}>
                            {/* Order arrows */}
                            <div className="flex flex-col items-center">
                                <button disabled={index === 0} onClick={() => handleReorder(index, -1)} className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors">
                                    <ChevronUp className="w-5 h-5" />
                                </button>
                                <button disabled={index === sections.length - 1} onClick={() => handleReorder(index, 1)} className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors">
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Info */}
                            <div>
                                <h3 className="font-medium text-lg capitalize">{section.sectionKey} Section</h3>
                                <p className="text-sm opacity-80">{section.title || "No custom title"}</p>
                            </div>

                            {/* Status */}
                            <button 
                                onClick={() => toggleEnabled(section, index)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${section.isEnabled ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}
                            >
                                {section.isEnabled ? <><Eye className="w-4 h-4" /> Enabled</> : <><EyeOff className="w-4 h-4" /> Hidden</>}
                            </button>

                            {/* Actions */}
                            <button 
                                onClick={() => openEditor(section)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 shadow-sm"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                    
                    {sections.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No sections found in the database. Ensure database is seeded.
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Editor */}
            {editingSection && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold capitalize text-slate-800">Edit {editingSection.sectionKey} Section</h2>
                            <button onClick={() => setEditingSection(null)} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Standard Fields (Title/Subtitle) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Section Title (VI)</label>
                                    <input type="text" value={editForm.title || ""} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Tiêu đề..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Section Title (EN)</label>
                                    <input type="text" value={editForm.title_en || ""} onChange={e => setEditForm({...editForm, title_en: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Title..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Subtitle (VI)</label>
                                    <input type="text" value={editForm.subtitle || ""} onChange={e => setEditForm({...editForm, subtitle: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Mô tả phụ..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Subtitle (EN)</label>
                                    <input type="text" value={editForm.subtitle_en || ""} onChange={e => setEditForm({...editForm, subtitle_en: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Subtitle..." />
                                </div>
                                <div className="col-span-2">
                                    <TailwindColorPicker
                                        label="Section Background"
                                        value={editForm.background || "transparent"}
                                        onChange={(v) => setEditForm({...editForm, background: v})}
                                        showBlur
                                        blurValue={editForm.backdropBlur || "none"}
                                        onBlurChange={(v) => setEditForm({...editForm, backdropBlur: v})}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <TailwindColorPicker
                                        label="Section Text Color"
                                        value={editForm.textColor || ""}
                                        onChange={(v) => setEditForm({...editForm, textColor: v})}
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100 my-4" />

                            {/* Dedicated Config Fields based on sectionKey */}
                            {editingSection.sectionKey === "hero" && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Hero Section Configuration</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Background Video URL</label>
                                        <input type="text" value={editForm.videoUrl || ""} onChange={e => setEditForm({...editForm, videoUrl: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="https://videos.pexels.com/..." />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Primary CTA Text</label>
                                        <input type="text" value={editForm.ctaPrimaryText || ""} onChange={e => setEditForm({...editForm, ctaPrimaryText: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Our Services" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Primary CTA Link</label>
                                        <input type="text" value={editForm.ctaPrimaryLink || ""} onChange={e => setEditForm({...editForm, ctaPrimaryLink: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="/services" />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Featured Courses (Select up to 2)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {/* Course 1 Dropdown */}
                                            <select 
                                                value={editForm.featuredCourseIds?.[0] || ""} 
                                                onChange={e => {
                                                    const ids = [...(editForm.featuredCourseIds || [])];
                                                    ids[0] = e.target.value;
                                                    setEditForm({...editForm, featuredCourseIds: ids});
                                                }}
                                                className="w-full px-4 py-2 border rounded-xl bg-white"
                                            >
                                                <option value="">-- Select Course 1 --</option>
                                                {courses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.title} {c.isPublished === false ? "(Unpublished)" : ""}</option>
                                                ))}
                                            </select>
                                            
                                            {/* Course 2 Dropdown */}
                                            <select 
                                                value={editForm.featuredCourseIds?.[1] || ""} 
                                                onChange={e => {
                                                    const ids = [...(editForm.featuredCourseIds || [])];
                                                    // Ensure array has at least an empty string at index 0 if it was empty
                                                    if (ids.length === 0) ids.push("");
                                                    ids[1] = e.target.value;
                                                    setEditForm({...editForm, featuredCourseIds: ids});
                                                }}
                                                className="w-full px-4 py-2 border rounded-xl bg-white"
                                            >
                                                <option value="">-- Select Course 2 --</option>
                                                {courses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.title} {c.isPublished === false ? "(Unpublished)" : ""}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editingSection.sectionKey === "training" && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Training Section Configuration</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Display Count Limit (Default: 6)</label>
                                        <input type="number" min="1" max="15" value={editForm.displayCount || ""} onChange={e => setEditForm({...editForm, displayCount: parseInt(e.target.value) || 6})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="6" />
                                    </div>

                                    {renderMultiSelect("Select Specific Courses (Leave empty to show all featured)", "featuredCourseIds", courses, "title")}
                                </div>
                            )}

                            {editingSection.sectionKey === "services" && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Services Section Configuration</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Display Count Limit (Default: 6)</label>
                                        <input type="number" min="1" max="15" value={editForm.displayCount || ""} onChange={e => setEditForm({...editForm, displayCount: parseInt(e.target.value) || 6})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="6" />
                                    </div>

                                    {renderMultiSelect("Select Specific Services (Leave empty to show all featured)", "featuredServiceIds", services, "title")}
                                </div>
                            )}

                            {editingSection.sectionKey === "news" && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">News Section Configuration</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Display Count Limit (Default: 3)</label>
                                        <input type="number" min="1" max="15" value={editForm.displayCount || ""} onChange={e => setEditForm({...editForm, displayCount: parseInt(e.target.value) || 3})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="3" />
                                    </div>

                                    {renderMultiSelect("Select Specific Posts (Leave empty to show all featured)", "featuredPostIds", posts, "title")}
                                </div>
                            )}

                            {editingSection.sectionKey === "reviews" && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Reviews Section Configuration</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Display Count Limit (Default: 10)</label>
                                        <input type="number" min="1" max="25" value={editForm.displayCount || ""} onChange={e => setEditForm({...editForm, displayCount: parseInt(e.target.value) || 10})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="10" />
                                    </div>

                                    {renderMultiSelect("Select Specific Reviews (Leave empty to show all featured)", "featuredReviewIds", reviews, "name")}
                                </div>
                            )}

                            {editingSection.sectionKey === "videos" && renderVideoConfig()}

                            {editingSection.sectionKey === "gallery" && renderGalleryConfig()}

                            {editingSection.sectionKey === "cta" && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">CTA Section Configuration</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Primary CTA Text</label>
                                            <input type="text" value={editForm.primaryCTA?.text || ""} onChange={e => setEditForm({...editForm, primaryCTA: {...(editForm.primaryCTA || {}), text: e.target.value}})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Register" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Primary CTA Link</label>
                                            <input type="text" value={editForm.primaryCTA?.href || ""} onChange={e => setEditForm({...editForm, primaryCTA: {...(editForm.primaryCTA || {}), href: e.target.value}})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="/contact" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Secondary CTA Text</label>
                                            <input type="text" value={editForm.secondaryCTA?.text || ""} onChange={e => setEditForm({...editForm, secondaryCTA: {...(editForm.secondaryCTA || {}), text: e.target.value}})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="View Courses" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Secondary CTA Link</label>
                                            <input type="text" value={editForm.secondaryCTA?.href || ""} onChange={e => setEditForm({...editForm, secondaryCTA: {...(editForm.secondaryCTA || {}), href: e.target.value}})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="/training" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Phone</label>
                                            <input type="text" value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="012 345 6789" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Email</label>
                                            <input type="email" value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="contact@example.com" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editingSection.sectionKey === "contact" && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-800">Contact Section Configuration</h3>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-sm font-medium text-slate-700">Address</label>
                                            <input type="text" value={editForm.address || ""} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="123 Street Name, City" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Phone</label>
                                            <input type="text" value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="012 345 6789" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Email</label>
                                            <input type="email" value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="contact@example.com" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-sm font-medium text-slate-700">Working Hours</label>
                                            <input type="text" value={editForm.hours || ""} onChange={e => setEditForm({...editForm, hours: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Mon-Fri: 9AM - 5PM" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Generic fallback for other sections */}
                            {!["hero", "training", "services", "news", "reviews", "videos", "gallery", "cta", "contact"].includes(editingSection.sectionKey) && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Custom JSON Config (Optional)</label>
                                    <textarea 
                                        rows={4}
                                        value={JSON.stringify(Object.fromEntries(Object.entries(editForm).filter(([k]) => !['title', 'title_en', 'subtitle', 'subtitle_en'].includes(k))), null, 2)}
                                        onChange={e => {
                                            try {
                                                const parsed = JSON.parse(e.target.value);
                                                setEditForm({
                                                    title: editForm.title, title_en: editForm.title_en,
                                                    subtitle: editForm.subtitle, subtitle_en: editForm.subtitle_en,
                                                    background: editForm.background,
                                                    ...parsed
                                                });
                                            } catch (err) {} // ignore invalid JSON while typing
                                        }}
                                        className="w-full px-4 py-2 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500" 
                                    />
                                    <p className="text-xs text-slate-500">Must be valid JSON if editing directly.</p>
                                </div>
                            )}

                        </div>
                        
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                            <button onClick={() => setEditingSection(null)} className="px-6 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={saveEditor} disabled={saving} className="px-6 py-2.5 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50">
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
