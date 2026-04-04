import path from "node:path";
import {
    closeLandingImportContext,
    createLandingImportContext,
    importLandingCampaign,
    readLegacyLandingPayload,
} from "./lib/landing-import-core";

const SELECTOR_FILES = [
    "dau-thau.json",
    "dh-dong-thap.json",
    "dhkh-hue.json",
    "qldd-nltn.json",
    "qlkt-mo-diachat.json",
    "tccd-gvdh.json",
] as const;

export async function importSelectorLandingCampaigns() {
    const context = await createLandingImportContext();

    try {
        const payloads = await Promise.all(
            SELECTOR_FILES.map(async (fileName) => {
                const { filePath, payload } = await readLegacyLandingPayload(path.join("tuyen-sinh", fileName));
                return {
                    fileName,
                    filePath,
                    payload,
                };
            }),
        );

        const totalPrograms = payloads.reduce((count, entry) => count + Object.keys(entry.payload.programs).length, 0);
        console.log(`Preflight OK: found ${payloads.length} selector campaign file(s) with ${totalPrograms} program(s).`);

        const summaries = [];
        for (const [index, entry] of payloads.entries()) {
            const summary = await importLandingCampaign(context, entry.payload, {
                sourceLabel: path.basename(entry.filePath),
                sortOrder: index + 1,
                isSelectorVisible: true,
                isPublished: true,
            });
            summaries.push(summary);
        }

        console.log(
            `Imported ${summaries.length} selector campaign(s): ${summaries.map((summary) => summary.slug).join(", ")}.`,
        );

        return {
            campaignCount: summaries.length,
            totalPrograms,
            summaries,
        };
    } finally {
        await closeLandingImportContext(context);
    }
}

if (require.main === module) {
    importSelectorLandingCampaigns().catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
