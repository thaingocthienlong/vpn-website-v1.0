export interface AdminHomepageSectionLocalePayload {
    title: string;
    subtitle: string;
}

export interface AdminHomepageSectionPayload {
    sectionKey: string;
    isEnabled: boolean;
    sortOrder: number;
    config: Record<string, unknown> | null;
    vi: AdminHomepageSectionLocalePayload;
    en: AdminHomepageSectionLocalePayload;
}

export interface AdminMenuItemPayload {
    id?: string;
    label: string;
    label_en?: string | null;
    url: string;
    target: "_self" | "_blank";
    parentId?: string | null;
    icon?: string | null;
    sortOrder?: number;
    isActive?: boolean;
}

export interface AdminSiteConfigGroupPayload {
    header: Record<string, string>;
    footer: Record<string, string>;
    general: Record<string, string>;
    menuItems: AdminMenuItemPayload[];
}

export interface AdminServiceSectionPayload {
    id?: string;
    sectionKey: string;
    title: string;
    title_en?: string | null;
    content: string;
    content_en?: string | null;
    sortOrder?: number;
    isActive?: boolean;
}

export interface AdminServiceEditorPayload {
    title: string;
    title_en?: string | null;
    slug: string;
    content: string;
    content_en?: string | null;
    isPublished?: boolean;
    sortOrder?: number;
    metaTitle?: string | null;
    metaTitle_en?: string | null;
    metaDescription?: string | null;
    metaDescription_en?: string | null;
    sections: AdminServiceSectionPayload[];
}

export interface AdminPostEditorPayload {
    title: string;
    title_en?: string | null;
    slug: string;
    excerpt?: string | null;
    excerpt_en?: string | null;
    content: string;
    content_en?: string | null;
    categoryId: string;
    featuredImage?: string | null;
    featuredImage_en?: string | null;
    isFeatured?: boolean;
    isPublished?: boolean;
    metaTitle?: string | null;
    metaTitle_en?: string | null;
    metaDescription?: string | null;
    metaDescription_en?: string | null;
    tagIds: string[];
}

export interface AdminTagPayload {
    name: string;
    slug: string;
}

export interface AdminReviewPayload {
    name: string;
    role?: string | null;
    role_en?: string | null;
    company?: string | null;
    company_en?: string | null;
    content: string;
    content_en?: string | null;
    rating?: number;
    avatarId?: string | null;
    sortOrder?: number;
    isActive?: boolean;
}
