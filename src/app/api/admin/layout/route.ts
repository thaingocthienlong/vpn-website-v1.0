import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, jsonSuccess, jsonError } from "@/lib/admin-auth";

/**
 * GET /api/admin/layout - Get layout configuration (header, footer, navbar)
 */
export async function GET() {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        // Get all layout-related configurations
        const configs = await prisma.configuration.findMany({
            where: {
                group: { in: ["header", "footer", "general"] },
            },
            orderBy: { key: "asc" },
        });

        // Get menu items for navbar
        const menuItems = await prisma.menuItem.findMany({
            where: { locale: "VI" },
            orderBy: { sortOrder: "asc" },
            include: {
                children: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        // Group configs for easier frontend consumption
        const configMap: Record<string, Record<string, string>> = {};
        configs.forEach((c) => {
            if (!configMap[c.group]) configMap[c.group] = {};
            configMap[c.group][c.key] = c.value;
        });

        return jsonSuccess({
            header: configMap["header"] || {},
            footer: configMap["footer"] || {},
            general: configMap["general"] || {},
            menuItems: menuItems.filter((m) => !m.parentId),
        });
    } catch (error) {
        console.error("Error fetching layout config:", error);
        return jsonError("Failed to fetch layout config", 500);
    }
}

/**
 * PUT /api/admin/layout - Update layout configuration OR update a menu item
 */
export async function PUT(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();

        // Menu item update
        if (body.action === "updateMenuItem") {
            const { id, data } = body;
            if (!id) return jsonError("Menu item ID is required", 422);

            const updated = await prisma.menuItem.update({
                where: { id },
                data: {
                    label: data.label,
                    label_en: data.label_en || null,
                    url: data.url,
                    icon: data.icon || null,
                    target: data.target || "_self",
                    parentId: data.parentId || null,
                    isActive: data.isActive,
                    sortOrder: data.sortOrder,
                },
            });
            return jsonSuccess(updated);
        }

        // Toggle menu item active status
        if (body.action === "toggleMenuItem") {
            const { id } = body;
            if (!id) return jsonError("Menu item ID is required", 422);
            const item = await prisma.menuItem.findUnique({ where: { id } });
            if (!item) return jsonError("Menu item not found", 404);
            const updated = await prisma.menuItem.update({
                where: { id },
                data: { isActive: !item.isActive },
            });
            return jsonSuccess(updated);
        }

        // Reorder menu items
        if (body.action === "reorderMenu") {
            const { items } = body as { items: { id: string; sortOrder: number }[] };
            if (!items?.length) return jsonError("Items array is required", 422);

            await prisma.$transaction(
                items.map((item) =>
                    prisma.menuItem.update({
                        where: { id: item.id },
                        data: { sortOrder: item.sortOrder },
                    })
                )
            );
            return jsonSuccess({ reordered: true });
        }

        // Layout config update (existing behavior)
        const { group, configs } = body;
        if (!group || !configs) {
            return jsonError("group and configs are required", 422);
        }

        // Upsert each config value
        const updates = Object.entries(configs as Record<string, string>).map(
            ([key, value]) =>
                prisma.configuration.upsert({
                    where: { key: `${group}.${key}` },
                    update: { value: String(value) },
                    create: {
                        key: `${group}.${key}`,
                        value: String(value),
                        type: "STRING",
                        group,
                        description: key,
                    },
                })
        );

        await Promise.all(updates);
        return jsonSuccess({ updated: true });
    } catch (error) {
        console.error("Error updating layout config:", error);
        return jsonError("Failed to update layout config", 500);
    }
}

/**
 * POST /api/admin/layout - Create a new menu item
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const body = await request.json();
        const { label, label_en, url, icon, target, parentId, locale } = body;

        if (!label || !url) {
            return jsonError("label and url are required", 422);
        }

        // Get the next sortOrder
        const maxSort = await prisma.menuItem.aggregate({
            where: { parentId: parentId || null, locale: locale || "VI" },
            _max: { sortOrder: true },
        });

        const menuItem = await prisma.menuItem.create({
            data: {
                label,
                label_en: label_en || null,
                url,
                icon: icon || null,
                target: target || "_self",
                parentId: parentId || null,
                locale: locale || "VI",
                sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
                isActive: true,
            },
        });

        return jsonSuccess(menuItem, 201);
    } catch (error) {
        console.error("Error creating menu item:", error);
        return jsonError("Failed to create menu item", 500);
    }
}

/**
 * DELETE /api/admin/layout - Delete a menu item
 */
export async function DELETE(request: NextRequest) {
    const authResult = await requireAdmin();
    if ("error" in authResult) return authResult.error;

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return jsonError("Menu item ID is required", 422);

        // Delete children first, then the item
        await prisma.menuItem.deleteMany({ where: { parentId: id } });
        await prisma.menuItem.delete({ where: { id } });

        return jsonSuccess({ deleted: true });
    } catch (error) {
        console.error("Error deleting menu item:", error);
        return jsonError("Failed to delete menu item", 500);
    }
}
