import { z } from "zod";
import { slugSchema } from "@/lib/validators";

const optionalTrimmedString = z
    .string()
    .optional()
    .transform((value) => {
        if (typeof value !== "string") return undefined;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    });

export const adminHomepageLocaleSchema = z.object({
    title: z.string().default(""),
    subtitle: z.string().default(""),
});

export const adminServiceSectionSchema = z.object({
    id: z.string().optional(),
    sectionKey: slugSchema,
    title: z.string().min(1, "Section title is required"),
    title_en: optionalTrimmedString.nullable().optional(),
    content: z.string().default(""),
    content_en: optionalTrimmedString.nullable().optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

export const adminServiceEditorSchema = z.object({
    title: z.string().min(1, "Title is required"),
    title_en: optionalTrimmedString.nullable().optional(),
    slug: slugSchema,
    content: z.string().default(""),
    content_en: optionalTrimmedString.nullable().optional(),
    isPublished: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
    metaTitle: optionalTrimmedString.nullable().optional(),
    metaTitle_en: optionalTrimmedString.nullable().optional(),
    metaDescription: optionalTrimmedString.nullable().optional(),
    metaDescription_en: optionalTrimmedString.nullable().optional(),
    sections: z.array(adminServiceSectionSchema).default([]),
});

export const adminPostEditorSchema = z.object({
    title: z.string().min(1, "Title is required"),
    title_en: optionalTrimmedString.nullable().optional(),
    slug: slugSchema,
    excerpt: z.string().default(""),
    excerpt_en: optionalTrimmedString.nullable().optional(),
    content: z.string().default(""),
    content_en: optionalTrimmedString.nullable().optional(),
    categoryId: z.string().min(1, "Category is required"),
    featuredImage: z.string().optional().nullable(),
    featuredImage_en: z.string().optional().nullable(),
    isFeatured: z.boolean().default(false),
    isPublished: z.boolean().default(false),
    metaTitle: optionalTrimmedString.nullable().optional(),
    metaTitle_en: optionalTrimmedString.nullable().optional(),
    metaDescription: optionalTrimmedString.nullable().optional(),
    metaDescription_en: optionalTrimmedString.nullable().optional(),
    tagIds: z.array(z.string()).default([]),
});

export const adminTagSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: slugSchema,
});

export const adminReviewSchema = z.object({
    name: z.string().min(1, "Name is required"),
    role: optionalTrimmedString.nullable().optional(),
    role_en: optionalTrimmedString.nullable().optional(),
    company: optionalTrimmedString.nullable().optional(),
    company_en: optionalTrimmedString.nullable().optional(),
    content: z.string().min(1, "Review content is required"),
    content_en: optionalTrimmedString.nullable().optional(),
    rating: z.number().int().min(1).max(5).default(5),
    avatarId: z.string().nullable().optional(),
    sortOrder: z.number().int().min(0).default(0),
    isActive: z.boolean().default(true),
});
