// ==================== ENUMS ====================

export type UserRole = "SUPER_ADMIN" | "CONTENT_EDITOR" | "COURSE_MANAGER";
export type CategoryType = "POST" | "COURSE" | "ADMISSION";
export type PostType = "ORIGINAL" | "REPOST";
export type CourseType = "ADMISSION" | "SHORT_COURSE" | "STUDY_ABROAD";
export type RegistrationStatus = "NEW" | "CONTACTED" | "ENROLLED" | "CANCELLED";
export type ContactStatus = "NEW" | "READ" | "REPLIED";
export type ConfigType = "STRING" | "JSON" | "BOOLEAN" | "NUMBER";
export type Locale = "VI" | "EN";
export type EntityType = "COURSE" | "SERVICE";

// ==================== API RESPONSE ====================

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
    error?: {
        code: string;
        message: string;
        details?: Array<{ field: string; message: string }>;
    };
}

// ==================== COMMON TYPES ====================

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SeoFields {
    metaTitle?: string | null;
    metaDescription?: string | null;
}

export interface BilingualFields {
    title: string;
    title_en?: string | null;
}

// ==================== HOMEPAGE ====================

export interface HomepageSectionConfig {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaUrl?: string;
    showCount?: number;
    style?: "grid" | "carousel" | "list";
}

export interface HomepageSectionData {
    id: string;
    sectionKey: string;
    isEnabled: boolean;
    sortOrder: number;
    config: HomepageSectionConfig;
}

// ==================== CONTENT SECTION (Dynamic) ====================

export interface ContentSectionData {
    id: string;
    title: string;
    content: string;
    order: number;
}

export interface TableOfContentsItem {
    id: string;
    title: string;
    order: number;
}

// ==================== PUBLIC API RESPONSES ====================

export interface PostListItem {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    category: { name: string; slug: string };
    author: { name: string };
    publishedAt: string | null;
    viewCount: number;
}

export interface CourseListItem {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    isFeatured: boolean;
    category: { name: string; slug: string } | null;
}

export interface CourseDetail {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featuredImage: string | null;
    category: { name: string; slug: string } | null;
    isFeatured: boolean;
    publishedAt: string | null;
    viewCount: number;
    tableOfContents: TableOfContentsItem[];
    sections: ContentSectionData[];
    seo: SeoFields;
    relatedCourses: CourseListItem[];
}

export interface StaffMember {
    id: string;
    name: string;
    title: string | null;
    photo: string | null;
    bio: string | null;
    staffType: string;
    department: string | null;
}

export interface PartnerData {
    id: string;
    name: string;
    logo: string | null;
    website: string | null;
    sortOrder: number;
}
