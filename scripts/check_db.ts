import { prisma } from '../src/lib/prisma';

async function check() {
    const phuoc = await prisma.staff.findFirst({
        where: { name: { contains: "NGUYỄN VĂN PHƯỚC" } }
    });
    console.log("=== NGUYỄN VĂN PHƯỚC ===");
    console.log(phuoc);

    // Check TS. HUỲNH ĐỨC THIỆN
    const thien = await prisma.staff.findFirst({
        where: { name: { contains: "HUỲNH ĐỨC THIỆN" } }
    });
    console.log("=== HUỲNH ĐỨC THIỆN ===");
    console.log(thien);
}

check().catch(console.error).finally(() => prisma.$disconnect());
