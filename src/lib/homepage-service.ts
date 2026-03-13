import db from "@/lib/prisma";

export async function getHomepageSections(locale: string = 'vi') {
    try {
        const sections = await db.homepageSection.findMany({
            where: {
                locale: 'vi',
                isEnabled: true,
            },
            orderBy: {
                sortOrder: 'asc',
            },
        });
        
        // If the requested locale is English, use the title_en and subtitle_en fields
        if (locale === 'en') {
            return sections.map(sec => ({
                ...sec,
                title: sec.title_en || sec.title,
                subtitle: sec.subtitle_en || sec.subtitle,
            }));
        }

        return sections;
    } catch (error) {
        console.error("Error fetching homepage sections:", error);
        return [];
    }
}
