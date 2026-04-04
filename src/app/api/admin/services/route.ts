import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ensureUserExists, requireAdmin } from "@/lib/admin-auth";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody } from "@/lib/validators";
import { adminServiceEditorSchema } from "@/lib/admin/schemas";
import { revalidateServicePaths } from "@/lib/admin/revalidation";

function toSectionCreateData(
    serviceId: string,
    sections: Array<{
        sectionKey: string;
        title: string;
        title_en?: string | null;
        content: string;
        content_en?: string | null;
        sortOrder?: number;
        isActive?: boolean;
    }>,
) {
    return sections.map((section, index) => ({
        entityType: "SERVICE",
        entityId: serviceId,
        sectionKey: section.sectionKey,
        title: section.title,
        title_en: section.title_en || null,
        content: section.content || "",
        content_en: section.content_en || null,
        sortOrder: section.sortOrder ?? index,
        isActive: section.isActive ?? true,
    }));
}

export async function GET(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const search = request.nextUrl.searchParams.get("search") || "";
    const where: Record<string, unknown> = { template: "service" };

    if (search) {
        where.title = { contains: search };
    }

    const services = await prisma.page.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        include: {
            featuredImage: { select: { id: true, url: true, alt: true } },
        },
    });

    return successResponse(services);
}

export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const validation = await validateBody(request, adminServiceEditorSchema);
    if (!validation.success) {
        return errors.validationError(validation.errors);
    }

    const {
        title,
        title_en,
        slug,
        content,
        content_en,
        isPublished,
        sortOrder,
        metaTitle,
        metaTitle_en,
        metaDescription,
        metaDescription_en,
        sections,
    } = validation.data;

    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
        return errors.badRequest("A service with the same slug already exists.");
    }

    const localUserId = await ensureUserExists(authResult.userId);

    const created = await prisma.$transaction(async (tx) => {
        const page = await tx.page.create({
            data: {
                title,
                title_en: title_en || null,
                slug,
                content,
                content_en: content_en || null,
                template: "service",
                isPublished,
                sortOrder,
                metaTitle: metaTitle || null,
                metaTitle_en: metaTitle_en || null,
                metaDescription: metaDescription || null,
                metaDescription_en: metaDescription_en || null,
                authorId: localUserId,
            },
        });

        if (sections.length > 0) {
            await tx.contentSection.createMany({
                data: toSectionCreateData(page.id, sections),
            });
        }

        return page;
    });

    revalidateServicePaths(slug);

    return successResponse(created, undefined, 201);
}
