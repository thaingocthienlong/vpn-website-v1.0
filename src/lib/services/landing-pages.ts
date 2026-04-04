import { prisma } from "@/lib/prisma";
import type {
    LandingCampaignContent,
    LandingCampaignPageData,
    LandingCampaignRecord,
    LandingCampaignSelectorItem,
    LandingProgramRecord,
    LegacyLandingProgramContent,
} from "@/lib/landing-page/types";
import { DEFAULT_DISCOVERY_SOURCES } from "@/lib/landing-page/constants";

function parseJson<T>(value: string | null | undefined, fallback: T): T {
    if (!value?.trim()) return fallback;

    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function normalizeCampaign(record: LandingCampaignRecord) {
    const content = parseJson<LandingCampaignContent>(record.contentJson, {});
    const socialLinks = parseJson<LandingCampaignContent["socialLinks"]>(record.socialJson, {});

    return {
        ...record,
        content: {
            heroBadge: "Khoá học Chuyên gia",
            privacyUrl: "/chinh-sach-bao-mat",
            sourceOptions: DEFAULT_DISCOVERY_SOURCES,
            ...content,
            socialLinks: {
                ...socialLinks,
                ...(content.socialLinks || {}),
            },
        },
    };
}

function normalizeProgram(record: LandingProgramRecord) {
    const parsed = parseJson<LegacyLandingProgramContent>(record.contentJson, {
        title: record.title,
    });

    const content: LegacyLandingProgramContent = {
        title: parsed.title || record.title,
        titlePlain: parsed.titlePlain || record.titlePlain || record.title,
        subtitle: parsed.subtitle || record.subtitle || undefined,
        courseId: parsed.courseId || record.courseLabel || record.title,
        curriculumTitle: parsed.curriculumTitle || parsed.titlePlain || record.titlePlain || record.title,
        curriculumDesc: parsed.curriculumDesc || parsed.subtitle || record.subtitle || undefined,
        meta: parsed.meta || [],
        curriculum: parsed.curriculum || [],
        faq: parsed.faq || [],
        contact: parsed.contact || { phones: [] },
        phuluc: parsed.phuluc,
    };

    return {
        ...record,
        title: content.title,
        titlePlain: content.titlePlain,
        subtitle: content.subtitle,
        courseLabel: content.courseId || record.courseLabel,
        content,
    };
}

interface LandingCampaignLookupOptions {
    requireSelectorVisible?: boolean;
}

export async function getPublishedLandingCampaigns(): Promise<LandingCampaignSelectorItem[]> {
    const campaigns = await prisma.landingCampaign.findMany({
        where: {
            isPublished: true,
            isSelectorVisible: true,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: {
            programs: {
                where: { isPublished: true },
                orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
                select: {
                    slug: true,
                },
            },
        },
    });

    return campaigns.map((campaign) => {
        const content = parseJson<LandingCampaignContent>(campaign.contentJson, {});
        return {
            id: campaign.id,
            slug: campaign.slug,
            name: campaign.name,
            shortName: campaign.shortName || campaign.name,
            heritage: campaign.heritage || undefined,
            selectorDescription: campaign.selectorDescription || content.selectorDescription || undefined,
            selectorTag: campaign.selectorTag || content.selectorTag || undefined,
            logoUrl: campaign.logoUrl || undefined,
            programCount: campaign.programs.length,
            defaultProgramSlug: campaign.defaultProgramSlug || campaign.programs[0]?.slug,
        };
    });
}

export async function getPublishedLandingCampaignBySlug(
    slug: string,
    requestedProgramSlug?: string | null,
    options: LandingCampaignLookupOptions = {},
): Promise<LandingCampaignPageData | null> {
    const campaign = await prisma.landingCampaign.findFirst({
        where: {
            slug,
            isPublished: true,
            ...(options.requireSelectorVisible ? { isSelectorVisible: true } : {}),
        },
        include: {
            programs: {
                where: {
                    isPublished: true,
                },
                orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
            },
        },
    });

    if (!campaign || campaign.programs.length === 0) {
        return null;
    }

    const normalizedCampaign = normalizeCampaign(campaign as LandingCampaignRecord);
    const programs = campaign.programs.map((program) => normalizeProgram(program as LandingProgramRecord));
    const programOrder = programs.map((program) => program.slug);
    const programsMap = programs.reduce<Record<string, LandingProgramRecord & { content: LegacyLandingProgramContent }>>((accumulator, program) => {
        accumulator[program.slug] = program;
        return accumulator;
    }, {});

    const activeProgram = programsMap[requestedProgramSlug || ""]
        || programsMap[campaign.defaultProgramSlug || ""]
        || programs.find((program) => program.isDefault)
        || programs[0];

    return {
        campaign: {
            ...normalizedCampaign,
            programsMap,
            programOrder,
        },
        activeProgramKey: activeProgram.slug,
        activeProgram,
    };
}

export async function getPublishedSelectorLandingCampaignBySlug(
    slug: string,
    requestedProgramSlug?: string | null,
) {
    return getPublishedLandingCampaignBySlug(slug, requestedProgramSlug, {
        requireSelectorVisible: true,
    });
}
