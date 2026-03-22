import { getTranslations } from "next-intl/server";
import VisionMissionPageTemplate from "@/components/about/VisionMissionPageTemplate";

export default async function VisionMissionPage() {
    const t = await getTranslations({ locale: "vi", namespace: "about.visionMission" });

    return (
        <VisionMissionPageTemplate
            title={t("title")}
            visionTitle={t("vision")}
            visionText={t("visionText")}
            missionTitle={t("mission")}
            missionText={t("missionText")}
            coreValuesTitle={t("coreValues")}
            values={[
                { icon: "star", title: t("integrity"), description: t("integrityDesc") },
                { icon: "target", title: t("quality"), description: t("qualityDesc") },
                { icon: "eye", title: t("innovation"), description: t("innovationDesc") },
            ]}
            learnMoreTitle={t("learnMore")}
            links={[
                { href: "/gioi-thieu/co-cau-to-chuc", label: "Cơ cấu tổ chức" },
                { href: "/gioi-thieu/hoi-dong-co-van", label: "Hội đồng cố vấn" },
            ]}
        />
    );
}
