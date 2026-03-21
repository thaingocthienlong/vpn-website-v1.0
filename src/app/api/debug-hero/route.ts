import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    const section = await prisma.homepageSection.findFirst({
        where: { sectionKey: 'hero', locale: 'vi' }
    });
    
    let dbCourses = [];
    if (section && section.config) {
        const config = JSON.parse(section.config);
        const ids = config.featuredCourseIds || [];
        if (ids.length > 0) {
            dbCourses = await prisma.course.findMany({
                where: { id: { in: ids } },
                select: { id: true, title: true, isPublished: true, isFeatured: true }
            });
        }
    }
    
    return NextResponse.json({
        sectionConfig: section?.config,
        dbCourses
    });
}
