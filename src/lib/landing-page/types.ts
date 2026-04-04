export interface LandingPhoneContact {
    name?: string;
    number: string;
    display?: string;
}

export interface LandingMetaItem {
    icon: string;
    label: string;
}

export interface LandingCurriculumItem {
    num: string;
    title: string;
    items: string[];
    defaultOpen?: boolean;
}

export interface LandingFaqItem {
    q: string;
    a: string;
}

export interface LandingAppendixSection {
    title: string;
    items?: string[];
    testNote?: string;
    special?: boolean;
}

export interface LandingBenefitItem {
    icon: string;
    title: string;
    desc: string;
}

export interface LegacyLandingProgramContent {
    title: string;
    titlePlain?: string | null;
    subtitle?: string | null;
    courseId?: string | null;
    curriculumTitle?: string | null;
    curriculumDesc?: string | null;
    meta?: LandingMetaItem[];
    curriculum?: LandingCurriculumItem[];
    faq?: LandingFaqItem[];
    contact?: {
        phones?: LandingPhoneContact[];
    };
    phuluc?: {
        title?: string | null;
        description?: string | null;
        sections?: LandingAppendixSection[];
    };
}

export interface LandingCampaignContent {
    benefits?: LandingBenefitItem[];
    selectorTag?: string;
    selectorHeading?: string;
    selectorDescription?: string;
    heroBadge?: string;
    formDescription?: string;
    privacyUrl?: string;
    sourceOptions?: string[];
    footerCopyright?: string;
    footerBrandText?: string;
    footerContact?: {
        phone?: string;
        email?: string;
        address?: string;
    };
    socialLinks?: {
        facebook?: string;
        youtube?: string;
        zalo?: string;
        linkedin?: string;
    };
}

export interface LandingCampaignRecord {
    id: string;
    slug: string;
    name: string;
    shortName?: string | null;
    heritage?: string | null;
    selectorDescription?: string | null;
    selectorTag?: string | null;
    logoUrl?: string | null;
    hotline?: string | null;
    contactEmail?: string | null;
    contactAddress?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
    defaultProgramSlug?: string | null;
    socialJson?: string | null;
    contentJson?: string | null;
}

export interface LandingProgramRecord {
    id: string;
    campaignId: string;
    slug: string;
    title: string;
    titlePlain?: string | null;
    subtitle?: string | null;
    courseLabel?: string | null;
    contentJson: string;
    sortOrder: number;
    isDefault?: boolean;
    isPublished?: boolean;
}

export interface LandingCampaignSelectorItem {
    id: string;
    slug: string;
    name: string;
    shortName: string;
    heritage?: string;
    selectorDescription?: string;
    selectorTag?: string;
    logoUrl?: string;
    programCount: number;
    defaultProgramSlug?: string;
}

export interface LandingCampaignPageData {
    campaign: LandingCampaignRecord & {
        content: LandingCampaignContent;
        programsMap: Record<string, LandingProgramRecord & { content: LegacyLandingProgramContent }>;
        programOrder: string[];
    };
    activeProgramKey: string;
    activeProgram: LandingProgramRecord & { content: LegacyLandingProgramContent };
}

export interface LandingLeadSubmissionInput {
    campaignId: string;
    programId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    gender: string;
    birthday: string;
    province: string;
    position: string;
    workplace: string;
    discoverySource: string;
    discoverySourceOther?: string;
    sourceUrl: string;
    captchaAnswer: string;
    agreementAccepted: boolean;
}
