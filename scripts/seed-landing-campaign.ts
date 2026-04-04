import { importLegacyLandingCampaign } from "./import-legacy-landing-campaign";

async function main() {
    await importLegacyLandingCampaign("aicbqt05-26.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
