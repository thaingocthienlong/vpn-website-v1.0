import fs from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import type {
    LandingBenefitItem,
    LandingCampaignContent,
    LegacyLandingProgramContent,
} from "../../src/lib/landing-page/types";
import { DEFAULT_DISCOVERY_SOURCES } from "../../src/lib/landing-page/constants";

export interface LegacyLandingPayload {
    slug: string;
    name: string;
    shortName?: string;
    heritage?: string;
    defaultProgram?: string;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string;
    };
    programs: Record<string, LegacyLandingProgramContent>;
    benefits?: LandingBenefitItem[];
}

export interface LandingImportOptions {
    sourceLabel: string;
    sortOrder: number;
    isSelectorVisible: boolean;
    isPublished: boolean;
}

export interface LandingImportSummary {
    slug: string;
    sourceLabel: string;
    programCount: number;
    defaultProgramSlug: string;
    sortOrder: number;
    isSelectorVisible: boolean;
    isPublished: boolean;
}

export interface LandingImportContext {
    prisma: PrismaClient;
    config: Record<string, string>;
}

function resolveDatabaseUrl() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured.");
    }

    return databaseUrl;
}

function stripHtml(html: string | null | undefined) {
    return (html || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function normalizeLegacyLandingPayload(payload: LegacyLandingPayload): LegacyLandingPayload {
    return {
        ...payload,
        programs: Object.fromEntries(
            Object.entries(payload.programs || {}).map(([programKey, program]) => [
                programKey,
                {
                    ...program,
                    title: program.title || program.titlePlain || payload.name,
                    titlePlain: program.titlePlain || stripHtml(program.title) || programKey,
                    courseId: program.courseId || program.titlePlain || stripHtml(program.title) || programKey,
                    curriculumTitle: program.curriculumTitle || program.titlePlain || stripHtml(program.title) || programKey,
                    contact: {
                        phones: program.contact?.phones || [],
                    },
                    meta: program.meta || [],
                    curriculum: program.curriculum || [],
                    faq: program.faq || [],
                    phuluc: program.phuluc,
                },
            ]),
        ),
    };
}

export async function readLegacyLandingPayload(fileArg: string) {
    const filePath = path.resolve(process.cwd(), fileArg);
    const raw = await fs.readFile(filePath, "utf8");
    const payload = normalizeLegacyLandingPayload(JSON.parse(raw) as LegacyLandingPayload);

    if (!payload.slug || !payload.name || !payload.programs || Object.keys(payload.programs).length === 0) {
        throw new Error(`Legacy landing payload at ${filePath} is missing required campaign fields.`);
    }

    return {
        filePath,
        payload,
    };
}

export async function createLandingImportContext(): Promise<LandingImportContext> {
    const adapter = new PrismaLibSql({ url: resolveDatabaseUrl() });
    const prisma = new PrismaClient({ adapter });

    const configRows = await prisma.configuration.findMany({
        where: {
            key: {
                in: [
                    "general.site_name",
                    "general.organization_name",
                    "general.contact_phone",
                    "general.contact_email",
                    "general.contact_address",
                    "general.social_zalo",
                    "general.logo_url",
                    "header.logo_url",
                    "footer.facebook",
                    "footer.youtube",
                    "footer.zalo",
                    "footer.linkedin",
                    "footer.copyright",
                ],
            },
        },
    });

    const config = configRows.reduce<Record<string, string>>((accumulator, row) => {
        accumulator[row.key] = row.value;
        return accumulator;
    }, {});

    return {
        prisma,
        config,
    };
}

export async function closeLandingImportContext(context: LandingImportContext) {
    await context.prisma.$disconnect();
}

function buildCampaignContent(
    payload: LegacyLandingPayload,
    config: Record<string, string>,
): LandingCampaignContent {
    return {
        benefits: payload.benefits || [],
        selectorTag: config["general.site_name"] || "Viện Phương Nam",
        selectorHeading: "Tuyển sinh 2026",
        heroBadge: "Khoá học Chuyên gia",
        formDescription: "Quý anh/chị vui lòng để lại thông tin, đội ngũ chuyên viên của Viện Phương Nam sẽ chủ động liên hệ hỗ trợ trong thời gian sớm nhất.",
        privacyUrl: "/chinh-sach-bao-mat",
        sourceOptions: DEFAULT_DISCOVERY_SOURCES,
        footerBrandText: config["general.organization_name"] || "VIỆN PHÁT TRIỂN NGUỒN LỰC XÃ HỘI PHƯƠNG NAM",
        footerContact: {
            phone: config["general.contact_phone"] || "0912 114 511",
            email: config["general.contact_email"] || "vanphong@vienphuongnam.com.vn",
            address: "45 Đinh Tiên Hoàng, Phường Sài Gòn, TP. Hồ Chí Minh",
        },
        footerCopyright: config["footer.copyright"] || `© ${new Date().getFullYear()} Viện Phương Nam.`,
        socialLinks: {
            facebook: config["footer.facebook"] || undefined,
            youtube: config["footer.youtube"] || undefined,
            zalo: config["footer.zalo"] || config["general.social_zalo"] || undefined,
            linkedin: config["footer.linkedin"] || undefined,
        },
    };
}

export async function importLandingCampaign(
    context: LandingImportContext,
    payload: LegacyLandingPayload,
    options: LandingImportOptions,
): Promise<LandingImportSummary> {
    const campaignContent = buildCampaignContent(payload, context.config);
    const logoUrl = context.config["header.logo_url"]
        || context.config["general.logo_url"]
        || "https://res.cloudinary.com/drn3cqgz5/image/upload/v1769676877/vienphuongnam/restored/v8twn3w8uyhdqrzx8p3j.png";
    const defaultProgramSlug = payload.defaultProgram || Object.keys(payload.programs)[0];

    const campaign = await context.prisma.landingCampaign.upsert({
        where: { slug: payload.slug },
        update: {
            name: payload.name,
            shortName: payload.shortName || payload.name,
            heritage: payload.heritage || null,
            selectorDescription: payload.seo?.description || null,
            selectorTag: context.config["general.site_name"] || "Viện Phương Nam",
            logoUrl,
            hotline: context.config["general.contact_phone"] || null,
            contactEmail: context.config["general.contact_email"] || null,
            contactAddress: context.config["general.contact_address"] || null,
            seoTitle: payload.seo?.title || payload.name,
            seoDescription: payload.seo?.description || null,
            seoKeywords: payload.seo?.keywords || null,
            defaultProgramSlug,
            socialJson: JSON.stringify(campaignContent.socialLinks || {}),
            contentJson: JSON.stringify(campaignContent),
            isSelectorVisible: options.isSelectorVisible,
            isPublished: options.isPublished,
            sortOrder: options.sortOrder,
        },
        create: {
            slug: payload.slug,
            name: payload.name,
            shortName: payload.shortName || payload.name,
            heritage: payload.heritage || null,
            selectorDescription: payload.seo?.description || null,
            selectorTag: context.config["general.site_name"] || "Viện Phương Nam",
            logoUrl,
            hotline: context.config["general.contact_phone"] || null,
            contactEmail: context.config["general.contact_email"] || null,
            contactAddress: context.config["general.contact_address"] || null,
            seoTitle: payload.seo?.title || payload.name,
            seoDescription: payload.seo?.description || null,
            seoKeywords: payload.seo?.keywords || null,
            defaultProgramSlug,
            socialJson: JSON.stringify(campaignContent.socialLinks || {}),
            contentJson: JSON.stringify(campaignContent),
            isSelectorVisible: options.isSelectorVisible,
            isPublished: options.isPublished,
            sortOrder: options.sortOrder,
        },
    });

    const programEntries = Object.entries(payload.programs);

    for (const [index, [programSlug, programContent]] of programEntries.entries()) {
        await context.prisma.landingProgram.upsert({
            where: {
                campaignId_slug: {
                    campaignId: campaign.id,
                    slug: programSlug,
                },
            },
            update: {
                title: programContent.titlePlain || stripHtml(programContent.title) || programSlug,
                titlePlain: programContent.titlePlain || stripHtml(programContent.title) || programSlug,
                subtitle: programContent.subtitle || null,
                courseLabel: programContent.courseId || programContent.titlePlain || stripHtml(programContent.title) || programSlug,
                contentJson: JSON.stringify(programContent),
                sortOrder: index + 1,
                isDefault: programSlug === defaultProgramSlug,
                isPublished: options.isPublished,
            },
            create: {
                campaignId: campaign.id,
                slug: programSlug,
                title: programContent.titlePlain || stripHtml(programContent.title) || programSlug,
                titlePlain: programContent.titlePlain || stripHtml(programContent.title) || programSlug,
                subtitle: programContent.subtitle || null,
                courseLabel: programContent.courseId || programContent.titlePlain || stripHtml(programContent.title) || programSlug,
                contentJson: JSON.stringify(programContent),
                sortOrder: index + 1,
                isDefault: programSlug === defaultProgramSlug,
                isPublished: options.isPublished,
            },
        });
    }

    await context.prisma.landingProgram.deleteMany({
        where: {
            campaignId: campaign.id,
            slug: {
                notIn: programEntries.map(([programSlug]) => programSlug),
            },
        },
    });

    await context.prisma.landingCampaign.update({
        where: { id: campaign.id },
        data: { defaultProgramSlug },
    });

    return {
        slug: campaign.slug,
        sourceLabel: options.sourceLabel,
        programCount: programEntries.length,
        defaultProgramSlug,
        sortOrder: options.sortOrder,
        isSelectorVisible: options.isSelectorVisible,
        isPublished: options.isPublished,
    };
}
