import path from "node:path";
import {
    closeLandingImportContext,
    createLandingImportContext,
    importLandingCampaign,
    readLegacyLandingPayload,
} from "./lib/landing-import-core";

export async function importLegacyLandingCampaign(fileArg = "aicbqt05-26.json") {
    const { filePath, payload } = await readLegacyLandingPayload(fileArg);
    const context = await createLandingImportContext();

    try {
        const summary = await importLandingCampaign(context, payload, {
            sourceLabel: path.basename(filePath),
            sortOrder: 1,
            isSelectorVisible: payload.slug !== "AICBQT05-26",
            isPublished: true,
        });

        await context.prisma.landingCampaign.updateMany({
            where: {
                slug: "vien-phuong-nam-2026",
                id: {
                    not: (
                        await context.prisma.landingCampaign.findUniqueOrThrow({
                            where: { slug: summary.slug },
                            select: { id: true },
                        })
                    ).id,
                },
            },
            data: {
                isSelectorVisible: false,
                isPublished: false,
            },
        });

        console.log(
            `Imported legacy landing campaign "${summary.slug}" from ${summary.sourceLabel} with ${summary.programCount} program(s).`,
        );

        return summary;
    } finally {
        await closeLandingImportContext(context);
    }
}

if (require.main === module) {
    importLegacyLandingCampaign(process.argv[2]).catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
