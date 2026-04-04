import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { successResponse, errors } from "@/lib/api-response";
import { validateBody } from "@/lib/validators";
import { adminServiceEditorSchema } from "@/lib/admin/schemas";
import { revalidateServicePaths } from "@/lib/admin/revalidation";

type Params = { params: Promise<{ id: string }> };

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

export async function GET(_request: NextRequest, { params }: Params) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const service = await prisma.page.findFirst({
        where: { id, template: "service" },
        include: {
            featuredImage: { select: { id: true, url: true, alt: true } },
        },
    });

    if (!service) {
        return errors.notFound("Service");
    }

    const sections = await prisma.contentSection.findMany({
        where: {
            entityType: "SERVICE",
            entityId: id,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return successResponse({ ...service, sections });
}

export async function PUT(request: NextRequest, { params }: Params) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const existing = await prisma.page.findFirst({
        where: { id, template: "service" },
    });

    if (!existing) {
        return errors.notFound("Service");
    }

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

    if (slug !== existing.slug) {
        const slugExists = await prisma.page.findUnique({ where: { slug } });
        if (slugExists) {
            return errors.badRequest("A service with the same slug already exists.");
        }
    }

    const updated = await prisma.$transaction(async (tx) => {
        const page = await tx.page.update({
            where: { id },
            data: {
                title,
                title_en: title_en || null,
                slug,
                content,
                content_en: content_en || null,
                isPublished,
                sortOrder,
                metaTitle: metaTitle || null,
                metaTitle_en: metaTitle_en || null,
                metaDescription: metaDescription || null,
                metaDescription_en: metaDescription_en || null,
            },
        });

        await tx.contentSection.deleteMany({
            where: {
                entityType: "SERVICE",
                entityId: id,
            },
        });

        if (sections.length > 0) {
            await tx.contentSection.createMany({
                data: toSectionCreateData(id, sections),
            });
        }

        return page;
    });

    revalidateServicePaths(existing.slug);
    if (slug !== existing.slug) {
        revalidateServicePaths(slug);
    }

    return successResponse(updated);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    const { id } = await params;
    const existing = await prisma.page.findFirst({
        where: { id, template: "service" },
    });

    if (!existing) {
        return errors.notFound("Service");
    }

    await prisma.$transaction([
        prisma.contentSection.deleteMany({
            where: {
                entityType: "SERVICE",
                entityId: id,
            },
        }),
        prisma.page.delete({ where: { id } }),
    ]);

    revalidateServicePaths(existing.slug);

    return successResponse({ deleted: true });
}
