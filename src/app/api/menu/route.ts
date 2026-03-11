import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errors, getLocale } from "@/lib/api-response";

interface MenuItem {
    id: string;
    label: string;
    label_en: string | null;
    url: string;
    target: string;
    icon: string | null;
    children?: MenuItem[];
}

/**
 * GET /api/menu
 * Get navigation menu items for header/navbar
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const locale = getLocale(searchParams);
        // Note: MenuItem doesn't have location field - filter by parent for top-level items

        const menuItems = await prisma.menuItem.findMany({
            where: {
                isActive: true,
                parentId: null, // Get only root items
                locale: locale.toUpperCase(), // Match locale
            },
            orderBy: { sortOrder: "asc" },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: "asc" },
                },
            },
        });

        // Transform menu items based on locale
        const transformedItems = menuItems.map((item) => ({
            id: item.id,
            label: locale === "en" && item.label_en ? item.label_en : item.label,
            url: item.url,
            target: item.target,
            icon: item.icon,
            children: item.children.map((child: MenuItem) => ({
                id: child.id,
                label: locale === "en" && child.label_en ? child.label_en : child.label,
                url: child.url,
                target: child.target,
                icon: child.icon,
            })),
        }));

        return successResponse(transformedItems);
    } catch (error) {
        console.error("Error fetching menu:", error);
        return errors.serverError("Không thể tải menu");
    }
}
